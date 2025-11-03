'use client';

import { useSetAtom } from 'jotai';
import { PlayCircle, Zap, GitBranch, RefreshCw } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { addNodeAtom, type WorkflowNode, type WorkflowNodeType } from '@/lib/workflow-store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const nodeTemplates = [
  {
    type: 'trigger' as WorkflowNodeType,
    label: 'Trigger',
    description: 'Start your workflow',
    icon: PlayCircle,
    defaultConfig: { triggerType: 'Manual' },
  },
  {
    type: 'action' as WorkflowNodeType,
    label: 'Action',
    description: 'Perform an action',
    icon: Zap,
    defaultConfig: { actionType: 'HTTP Request', endpoint: 'https://api.example.com' },
  },
  {
    type: 'condition' as WorkflowNodeType,
    label: 'Condition',
    description: 'Branch your workflow',
    icon: GitBranch,
    defaultConfig: { condition: 'If true' },
  },
  {
    type: 'transform' as WorkflowNodeType,
    label: 'Transform',
    description: 'Transform data',
    icon: RefreshCw,
    defaultConfig: { transformType: 'Map Data' },
  },
];

export function NodeLibrary() {
  const addNode = useSetAtom(addNodeAtom);

  const handleAddNode = (template: typeof nodeTemplates[0]) => {
    const newNode: WorkflowNode = {
      id: uuidv4(),
      type: template.type,
      position: {
        x: Math.random() * 300 + 100,
        y: Math.random() * 300 + 100,
      },
      data: {
        label: template.label,
        description: template.description,
        type: template.type,
        config: template.defaultConfig,
        status: 'idle',
      },
    };

    addNode(newNode);
  };

  return (
    <Card className="h-full w-64 border-r">
      <CardHeader>
        <CardTitle className="text-lg">Node Library</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {nodeTemplates.map((template) => {
          const Icon = template.icon;
          return (
            <button
              key={template.type}
              onClick={() => handleAddNode(template)}
              className="w-full rounded-lg border bg-card p-3 text-left transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <div className="flex items-start gap-3">
                <Icon className="h-5 w-5 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{template.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {template.description}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}

