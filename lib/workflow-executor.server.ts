import 'server-only';

import type { WorkflowNode, WorkflowEdge } from './workflow-store';
import { sendEmail } from './integrations/resend';
import { createTicket } from './integrations/linear';
import { sendSlackMessage } from './integrations/slack';
import { queryData } from './integrations/database';
import { callApi } from './integrations/api';
import { db } from './db';
import { workflowExecutionLogs, user } from './db/schema';
import { eq } from 'drizzle-orm';

type ExecutionResult = {
  success: boolean;
  data?: unknown;
  error?: string;
};

export interface WorkflowExecutionContext {
  executionId?: string;
  userId?: string;
  input?: Record<string, unknown>;
}

interface UserIntegrations {
  resendApiKey?: string | null;
  resendFromEmail?: string | null;
  linearApiKey?: string | null;
  slackApiKey?: string | null;
}

class ServerWorkflowExecutor {
  private nodes: Map<string, WorkflowNode>;
  private edges: WorkflowEdge[];
  private results: Map<string, ExecutionResult>;
  private context: WorkflowExecutionContext;
  private userIntegrations: UserIntegrations = {};

  constructor(
    nodes: WorkflowNode[],
    edges: WorkflowEdge[],
    context: WorkflowExecutionContext = {}
  ) {
    this.nodes = new Map(nodes.map((n) => [n.id, n]));
    this.edges = edges;
    this.results = new Map();
    this.context = context;
  }

  private async loadUserIntegrations(): Promise<void> {
    if (!this.context.userId) return;

    try {
      const userData = await db.query.user.findFirst({
        where: eq(user.id, this.context.userId),
        columns: {
          resendApiKey: true,
          resendFromEmail: true,
          linearApiKey: true,
          slackApiKey: true,
        },
      });

      if (userData) {
        this.userIntegrations = {
          resendApiKey: userData.resendApiKey,
          resendFromEmail: userData.resendFromEmail,
          linearApiKey: userData.linearApiKey,
          slackApiKey: userData.slackApiKey,
        };
      }
    } catch (error) {
      console.error('Failed to load user integrations:', error);
    }
  }

  private getNextNodes(nodeId: string): string[] {
    return this.edges.filter((edge) => edge.source === nodeId).map((edge) => edge.target);
  }

  private getTriggerNodes(): WorkflowNode[] {
    const nodesWithIncoming = new Set(this.edges.map((e) => e.target));
    return Array.from(this.nodes.values()).filter(
      (node) => node.data.type === 'trigger' && !nodesWithIncoming.has(node.id)
    );
  }

  private async logNodeExecution(
    node: WorkflowNode,
    status: 'running' | 'success' | 'error',
    input?: unknown,
    output?: unknown,
    error?: string
  ): Promise<void> {
    if (!this.context.executionId) return;

    try {
      await db.insert(workflowExecutionLogs).values({
        executionId: this.context.executionId,
        nodeId: node.id,
        nodeName: node.data.label,
        nodeType: node.data.type,
        status,
        input,
        output,
        error,
        completedAt: status !== 'running' ? new Date() : undefined,
      });
    } catch (err) {
      console.error('Failed to log node execution:', err);
    }
  }

  private async executeNode(node: WorkflowNode): Promise<ExecutionResult> {
    try {
      await this.logNodeExecution(node, 'running', this.context.input);

      let result: ExecutionResult = { success: true };

      switch (node.data.type) {
        case 'trigger':
          result = {
            success: true,
            data: {
              triggered: true,
              timestamp: Date.now(),
              input: this.context.input,
            },
          };
          break;

        case 'action':
          const actionType = node.data.config?.actionType as string;
          const endpoint = node.data.config?.endpoint as string;

          // Determine the type of action and execute accordingly
          if (actionType === 'Send Email' || node.data.label.toLowerCase().includes('email')) {
            if (!this.userIntegrations.resendApiKey) {
              result = {
                success: false,
                error: 'Resend API key not configured. Please configure in settings.',
              };
            } else {
              const emailParams = {
                to: (this.context.input?.email as string) || 'user@example.com',
                subject: (this.context.input?.subject as string) || 'Notification',
                body: (this.context.input?.body as string) || 'No content',
                apiKey: this.userIntegrations.resendApiKey,
                fromEmail: this.userIntegrations.resendFromEmail || undefined,
              };
              const emailResult = await sendEmail(emailParams);
              result = { success: emailResult.status === 'success', data: emailResult };
            }
          } else if (
            actionType === 'Send Slack Message' ||
            node.data.label.toLowerCase().includes('slack')
          ) {
            if (!this.userIntegrations.slackApiKey) {
              result = {
                success: false,
                error: 'Slack API key not configured. Please configure in settings.',
              };
            } else {
              const slackParams = {
                channel: (this.context.input?.channel as string) || '#general',
                text: (this.context.input?.message as string) || 'No message',
                apiKey: this.userIntegrations.slackApiKey,
              };
              const slackResult = await sendSlackMessage(slackParams);
              result = { success: slackResult.status === 'success', data: slackResult };
            }
          } else if (
            actionType === 'Create Ticket' ||
            node.data.label.toLowerCase().includes('ticket')
          ) {
            if (!this.userIntegrations.linearApiKey) {
              result = {
                success: false,
                error: 'Linear API key not configured. Please configure in settings.',
              };
            } else {
              const ticketParams = {
                title: (this.context.input?.title as string) || 'New Ticket',
                description: (this.context.input?.description as string) || '',
                apiKey: this.userIntegrations.linearApiKey,
              };
              const ticketResult = await createTicket(ticketParams);
              result = { success: ticketResult.status === 'success', data: ticketResult };
            }
          } else if (
            actionType === 'Database Query' ||
            node.data.label.toLowerCase().includes('database')
          ) {
            const dbResult = await queryData('your_table', {});
            result = { success: dbResult.status === 'success', data: dbResult };
          } else if (actionType === 'HTTP Request' || endpoint) {
            const apiResult = await callApi({
              url: endpoint || 'https://api.example.com/endpoint',
              method: 'POST',
              body: this.context.input,
            });
            result = { success: apiResult.status === 'success', data: apiResult };
          } else {
            result = {
              success: true,
              data: { status: 200, message: 'Action executed successfully' },
            };
          }
          break;

        case 'condition':
          const condition = node.data.config?.condition as string;
          // Evaluate condition (simplified - in production use a safe eval or expression parser)
          // For now, just return true
          const conditionResult = true;
          result = { success: true, data: { condition, result: conditionResult } };
          break;

        case 'transform':
          const transformType = node.data.config?.transformType as string;
          result = {
            success: true,
            data: {
              ...this.context.input,
              transformType,
              transformed: true,
              timestamp: Date.now(),
            },
          };
          break;

        default:
          result = { success: false, error: 'Unknown node type' };
      }

      this.results.set(node.id, result);
      await this.logNodeExecution(node, 'success', this.context.input, result.data);

      return result;
    } catch (error) {
      const errorResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      this.results.set(node.id, errorResult);
      await this.logNodeExecution(node, 'error', this.context.input, undefined, errorResult.error);

      return errorResult;
    }
  }

  private async executeSequentially(
    nodeId: string,
    visited: Set<string> = new Set()
  ): Promise<void> {
    if (visited.has(nodeId)) {
      return; // Prevent cycles
    }

    visited.add(nodeId);
    const node = this.nodes.get(nodeId);
    if (!node) return;

    // Execute current node
    const result = await this.executeNode(node);

    // If successful, execute next nodes
    if (result.success) {
      const nextNodes = this.getNextNodes(nodeId);
      for (const nextNodeId of nextNodes) {
        await this.executeSequentially(nextNodeId, visited);
      }
    }
  }

  async execute(): Promise<Map<string, ExecutionResult>> {
    // Load user integrations before executing
    await this.loadUserIntegrations();

    const triggerNodes = this.getTriggerNodes();

    if (triggerNodes.length === 0) {
      throw new Error('No trigger nodes found');
    }

    // Execute from each trigger node
    for (const trigger of triggerNodes) {
      await this.executeSequentially(trigger.id);
    }

    return this.results;
  }
}

export async function executeWorkflowServer(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  context: WorkflowExecutionContext = {}
): Promise<Map<string, ExecutionResult>> {
  const executor = new ServerWorkflowExecutor(nodes, edges, context);
  return await executor.execute();
}
