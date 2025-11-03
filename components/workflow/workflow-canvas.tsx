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
} from '@/lib/workflow-store';
import { TriggerNode } from './nodes/trigger-node';
import { ActionNode } from './nodes/action-node';
import { ConditionNode } from './nodes/condition-node';
import { TransformNode } from './nodes/transform-node';
import { v4 as uuidv4 } from 'uuid';

export function WorkflowCanvas() {
  const [nodes, setNodes] = useAtom(nodesAtom);
  const [edges, setEdges] = useAtom(edgesAtom);
  const onNodesChange = useSetAtom(onNodesChangeAtom);
  const onEdgesChange = useSetAtom(onEdgesChangeAtom);
  const setSelectedNode = useSetAtom(selectedNodeAtom);

  const nodeTypes = useMemo(
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
    (_event: React.MouseEvent, node: any) => {
      setSelectedNode(node.id);
    },
    [setSelectedNode]
  );

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        className="bg-background"
      >
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        <Controls />
        <MiniMap className="!bg-secondary" />
      </ReactFlow>
    </div>
  );
}

