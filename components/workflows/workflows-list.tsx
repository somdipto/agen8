'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Clock, FileText } from 'lucide-react';
import { workflowApi, type SavedWorkflow } from '@/lib/workflow-api';
import { UserMenu } from './user-menu';
import { WorkflowPrompt } from './workflow-prompt';

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

  // Starter screen when no workflows
  if (workflows.length === 0) {
    return (
      <div className="bg-background flex min-h-screen flex-col">
        <header className="border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Workflow Builder</h1>
            <UserMenu />
          </div>
        </header>
        <div className="flex flex-1 items-center justify-center p-8">
          <div className="w-full max-w-2xl">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-4xl font-bold">Workflow Builder</h2>
              <p className="text-muted-foreground text-lg">
                Create automated workflows with AI or from scratch
              </p>
            </div>

            <WorkflowPrompt />

            <div className="my-6 flex items-center gap-4">
              <div className="bg-border h-px flex-1"></div>
              <span className="text-muted-foreground text-xs">or</span>
              <div className="bg-border h-px flex-1"></div>
            </div>

            <div className="flex justify-center">
              <Button onClick={handleNewWorkflow} variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Start from Scratch
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Workflows list
  return (
    <div className="bg-background min-h-screen">
      <header className="border-b px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <h1 className="text-xl font-semibold">Workflow Builder</h1>
          <UserMenu />
        </div>
      </header>
      <div className="p-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <WorkflowPrompt />
          </div>

          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Recent Workflows</h2>
              <p className="text-muted-foreground mt-1 text-sm">
                {workflows.length} workflow{workflows.length !== 1 ? 's' : ''}
              </p>
            </div>
            <Button onClick={handleNewWorkflow} variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              New Workflow
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {workflows.map((workflow) => (
              <Card
                key={workflow.id}
                className="cursor-pointer transition-all hover:shadow-lg"
                onClick={() => handleOpenWorkflow(workflow.id)}
              >
                <CardHeader>
                  <CardTitle>{workflow.name}</CardTitle>
                  {workflow.description && (
                    <CardDescription>{workflow.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="text-muted-foreground flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      <span>
                        {workflow.nodes.length} node{workflow.nodes.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{new Date(workflow.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
