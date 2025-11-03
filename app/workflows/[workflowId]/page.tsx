'use client';

import { use, useEffect } from 'react';
import { Provider, useSetAtom, useAtom } from 'jotai';
import { WorkflowCanvas } from '@/components/workflow/workflow-canvas';
import { NodeLibrary } from '@/components/workflow/node-library';
import { NodeConfigPanel } from '@/components/workflow/node-config-panel';
import { WorkflowToolbar } from '@/components/workflow/workflow-toolbar';
import {
  nodesAtom,
  edgesAtom,
  currentWorkflowIdAtom,
  currentWorkflowNameAtom,
  isLoadingAtom,
} from '@/lib/workflow-store';
import { AuthProvider } from '@/components/auth/auth-provider';
import { workflowApi } from '@/lib/workflow-api';

function WorkflowEditor({ params }: { params: Promise<{ workflowId: string }> }) {
  const { workflowId } = use(params);
  const [isLoading, setIsLoading] = useAtom(isLoadingAtom);
  const setNodes = useSetAtom(nodesAtom);
  const setEdges = useSetAtom(edgesAtom);
  const setCurrentWorkflowId = useSetAtom(currentWorkflowIdAtom);
  const setCurrentWorkflowName = useSetAtom(currentWorkflowNameAtom);

  useEffect(() => {
    const loadWorkflowData = async () => {
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
    };

    loadWorkflowData();
  }, [workflowId, setCurrentWorkflowId, setCurrentWorkflowName, setNodes, setEdges, setIsLoading]);

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
        <NodeLibrary />
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
