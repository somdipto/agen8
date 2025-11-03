'use client';

import { useCallback, useMemo } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  ConnectionMode,
  type Connection,
  type OnConnect,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import {
  nodesAtom,
  edgesAtom,
  onNodesChangeAtom,
  onEdgesChangeAtom,
  selectedNodeAtom,
  isGeneratingAtom,
} from '@/lib/workflow-store';
import { TriggerNode } from './nodes/trigger-node';
import { ActionNode } from './nodes/action-node';
import { ConditionNode } from './nodes/condition-node';
import { TransformNode } from './nodes/transform-node';
import { v4 as uuidv4 } from 'uuid';
import { Loader2 } from 'lucide-react';

export function WorkflowCanvas() {
  const [nodes] = useAtom(nodesAtom);
  const [edges, setEdges] = useAtom(edgesAtom);
  const [isGenerating] = useAtom(isGeneratingAtom);
  const onNodesChange = useSetAtom(onNodesChangeAtom);
  const onEdgesChange = useSetAtom(onEdgesChangeAtom);
  const setSelectedNode = useSetAtom(selectedNodeAtom);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nodeTypes = useMemo<Record<string, React.ComponentType<any>>>(
    () => ({
      trigger: TriggerNode,
      action: ActionNode,
      condition: ConditionNode,
      transform: TransformNode,
    }),
    []
  );

  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      const newEdge = {
        id: uuidv4(),
        ...connection,
        type: 'default',
      };
      setEdges([...edges, newEdge]);
    },
    [edges, setEdges]
  );

  const onNodeClick = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (_event: React.MouseEvent, node: any) => {
      setSelectedNode(node.id);
    },
    [setSelectedNode]
  );

  return (
    <div className="relative h-full w-full">
      {isGenerating && (
        <div className="bg-background/80 absolute inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="text-center">
            <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin" />
            <div className="text-lg font-semibold">Generating workflow...</div>
          </div>
        </div>
      )}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={isGenerating ? undefined : onNodesChange}
        onEdgesChange={isGenerating ? undefined : onEdgesChange}
        onConnect={isGenerating ? undefined : onConnect}
        onNodeClick={isGenerating ? undefined : onNodeClick}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        className="bg-background"
        nodesDraggable={!isGenerating}
        nodesConnectable={!isGenerating}
        elementsSelectable={!isGenerating}
      >
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        <Controls
          style={{
            background: 'white',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
          }}
          className="dark:!bg-[hsl(var(--card))]"
        />
        <MiniMap className="!bg-secondary" />
      </ReactFlow>
    </div>
  );
}
