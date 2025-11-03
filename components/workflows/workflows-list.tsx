'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { workflowApi, type SavedWorkflow } from '@/lib/workflow-api';
import { WorkflowPrompt } from './workflow-prompt';
import { AppHeader } from '@/components/app-header';
import { getRelativeTime } from '@/lib/utils/time';

export function WorkflowsList() {
  const [workflows, setWorkflows] = useState<SavedWorkflow[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      const data = await workflowApi.getAll();
      // Filter out the auto-save workflow
      const filtered = data.filter((w) => w.name !== '__current__');
      setWorkflows(filtered);
    } catch (error) {
      console.error('Failed to load workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewWorkflow = async () => {
    try {
      const newWorkflow = await workflowApi.create({
        name: 'Untitled',
        description: '',
        nodes: [],
        edges: [],
      });
      router.push(`/workflows/${newWorkflow.id}`);
    } catch (error) {
      console.error('Failed to create workflow:', error);
      alert('Failed to create workflow. Please try again.');
    }
  };

  const handleOpenWorkflow = (id: string) => {
    router.push(`/workflows/${id}`);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-semibold">Loading workflows...</div>
          <div className="text-muted-foreground text-sm">Please wait</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background flex min-h-screen flex-col">
      <AppHeader />
      <div className="flex flex-1 flex-col items-center justify-center p-8">
        <div className="w-full max-w-2xl">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-4xl font-bold">Workflow Builder Template</h1>
            <p className="text-muted-foreground text-sm">
              Powered by{' '}
              <a
                href="https://useworkflow.dev/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:no-underline"
              >
                Workflow
              </a>
              ,{' '}
              <a
                href="https://ai-sdk.dev/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:no-underline"
              >
                AI SDK
              </a>
              ,{' '}
              <a
                href="https://vercel.com/ai-gateway"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:no-underline"
              >
                AI Gateway
              </a>
              , and{' '}
              <a
                href="https://ai-sdk.dev/elements"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:no-underline"
              >
                AI Elements
              </a>
            </p>
          </div>
          <WorkflowPrompt />
        </div>
      </div>

      <div className="p-8">
        <div className="mx-auto w-full max-w-2xl">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-muted-foreground text-sm font-medium">
              {workflows.length === 0 ? 'No Workflows' : 'Recent'}
            </h2>
            <Button variant="outline" size="sm" onClick={handleNewWorkflow}>
              <Plus className="mr-2 h-3 w-3" />
              Start from Scratch
            </Button>
          </div>
          {workflows.length > 0 && (
            <div className="divide-y">
              {/* User's workflows */}
              {workflows.map((workflow) => (
                <button
                  key={workflow.id}
                  className="hover:bg-accent/50 flex w-full cursor-pointer flex-col px-4 py-4 text-left transition-colors"
                  onClick={() => handleOpenWorkflow(workflow.id)}
                >
                  <div className="mb-1 flex items-center justify-between gap-4">
                    <div className="min-w-0 truncate font-medium">{workflow.name}</div>
                    <div className="text-muted-foreground flex shrink-0 items-center gap-1 text-xs">
                      <Clock className="h-3 w-3" />
                      <span>{getRelativeTime(workflow.updatedAt)}</span>
                    </div>
                  </div>
                  {workflow.description && (
                    <div className="text-muted-foreground line-clamp-1 text-sm">
                      {workflow.description}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
