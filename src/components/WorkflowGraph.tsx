import { useCallback, useEffect, useMemo } from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  Node, 
  Edge,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  MarkerType,
  BackgroundVariant
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useWorkflowStore } from '@/lib/store';

interface WorkflowGraphProps {
  className?: string;
}

export function WorkflowGraph({ className }: WorkflowGraphProps) {
  const { workflow } = useWorkflowStore();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Convert n8n workflow to React Flow format
  const convertToReactFlow = useMemo(() => {
    const reactFlowNodes: Node[] = workflow.nodes.map((n8nNode, index) => ({
      id: n8nNode.id,
      position: { 
        x: n8nNode.position[0] || index * 200, 
        y: n8nNode.position[1] || index * 100 
      },
      data: { 
        label: n8nNode.name,
        type: n8nNode.type,
        parameters: n8nNode.parameters,
        disabled: n8nNode.disabled
      },
      type: 'default',
      style: {
        background: n8nNode.disabled ? '#f3f4f6' : 'hsl(var(--node-background))',
        border: `2px solid ${n8nNode.disabled ? '#d1d5db' : 'hsl(var(--node-border))'}`,
        borderRadius: '8px',
        padding: '10px',
        fontSize: '12px',
        color: n8nNode.disabled ? '#6b7280' : 'hsl(var(--foreground))',
        minWidth: '150px',
        textAlign: 'center'
      }
    }));

    const reactFlowEdges: Edge[] = [];
    
    // Convert n8n connections to React Flow edges
    Object.entries(workflow.connections).forEach(([sourceNodeName, connections]) => {
      Object.entries(connections).forEach(([outputType, outputConnections]) => {
        outputConnections.forEach((connectionArray, outputIndex) => {
          connectionArray.forEach((connection) => {
            const sourceNode = workflow.nodes.find(n => n.name === sourceNodeName);
            const targetNode = workflow.nodes.find(n => n.name === connection.node);
            
            if (sourceNode && targetNode) {
              reactFlowEdges.push({
                id: `${sourceNode.id}-${targetNode.id}-${outputIndex}-${connection.index}`,
                source: sourceNode.id,
                target: targetNode.id,
                type: 'smoothstep',
                style: {
                  stroke: 'hsl(var(--connection-line))',
                  strokeWidth: 2,
                },
                markerEnd: {
                  type: MarkerType.ArrowClosed,
                  color: 'hsl(var(--connection-line))',
                },
              });
            }
          });
        });
      });
    });

    return { nodes: reactFlowNodes, edges: reactFlowEdges };
  }, [workflow]);

  // Update nodes and edges when workflow changes
  useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = convertToReactFlow;
    setNodes(newNodes);
    setEdges(newEdges);
  }, [convertToReactFlow, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const nodeTypes = useMemo(() => ({
    default: ({ data, selected }: { data: any; selected: boolean }) => (
      <div 
        className={`px-4 py-2 border-2 rounded-lg bg-node-background transition-all ${
          selected ? 'border-primary shadow-md' : 'border-node-border'
        } ${data.disabled ? 'opacity-60' : ''}`}
      >
        <div className="font-medium text-sm text-foreground">{data.label}</div>
        <div className="text-xs text-muted-foreground mt-1">
          {data.type.split('.').pop()}
        </div>
        {data.disabled && (
          <div className="text-xs text-warning mt-1">Disabled</div>
        )}
      </div>
    ),
  }), []);

  return (
    <div className={`flex flex-col h-full bg-background ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <h2 className="text-lg font-semibold text-foreground">Workflow Graph</h2>
        <div className="text-sm text-muted-foreground">
          {workflow.nodes.length} node{workflow.nodes.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Graph */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-left"
          className="bg-background"
        >
          <Background 
            color="hsl(var(--muted-foreground))" 
            gap={16} 
            size={1}
            variant={BackgroundVariant.Dots}
          />
          <Controls 
            className="bg-card border border-border rounded-lg shadow-sm"
          />
        </ReactFlow>
      </div>
    </div>
  );
}