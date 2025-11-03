'use client';

import { Provider } from 'jotai';
import { WorkflowCanvas } from '@/components/workflow/workflow-canvas';
import { NodeLibrary } from '@/components/workflow/node-library';
import { NodeConfigPanel } from '@/components/workflow/node-config-panel';
import { WorkflowToolbar } from '@/components/workflow/workflow-toolbar';

export default function Home() {
  return (
    <Provider>
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
    </Provider>
  );
}
