'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
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
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import {
  nodesAtom,
  edgesAtom,
  onNodesChangeAtom,
  onEdgesChangeAtom,
  selectedNodeAtom,
  isGeneratingAtom,
  addNodeAtom,
  type WorkflowNode,
  type WorkflowNodeType,
} from '@/lib/workflow-store';
import { TriggerNode } from './nodes/trigger-node';
import { ActionNode } from './nodes/action-node';
import { ConditionNode } from './nodes/condition-node';
import { TransformNode } from './nodes/transform-node';
import { v4 as uuidv4 } from 'uuid';
import { Loader2, PlayCircle, Zap, GitBranch, RefreshCw } from 'lucide-react';
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

export function WorkflowCanvas() {
  const [nodes] = useAtom(nodesAtom);
  const [edges, setEdges] = useAtom(edgesAtom);
  const [isGenerating] = useAtom(isGeneratingAtom);
  const onNodesChange = useSetAtom(onNodesChangeAtom);
  const onEdgesChange = useSetAtom(onEdgesChangeAtom);
  const setSelectedNode = useSetAtom(selectedNodeAtom);
  const addNode = useSetAtom(addNodeAtom);
  const { screenToFlowPosition } = useReactFlow();

  const [menu, setMenu] = useState<{
    id: string;
    top: number;
    left: number;
    sourceHandle?: string | null;
  } | null>(null);
  const connectingNodeId = useRef<string | null>(null);

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

  const onConnectStart = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (_event: any, { nodeId }: { nodeId: string | null }) => {
      connectingNodeId.current = nodeId;
    },
    []
  );

  const onConnectEnd = useCallback(
    (event: MouseEvent | TouchEvent) => {
      if (!connectingNodeId.current) return;

      const target = event.target as Element;

      // Check if we're not dropping on a node or handle
      const isNode = target.closest('.react-flow__node');
      const isHandle = target.closest('.react-flow__handle');

      if (!isNode && !isHandle) {
        // Get mouse position
        const clientX = 'changedTouches' in event ? event.changedTouches[0].clientX : event.clientX;
        const clientY = 'changedTouches' in event ? event.changedTouches[0].clientY : event.clientY;

        setMenu({
          id: connectingNodeId.current,
          top: clientY,
          left: clientX,
        });
      }

      // Reset the connecting node
      connectingNodeId.current = null;
    },
    [setMenu]
  );

  const onAddNodeFromMenu = useCallback(
    (template: (typeof nodeTemplates)[0]) => {
      if (!menu) return;

      // Get the position in the flow coordinate system
      const position = screenToFlowPosition({
        x: menu.left,
        y: menu.top,
      });

      const newNode: WorkflowNode = {
        id: uuidv4(),
        type: template.type,
        position,
        data: {
          label: template.label,
          description: template.description,
          type: template.type,
          config: template.defaultConfig,
          status: 'idle',
        },
      };

      addNode(newNode);

      // Create connection from the source node to the new node
      const newEdge = {
        id: uuidv4(),
        source: menu.id,
        target: newNode.id,
        type: 'default',
      };
      setEdges([...edges, newEdge]);

      // Close the menu
      setMenu(null);
    },
    [menu, screenToFlowPosition, addNode, edges, setEdges]
  );

  const onPaneClick = useCallback(() => {
    setMenu(null);
  }, []);

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
        onConnectStart={isGenerating ? undefined : onConnectStart}
        onConnectEnd={isGenerating ? undefined : onConnectEnd}
        onNodeClick={isGenerating ? undefined : onNodeClick}
        onPaneClick={onPaneClick}
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

      {menu && (
        <div
          style={{ top: menu.top, left: menu.left }}
          className="bg-background absolute z-50 flex flex-col border shadow-lg"
        >
          {nodeTemplates.map((template, index) => {
            const Icon = template.icon;
            return (
              <div key={template.type}>
                <Button
                  onClick={() => onAddNodeFromMenu(template)}
                  variant="ghost"
                  className="w-full justify-start rounded-none px-2 py-1"
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {template.label}
                </Button>
                {index < nodeTemplates.length - 1 && (
                  <Separator orientation="horizontal" className="bg-border" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
