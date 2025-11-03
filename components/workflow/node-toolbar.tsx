'use client';

import { useSetAtom, useAtom } from 'jotai';
import { PlayCircle, Zap, GitBranch, RefreshCw } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import {
  addNodeAtom,
  isGeneratingAtom,
  type WorkflowNode,
  type WorkflowNodeType,
} from '@/lib/workflow-store';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

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
  const [isGenerating] = useAtom(isGeneratingAtom);

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
    <div className="bg-background absolute top-4 left-4 z-10 flex border shadow-lg">
      {nodeTemplates.map((template, index) => {
        const Icon = template.icon;
        return (
          <div key={template.type} className="flex">
            <Button
              onClick={() => handleAddNode(template)}
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-none p-1"
              title={template.label}
              disabled={isGenerating}
            >
              <Icon className="h-5 w-5" />
            </Button>
            {index < nodeTemplates.length - 1 && (
              <Separator orientation="vertical" className="bg-border h-10" />
            )}
          </div>
        );
      })}
    </div>
  );
}
