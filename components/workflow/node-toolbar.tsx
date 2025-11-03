'use client';

import { useSetAtom } from 'jotai';
import { PlayCircle, Zap, GitBranch, RefreshCw } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { addNodeAtom, type WorkflowNode, type WorkflowNodeType } from '@/lib/workflow-store';
import { Button } from '@/components/ui/button';

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

export function NodeToolbar() {
  const addNode = useSetAtom(addNodeAtom);

  const handleAddNode = (template: (typeof nodeTemplates)[0]) => {
    // Generate random position - this is fine in event handlers
    // eslint-disable-next-line react-hooks/purity
    const randomX = Math.random() * 300 + 100;
    // eslint-disable-next-line react-hooks/purity
    const randomY = Math.random() * 300 + 100;

    const newNode: WorkflowNode = {
      id: uuidv4(),
      type: template.type,
      position: {
        x: randomX,
        y: randomY,
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
    <div className="bg-secondary/30 flex h-full w-14 flex-col gap-1 border-r p-2">
      {nodeTemplates.map((template) => {
        const Icon = template.icon;
        return (
          <Button
            key={template.type}
            onClick={() => handleAddNode(template)}
            variant="ghost"
            size="icon"
            className="h-10 w-10"
            title={template.label}
          >
            <Icon className="h-5 w-5" />
          </Button>
        );
      })}
    </div>
  );
}
