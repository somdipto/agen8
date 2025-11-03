'use client';

import { useEffect } from 'react';
import { Provider, useSetAtom, useAtom } from 'jotai';
import { WorkflowCanvas } from '@/components/workflow/workflow-canvas';
import { NodeLibrary } from '@/components/workflow/node-library';
import { NodeConfigPanel } from '@/components/workflow/node-config-panel';
import { WorkflowToolbar } from '@/components/workflow/workflow-toolbar';
import { loadWorkflowAtom, isLoadingAtom } from '@/lib/workflow-store';

function WorkflowApp() {
  const loadWorkflow = useSetAtom(loadWorkflowAtom);
  const [isLoading] = useAtom(isLoadingAtom);

  useEffect(() => {
    loadWorkflow();
  }, [loadWorkflow]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-semibold">Loading workflow...</div>
          <div className="text-sm text-muted-foreground">Please wait</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <WorkflowToolbar />
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

export default function Home() {
  return (
    <Provider>
      <WorkflowApp />
    </Provider>
  );
}
