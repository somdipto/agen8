import { atom } from 'jotai';
import type { Node, Edge, NodeChange, EdgeChange } from '@xyflow/react';
import { applyNodeChanges, applyEdgeChanges } from '@xyflow/react';
import { workflowApi } from './workflow-api';

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

// Atoms for workflow state (now backed by database)
export const nodesAtom = atom<WorkflowNode[]>([]);
export const edgesAtom = atom<WorkflowEdge[]>([]);
export const selectedNodeAtom = atom<string | null>(null);
export const isExecutingAtom = atom(false);
export const isLoadingAtom = atom(false);
export const isGeneratingAtom = atom(false);
export const currentWorkflowIdAtom = atom<string | null>(null);
export const currentWorkflowNameAtom = atom<string>('Untitled');

// Derived atoms for node/edge operations with auto-save
export const onNodesChangeAtom = atom(null, (get, set, changes: NodeChange[]) => {
  const currentNodes = get(nodesAtom);
  const newNodes = applyNodeChanges(changes, currentNodes) as WorkflowNode[];
  set(nodesAtom, newNodes);

  // Auto-save to database
  const currentEdges = get(edgesAtom);
  const workflowId = get(currentWorkflowIdAtom);

  if (workflowId) {
    workflowApi.autoSaveWorkflow(workflowId, { nodes: newNodes, edges: currentEdges });
  }
});

export const onEdgesChangeAtom = atom(null, (get, set, changes: EdgeChange[]) => {
  const currentEdges = get(edgesAtom);
  const newEdges = applyEdgeChanges(changes, currentEdges) as WorkflowEdge[];
  set(edgesAtom, newEdges);

  // Auto-save to database
  const currentNodes = get(nodesAtom);
  const workflowId = get(currentWorkflowIdAtom);

  if (workflowId) {
    workflowApi.autoSaveWorkflow(workflowId, { nodes: currentNodes, edges: newEdges });
  }
});

export const addNodeAtom = atom(null, (get, set, node: WorkflowNode) => {
  const currentNodes = get(nodesAtom);
  const newNodes = [...currentNodes, node];
  set(nodesAtom, newNodes);

  // Auto-save to database
  const currentEdges = get(edgesAtom);
  const workflowId = get(currentWorkflowIdAtom);

  if (workflowId) {
    workflowApi.autoSaveWorkflow(workflowId, { nodes: newNodes, edges: currentEdges });
  }
});

export const updateNodeDataAtom = atom(
  null,
  (get, set, { id, data }: { id: string; data: Partial<WorkflowNodeData> }) => {
    const currentNodes = get(nodesAtom);
    const newNodes = currentNodes.map((node) =>
      node.id === id ? { ...node, data: { ...node.data, ...data } } : node
    );
    set(nodesAtom, newNodes);

    // Auto-save to database
    const currentEdges = get(edgesAtom);
    const workflowId = get(currentWorkflowIdAtom);

    if (workflowId) {
      workflowApi.autoSaveWorkflow(workflowId, { nodes: newNodes, edges: currentEdges });
    }
  }
);

export const deleteNodeAtom = atom(null, (get, set, nodeId: string) => {
  const currentNodes = get(nodesAtom);
  const currentEdges = get(edgesAtom);

  const newNodes = currentNodes.filter((node) => node.id !== nodeId);
  const newEdges = currentEdges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId);

  set(nodesAtom, newNodes);
  set(edgesAtom, newEdges);

  if (get(selectedNodeAtom) === nodeId) {
    set(selectedNodeAtom, null);
  }

  // Auto-save to database
  const workflowId = get(currentWorkflowIdAtom);
  if (workflowId) {
    workflowApi.autoSaveWorkflow(workflowId, { nodes: newNodes, edges: newEdges });
  }
});

export const clearWorkflowAtom = atom(null, (get, set) => {
  set(nodesAtom, []);
  set(edgesAtom, []);
  set(selectedNodeAtom, null);

  // Auto-save to database
  const workflowId = get(currentWorkflowIdAtom);
  if (workflowId) {
    workflowApi.autoSaveWorkflow(workflowId, { nodes: [], edges: [] });
  }
});

// Load workflow from database
export const loadWorkflowAtom = atom(null, async (_get, set) => {
  try {
    set(isLoadingAtom, true);
    const workflow = await workflowApi.getCurrent();
    set(nodesAtom, workflow.nodes);
    set(edgesAtom, workflow.edges);
    if (workflow.id) {
      set(currentWorkflowIdAtom, workflow.id);
    }
  } catch (error) {
    console.error('Failed to load workflow:', error);
  } finally {
    set(isLoadingAtom, false);
  }
});

// Save workflow with a name
export const saveWorkflowAsAtom = atom(
  null,
  async (get, _set, { name, description }: { name: string; description?: string }) => {
    const nodes = get(nodesAtom);
    const edges = get(edgesAtom);

    try {
      const workflow = await workflowApi.create({ name, description, nodes, edges });
      return workflow;
    } catch (error) {
      console.error('Failed to save workflow:', error);
      throw error;
    }
  }
);
