'use client';

import { memo } from 'react';
import { type NodeProps } from '@xyflow/react';
import {
  Node,
  NodeHeader,
  NodeTitle,
  NodeDescription,
  NodeContent,
} from '@/components/ai-elements/node';
import { GitBranch } from 'lucide-react';
import type { WorkflowNodeData } from '@/lib/workflow-store';

export const ConditionNode = memo(({ data, selected }: NodeProps<WorkflowNodeData>) => {
  return (
    <Node
      handles={{ target: true, source: true }}
      className={selected ? 'ring-2 ring-primary' : ''}
    >
      <NodeHeader>
        <div className="flex items-center gap-2">
          <GitBranch className="h-4 w-4" />
          <NodeTitle>{data.label}</NodeTitle>
        </div>
        {data.description && <NodeDescription>{data.description}</NodeDescription>}
      </NodeHeader>
      <NodeContent>
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">
            Condition: {data.config?.condition || 'If true'}
          </div>
          {data.status && (
            <div className={`text-xs font-medium ${
              data.status === 'success' ? 'text-green-600' :
              data.status === 'error' ? 'text-red-600' :
              data.status === 'running' ? 'text-blue-600' :
              'text-muted-foreground'
            }`}>
              Status: {data.status}
            </div>
          )}
        </div>
      </NodeContent>
    </Node>
  );
});

ConditionNode.displayName = 'ConditionNode';

