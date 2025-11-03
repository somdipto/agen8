import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import type { Node, Edge, NodeChange, EdgeChange } from '@xyflow/react';
import { applyNodeChanges, applyEdgeChanges } from '@xyflow/react';

export type WorkflowNodeType = 'trigger' | 'action' | 'condition' | 'transform';

export type WorkflowNodeData = {
  label: string;
  description?: string;
  type: WorkflowNodeType;
  config?: Record<string, unknown>;
  status?: 'idle' | 'running' | 'success' | 'error';
};

export type WorkflowNode = Node<WorkflowNodeData>;
export type WorkflowEdge = Edge;

// Atoms for workflow state
export const nodesAtom = atomWithStorage<WorkflowNode[]>('workflow-nodes', []);
export const edgesAtom = atomWithStorage<WorkflowEdge[]>('workflow-edges', []);
export const selectedNodeAtom = atom<string | null>(null);
export const isExecutingAtom = atom(false);

// Derived atoms for node/edge operations
export const onNodesChangeAtom = atom(
  null,
  (get, set, changes: NodeChange[]) => {
    const currentNodes = get(nodesAtom);
    set(nodesAtom, applyNodeChanges(changes, currentNodes));
  }
);

export const onEdgesChangeAtom = atom(
  null,
  (get, set, changes: EdgeChange[]) => {
    const currentEdges = get(edgesAtom);
    set(edgesAtom, applyEdgeChanges(changes, currentEdges));
  }
);

export const addNodeAtom = atom(
  null,
  (get, set, node: WorkflowNode) => {
    const currentNodes = get(nodesAtom);
    set(nodesAtom, [...currentNodes, node]);
  }
);

export const updateNodeDataAtom = atom(
  null,
  (get, set, { id, data }: { id: string; data: Partial<WorkflowNodeData> }) => {
    const currentNodes = get(nodesAtom);
    set(
      nodesAtom,
      currentNodes.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, ...data } } : node
      )
    );
  }
);

export const deleteNodeAtom = atom(
  null,
  (get, set, nodeId: string) => {
    const currentNodes = get(nodesAtom);
    const currentEdges = get(edgesAtom);
    
    set(nodesAtom, currentNodes.filter((node) => node.id !== nodeId));
    set(edgesAtom, currentEdges.filter(
      (edge) => edge.source !== nodeId && edge.target !== nodeId
    ));
    
    if (get(selectedNodeAtom) === nodeId) {
      set(selectedNodeAtom, null);
    }
  }
);

export const clearWorkflowAtom = atom(
  null,
  (_get, set) => {
    set(nodesAtom, []);
    set(edgesAtom, []);
    set(selectedNodeAtom, null);
  }
);

