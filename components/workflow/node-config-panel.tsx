'use client';

import { useAtom, useSetAtom } from 'jotai';
import {
  selectedNodeAtom,
  nodesAtom,
  updateNodeDataAtom,
  deleteNodeAtom,
  isGeneratingAtom,
} from '@/lib/workflow-store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function NodeConfigPanel() {
  const [selectedNodeId, setSelectedNodeId] = useAtom(selectedNodeAtom);
  const [nodes] = useAtom(nodesAtom);
  const [isGenerating] = useAtom(isGeneratingAtom);
  const updateNodeData = useSetAtom(updateNodeDataAtom);
  const deleteNode = useSetAtom(deleteNodeAtom);

  const selectedNode = nodes.find((node) => node.id === selectedNodeId);

  if (!selectedNode) {
    return (
      <Card className="h-full w-80 rounded-none border-t-0 border-r-0 border-b-0 border-l">
        <CardHeader>
          <CardTitle className="text-lg">Properties</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground text-sm">Select a node to configure</div>
        </CardContent>
      </Card>
    );
  }

  const handleUpdateLabel = (label: string) => {
    updateNodeData({ id: selectedNode.id, data: { label } });
  };

  const handleUpdateDescription = (description: string) => {
    updateNodeData({ id: selectedNode.id, data: { description } });
  };

  const handleUpdateConfig = (key: string, value: string) => {
    const newConfig = { ...selectedNode.data.config, [key]: value };
    updateNodeData({ id: selectedNode.id, data: { config: newConfig } });
  };

  const handleDelete = () => {
    if (selectedNodeId) {
      deleteNode(selectedNodeId);
    }
  };

  const handleClose = () => {
    setSelectedNodeId(null);
  };

  return (
    <Card className="h-full w-80 rounded-none border-t-0 border-r-0 border-b-0 border-l">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg">Properties</CardTitle>
        <Button variant="ghost" size="icon" onClick={handleClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="label">Label</Label>
          <Input
            id="label"
            value={selectedNode.data.label}
            onChange={(e) => handleUpdateLabel(e.target.value)}
            disabled={isGenerating}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={selectedNode.data.description || ''}
            onChange={(e) => handleUpdateDescription(e.target.value)}
            placeholder="Optional description"
            disabled={isGenerating}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Configuration</Label>
          <div className="space-y-2">
            {selectedNode.data.type === 'trigger' && (
              <div className="space-y-2">
                <Label htmlFor="triggerType" className="text-xs">
                  Trigger Type
                </Label>
                <Select
                  value={(selectedNode.data.config?.triggerType as string) || 'Manual'}
                  onValueChange={(value) => handleUpdateConfig('triggerType', value)}
                  disabled={isGenerating}
                >
                  <SelectTrigger id="triggerType">
                    <SelectValue placeholder="Select trigger type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Manual">Manual</SelectItem>
                    <SelectItem value="Webhook">Webhook</SelectItem>
                    <SelectItem value="Schedule">Schedule</SelectItem>
                    <SelectItem value="Database Event">Database Event</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedNode.data.type === 'action' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="actionType" className="text-xs">
                    Action Type
                  </Label>
                  <Select
                    value={(selectedNode.data.config?.actionType as string) || 'HTTP Request'}
                    onValueChange={(value) => handleUpdateConfig('actionType', value)}
                    disabled={isGenerating}
                  >
                    <SelectTrigger id="actionType">
                      <SelectValue placeholder="Select action type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Send Email">Send Email</SelectItem>
                      <SelectItem value="Create Ticket">Create Ticket</SelectItem>
                      <SelectItem value="Database Query">Database Query</SelectItem>
                      <SelectItem value="HTTP Request">HTTP Request</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endpoint" className="text-xs">
                    Endpoint
                  </Label>
                  <Input
                    id="endpoint"
                    value={(selectedNode.data.config?.endpoint as string) || ''}
                    onChange={(e) => handleUpdateConfig('endpoint', e.target.value)}
                    placeholder="https://api.example.com"
                    disabled={isGenerating}
                  />
                </div>
              </>
            )}

            {selectedNode.data.type === 'condition' && (
              <div className="space-y-2">
                <Label htmlFor="condition" className="text-xs">
                  Condition
                </Label>
                <Input
                  id="condition"
                  value={(selectedNode.data.config?.condition as string) || ''}
                  onChange={(e) => handleUpdateConfig('condition', e.target.value)}
                  placeholder="e.g., value > 100"
                  disabled={isGenerating}
                />
              </div>
            )}

            {selectedNode.data.type === 'transform' && (
              <div className="space-y-2">
                <Label htmlFor="transformType" className="text-xs">
                  Transform Type
                </Label>
                <Input
                  id="transformType"
                  value={(selectedNode.data.config?.transformType as string) || ''}
                  onChange={(e) => handleUpdateConfig('transformType', e.target.value)}
                  placeholder="e.g., Map Data, Filter, Aggregate"
                  disabled={isGenerating}
                />
              </div>
            )}
          </div>
        </div>

        <div className="border-t pt-4">
          <Button
            variant="destructive"
            className="w-full"
            onClick={handleDelete}
            disabled={isGenerating}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Node
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
