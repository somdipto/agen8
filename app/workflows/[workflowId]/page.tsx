'use client';

import { use, useEffect, useCallback } from 'react';
import { Provider, useSetAtom, useAtom } from 'jotai';
import { useSearchParams } from 'next/navigation';
import { WorkflowCanvas } from '@/components/workflow/workflow-canvas';
import { NodeToolbar } from '@/components/workflow/node-toolbar';
import { NodeConfigPanel } from '@/components/workflow/node-config-panel';
import { WorkflowToolbar } from '@/components/workflow/workflow-toolbar';
import {
  nodesAtom,
  edgesAtom,
  currentWorkflowIdAtom,
  currentWorkflowNameAtom,
  isLoadingAtom,
  isGeneratingAtom,
  isExecutingAtom,
  updateNodeDataAtom,
} from '@/lib/workflow-store';
import { AuthProvider } from '@/components/auth/auth-provider';
import { workflowApi } from '@/lib/workflow-api';
import { executeWorkflow } from '@/lib/workflow-executor';

function WorkflowEditor({ params }: { params: Promise<{ workflowId: string }> }) {
  const { workflowId } = use(params);
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useAtom(isLoadingAtom);
  const [isGenerating, setIsGenerating] = useAtom(isGeneratingAtom);
  const [isExecuting, setIsExecuting] = useAtom(isExecutingAtom);
  const [nodes] = useAtom(nodesAtom);
  const [edges] = useAtom(edgesAtom);
  const [currentWorkflowId] = useAtom(currentWorkflowIdAtom);
  const setNodes = useSetAtom(nodesAtom);
  const setEdges = useSetAtom(edgesAtom);
  const setCurrentWorkflowId = useSetAtom(currentWorkflowIdAtom);
  const setCurrentWorkflowName = useSetAtom(currentWorkflowNameAtom);
  const updateNodeData = useSetAtom(updateNodeDataAtom);

  useEffect(() => {
    const loadWorkflowData = async () => {
      const isGeneratingParam = searchParams?.get('generating') === 'true';
      const storedPrompt = sessionStorage.getItem('ai-prompt');
      const storedWorkflowId = sessionStorage.getItem('generating-workflow-id');

      // Check if we should generate
      if (isGeneratingParam && storedPrompt && storedWorkflowId === workflowId) {
        // Clear session storage
        sessionStorage.removeItem('ai-prompt');
        sessionStorage.removeItem('generating-workflow-id');

        // Set generating state
        setIsGenerating(true);
        setCurrentWorkflowId(workflowId);
        setCurrentWorkflowName('AI Generated Workflow');

        try {
          // Stream the AI response
          const response = await fetch('/api/ai/generate-workflow', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: storedPrompt }),
          });

          if (!response.ok) {
            throw new Error('Failed to generate workflow');
          }

          const workflowData = await response.json();

          // Update nodes and edges as they come in
          setNodes(workflowData.nodes || []);
          setEdges(workflowData.edges || []);
          setCurrentWorkflowName(workflowData.name || 'AI Generated Workflow');

          // Save to database
          await workflowApi.update(workflowId, {
            name: workflowData.name,
            description: workflowData.description,
            nodes: workflowData.nodes,
            edges: workflowData.edges,
          });
        } catch (error) {
          console.error('Failed to generate workflow:', error);
          alert('Failed to generate workflow');
        } finally {
          setIsGenerating(false);
        }
      } else {
        // Normal workflow loading
        try {
          setIsLoading(true);
          const workflow = await workflowApi.getById(workflowId);
          setNodes(workflow.nodes);
          setEdges(workflow.edges);
          setCurrentWorkflowId(workflow.id);
          setCurrentWorkflowName(workflow.name);
        } catch (error) {
          console.error('Failed to load workflow:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadWorkflowData();
  }, [
    workflowId,
    searchParams,
    setCurrentWorkflowId,
    setCurrentWorkflowName,
    setNodes,
    setEdges,
    setIsLoading,
    setIsGenerating,
  ]);

  // Keyboard shortcuts
  const handleSave = useCallback(async () => {
    if (!currentWorkflowId || isGenerating) return;
    try {
      await workflowApi.update(currentWorkflowId, { nodes, edges });
    } catch (error) {
      console.error('Failed to save workflow:', error);
    }
  }, [currentWorkflowId, nodes, edges, isGenerating]);

  const handleRun = useCallback(async () => {
    if (isExecuting || nodes.length === 0 || isGenerating) return;
    setIsExecuting(true);
    try {
      await executeWorkflow(nodes, edges, (nodeId, status) => {
        updateNodeData({ id: nodeId, data: { status } });
      });
    } finally {
      setIsExecuting(false);
    }
  }, [isExecuting, nodes, edges, isGenerating, setIsExecuting, updateNodeData]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+S or Ctrl+S to save
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      // Cmd+Enter or Ctrl+Enter to run
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRun();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave, handleRun]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-semibold">Loading workflow...</div>
          <div className="text-muted-foreground text-sm">Please wait</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <WorkflowToolbar workflowId={workflowId} />
      <div className="flex flex-1 overflow-hidden">
        <NodeToolbar />
        <main className="flex-1 overflow-hidden">
          <WorkflowCanvas />
        </main>
        <NodeConfigPanel />
      </div>
    </div>
  );
}

export default function WorkflowPage({ params }: { params: Promise<{ workflowId: string }> }) {
  return (
    <Provider>
      <AuthProvider>
        <WorkflowEditor params={params} />
      </AuthProvider>
    </Provider>
  );
}
