'use client';

import { useAtom, useSetAtom } from 'jotai';
import { Play, Save, MoreVertical, Trash2, Pencil } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  clearWorkflowAtom,
  isExecutingAtom,
  nodesAtom,
  edgesAtom,
  updateNodeDataAtom,
  currentWorkflowIdAtom,
  currentWorkflowNameAtom,
} from '@/lib/workflow-store';
import { executeWorkflow } from '@/lib/workflow-executor';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { workflowApi } from '@/lib/workflow-api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AppHeader } from '@/components/app-header';

export function WorkflowToolbar({}: { workflowId?: string }) {
  const [nodes] = useAtom(nodesAtom);
  const [edges] = useAtom(edgesAtom);
  const [isExecuting, setIsExecuting] = useAtom(isExecutingAtom);
  const clearWorkflow = useSetAtom(clearWorkflowAtom);
  const updateNodeData = useSetAtom(updateNodeDataAtom);
  const [currentWorkflowId] = useAtom(currentWorkflowIdAtom);
  const [workflowName, setWorkflowName] = useAtom(currentWorkflowNameAtom);
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [editingName, setEditingName] = useState(workflowName);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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

  const handleStartEdit = () => {
    setEditingName(workflowName);
    setIsEditing(true);
  };

  const handleSaveWorkflowName = async () => {
    if (!editingName.trim() || !currentWorkflowId) {
      setIsEditing(false);
      return;
    }

    try {
      await workflowApi.update(currentWorkflowId, { name: editingName.trim() });
      setWorkflowName(editingName.trim());
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to rename workflow:', error);
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingName(workflowName);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSaveWorkflowName();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const handleSave = async () => {
    if (!currentWorkflowId) return;

    try {
      await workflowApi.update(currentWorkflowId, { nodes, edges });
    } catch (error) {
      console.error('Failed to save workflow:', error);
      alert('Failed to save workflow. Please try again.');
    }
  };

  const handleClearWorkflow = () => {
    clearWorkflow();
    setShowClearDialog(false);
  };

  const handleDeleteWorkflow = async () => {
    if (!currentWorkflowId) return;

    try {
      await workflowApi.delete(currentWorkflowId);
      setShowDeleteDialog(false);
      router.push('/');
    } catch (error) {
      console.error('Failed to delete workflow:', error);
      alert('Failed to delete workflow. Please try again.');
    }
  };

  const titleElement = isEditing ? (
    <Input
      value={editingName}
      onChange={(e) => setEditingName(e.target.value)}
      onBlur={handleSaveWorkflowName}
      onKeyDown={handleKeyDown}
      className="h-8 w-64"
      autoFocus
    />
  ) : (
    <div className="group flex items-center gap-2">
      <span className="text-xl font-semibold">{workflowName}</span>
      {currentWorkflowId && (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={handleStartEdit}
          title="Rename workflow"
        >
          <Pencil className="h-3 w-3" />
        </Button>
      )}
    </div>
  );

  const actions = (
    <>
      <Button
        onClick={handleExecute}
        disabled={isExecuting || nodes.length === 0}
        variant="ghost"
        size="icon"
        title={isExecuting ? 'Running...' : 'Run workflow'}
      >
        <Play className="h-4 w-4" />
      </Button>
      <Button
        onClick={handleSave}
        variant="ghost"
        size="icon"
        disabled={!currentWorkflowId}
        title="Save workflow"
      >
        <Save className="h-4 w-4" />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" title="More options">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setShowClearDialog(true)} disabled={nodes.length === 0}>
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Clear Workflow</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            disabled={!currentWorkflowId}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Delete Workflow</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );

  return (
    <>
      <AppHeader title={titleElement} showBackButton actions={actions} />

      {/* Clear Workflow Dialog */}
      <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear Workflow</DialogTitle>
            <DialogDescription>
              Are you sure you want to clear all nodes and connections? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowClearDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleClearWorkflow}>
              Clear Workflow
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Workflow Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Workflow</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{workflowName}&rdquo;? This will permanently
              delete the workflow and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteWorkflow}>
              Delete Workflow
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
