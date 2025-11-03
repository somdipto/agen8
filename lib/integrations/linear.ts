import 'server-only';
import { LinearClient, Issue } from '@linear/sdk';

let linearClient: LinearClient | null = null;

function getLinearClient(): LinearClient {
  if (!linearClient) {
    const apiKey = process.env.LINEAR_API_KEY;
    if (!apiKey) {
      throw new Error('LINEAR_API_KEY environment variable is not set');
    }
    linearClient = new LinearClient({ apiKey });
  }
  return linearClient;
}

export interface CreateTicketParams {
  title: string;
  description: string;
  teamId?: string;
  priority?: number;
  labels?: string[];
  assigneeId?: string;
}

export interface CreateTicketResult {
  status: 'success' | 'error';
  id?: string;
  url?: string;
  error?: string;
}

/**
 * Create a ticket in Linear
 */
export async function createTicket(params: CreateTicketParams): Promise<CreateTicketResult> {
  try {
    const client = getLinearClient();

    // Get the first team if no teamId is provided
    let teamId = params.teamId;
    if (!teamId) {
      const teams = await client.teams();
      const firstTeam = await teams.nodes[0];
      if (!firstTeam) {
        throw new Error('No teams found in Linear workspace');
      }
      teamId = firstTeam.id;
    }

    const issueInput: {
      title: string;
      description: string;
      teamId: string;
      priority?: number;
      assigneeId?: string;
      labelIds?: string[];
    } = {
      title: params.title,
      description: params.description,
      teamId,
    };

    if (params.priority) {
      issueInput.priority = params.priority;
    }

    if (params.assigneeId) {
      issueInput.assigneeId = params.assigneeId;
    }

    if (params.labels && params.labels.length > 0) {
      issueInput.labelIds = params.labels;
    }

    const issuePayload = await client.createIssue(issueInput);
    const issue = await issuePayload.issue;

    if (!issue) {
      throw new Error('Failed to create issue');
    }

    return {
      status: 'success',
      id: issue.id,
      url: issue.url,
    };
  } catch (error) {
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get a ticket from Linear
 */
export async function getTicket(issueId: string): Promise<Issue | null> {
  try {
    const client = getLinearClient();
    const issue = await client.issue(issueId);
    return issue;
  } catch (error) {
    console.error('Error fetching Linear ticket:', error);
    return null;
  }
}

/**
 * Update a ticket in Linear
 */
export async function updateTicket(
  issueId: string,
  updates: Partial<{
    title: string;
    description: string;
    priority?: number;
    assigneeId?: string;
    labelIds?: string[];
  }>
): Promise<CreateTicketResult> {
  try {
    const client = getLinearClient();
    const issue = await client.issue(issueId);

    if (!issue) {
      throw new Error('Issue not found');
    }

    await issue.update(updates);

    return {
      status: 'success',
      id: issueId,
      url: issue.url,
    };
  } catch (error) {
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
