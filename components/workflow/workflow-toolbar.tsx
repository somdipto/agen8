'use client';

import { useAtom, useSetAtom } from 'jotai';
import { Play, Download, Upload, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { clearWorkflowAtom, isExecutingAtom, nodesAtom, edgesAtom, updateNodeDataAtom } from '@/lib/workflow-store';
import { executeWorkflow } from '@/lib/workflow-executor';

export function WorkflowToolbar() {
  const [nodes] = useAtom(nodesAtom);
  const [edges] = useAtom(edgesAtom);
  const [isExecuting, setIsExecuting] = useAtom(isExecutingAtom);
  const clearWorkflow = useSetAtom(clearWorkflowAtom);
  const updateNodeData = useSetAtom(updateNodeDataAtom);

  const handleExecute = async () => {
    setIsExecuting(true);
    try {
      await executeWorkflow(nodes, edges, (nodeId, status) => {
        updateNodeData({ id: nodeId, data: { status } });
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleExport = () => {
    const workflow = { nodes, edges };
    const blob = new Blob([JSON.stringify(workflow, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workflow-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const workflow = JSON.parse(text);
        // We'll use the storage mechanism which will trigger an update
        if (workflow.nodes && workflow.edges) {
          localStorage.setItem('workflow-nodes', JSON.stringify(workflow.nodes));
          localStorage.setItem('workflow-edges', JSON.stringify(workflow.edges));
          window.location.reload();
        }
      } catch (error) {
        console.error('Failed to import workflow:', error);
        alert('Failed to import workflow. Please check the file format.');
      }
    };
    input.click();
  };

  const handleClear = () => {
    if (confirm('Are you sure you want to clear the entire workflow?')) {
      clearWorkflow();
    }
  };

  return (
    <div className="flex items-center justify-between border-b bg-background px-4 py-3">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-semibold">Workflow Builder</h1>
        <span className="text-sm text-muted-foreground">
          {nodes.length} nodes, {edges.length} connections
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          onClick={handleExecute}
          disabled={isExecuting || nodes.length === 0}
          size="sm"
        >
          <Play className="h-4 w-4" />
          {isExecuting ? 'Running...' : 'Run'}
        </Button>
        <Button onClick={handleExport} variant="outline" size="sm" disabled={nodes.length === 0}>
          <Download className="h-4 w-4" />
          Export
        </Button>
        <Button onClick={handleImport} variant="outline" size="sm">
          <Upload className="h-4 w-4" />
          Import
        </Button>
        <Button
          onClick={handleClear}
          variant="destructive"
          size="sm"
          disabled={nodes.length === 0}
        >
          <Trash2 className="h-4 w-4" />
          Clear
        </Button>
      </div>
    </div>
  );
}

