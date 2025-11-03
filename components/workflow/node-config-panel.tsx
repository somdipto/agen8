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
import { Trash2, X, Hand, Webhook, Clock, Database, Mail, Ticket, Globe } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Editor from '@monaco-editor/react';

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
              <>
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
                      <SelectGroup>
                        <SelectLabel>System</SelectLabel>
                        <SelectItem value="Manual">
                          <div className="flex items-center gap-2">
                            <Hand className="h-4 w-4" />
                            Manual
                          </div>
                        </SelectItem>
                        <SelectItem value="Schedule">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Schedule
                          </div>
                        </SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>External</SelectLabel>
                        <SelectItem value="Webhook">
                          <div className="flex items-center gap-2">
                            <Webhook className="h-4 w-4" />
                            Webhook
                          </div>
                        </SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>Database</SelectLabel>
                        <SelectItem value="Database Event">
                          <div className="flex items-center gap-2">
                            <Database className="h-4 w-4" />
                            Database Event
                          </div>
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                {/* Webhook fields */}
                {selectedNode.data.config?.triggerType === 'Webhook' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="webhookPath" className="text-xs">
                        Webhook Path
                      </Label>
                      <Input
                        id="webhookPath"
                        value={(selectedNode.data.config?.webhookPath as string) || ''}
                        onChange={(e) => handleUpdateConfig('webhookPath', e.target.value)}
                        placeholder="/webhooks/my-workflow"
                        disabled={isGenerating}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="webhookMethod" className="text-xs">
                        HTTP Method
                      </Label>
                      <Select
                        value={(selectedNode.data.config?.webhookMethod as string) || 'POST'}
                        onValueChange={(value) => handleUpdateConfig('webhookMethod', value)}
                        disabled={isGenerating}
                      >
                        <SelectTrigger id="webhookMethod">
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GET">GET</SelectItem>
                          <SelectItem value="POST">POST</SelectItem>
                          <SelectItem value="PUT">PUT</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {/* Schedule fields */}
                {selectedNode.data.config?.triggerType === 'Schedule' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="scheduleCron" className="text-xs">
                        Cron Expression
                      </Label>
                      <Input
                        id="scheduleCron"
                        value={(selectedNode.data.config?.scheduleCron as string) || ''}
                        onChange={(e) => handleUpdateConfig('scheduleCron', e.target.value)}
                        placeholder="0 9 * * * (every day at 9am)"
                        disabled={isGenerating}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="scheduleTimezone" className="text-xs">
                        Timezone
                      </Label>
                      <Input
                        id="scheduleTimezone"
                        value={(selectedNode.data.config?.scheduleTimezone as string) || ''}
                        onChange={(e) => handleUpdateConfig('scheduleTimezone', e.target.value)}
                        placeholder="America/New_York"
                        disabled={isGenerating}
                      />
                    </div>
                  </>
                )}

                {/* Database Event fields */}
                {selectedNode.data.config?.triggerType === 'Database Event' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="dbEventTable" className="text-xs">
                        Table Name
                      </Label>
                      <Input
                        id="dbEventTable"
                        value={(selectedNode.data.config?.dbEventTable as string) || ''}
                        onChange={(e) => handleUpdateConfig('dbEventTable', e.target.value)}
                        placeholder="users"
                        disabled={isGenerating}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dbEventType" className="text-xs">
                        Event Type
                      </Label>
                      <Select
                        value={(selectedNode.data.config?.dbEventType as string) || 'INSERT'}
                        onValueChange={(value) => handleUpdateConfig('dbEventType', value)}
                        disabled={isGenerating}
                      >
                        <SelectTrigger id="dbEventType">
                          <SelectValue placeholder="Select event" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="INSERT">INSERT</SelectItem>
                          <SelectItem value="UPDATE">UPDATE</SelectItem>
                          <SelectItem value="DELETE">DELETE</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </>
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
                      <SelectGroup>
                        <SelectLabel>Email</SelectLabel>
                        <SelectItem value="Send Email">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            Send Email
                          </div>
                        </SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>Project Management</SelectLabel>
                        <SelectItem value="Create Ticket">
                          <div className="flex items-center gap-2">
                            <Ticket className="h-4 w-4" />
                            Create Ticket
                          </div>
                        </SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>Database</SelectLabel>
                        <SelectItem value="Database Query">
                          <div className="flex items-center gap-2">
                            <Database className="h-4 w-4" />
                            Database Query
                          </div>
                        </SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>API</SelectLabel>
                        <SelectItem value="HTTP Request">
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            HTTP Request
                          </div>
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                {/* Send Email fields */}
                {selectedNode.data.config?.actionType === 'Send Email' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="emailTo" className="text-xs">
                        To (Email Address)
                      </Label>
                      <Input
                        id="emailTo"
                        value={(selectedNode.data.config?.emailTo as string) || ''}
                        onChange={(e) => handleUpdateConfig('emailTo', e.target.value)}
                        placeholder="user@example.com"
                        disabled={isGenerating}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emailSubject" className="text-xs">
                        Subject
                      </Label>
                      <Input
                        id="emailSubject"
                        value={(selectedNode.data.config?.emailSubject as string) || ''}
                        onChange={(e) => handleUpdateConfig('emailSubject', e.target.value)}
                        placeholder="Email subject"
                        disabled={isGenerating}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emailBody" className="text-xs">
                        Body
                      </Label>
                      <Textarea
                        id="emailBody"
                        value={(selectedNode.data.config?.emailBody as string) || ''}
                        onChange={(e) => handleUpdateConfig('emailBody', e.target.value)}
                        placeholder="Email body content"
                        disabled={isGenerating}
                        rows={4}
                      />
                    </div>
                  </>
                )}

                {/* Create Ticket fields */}
                {selectedNode.data.config?.actionType === 'Create Ticket' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="ticketTitle" className="text-xs">
                        Ticket Title
                      </Label>
                      <Input
                        id="ticketTitle"
                        value={(selectedNode.data.config?.ticketTitle as string) || ''}
                        onChange={(e) => handleUpdateConfig('ticketTitle', e.target.value)}
                        placeholder="Bug report title"
                        disabled={isGenerating}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ticketDescription" className="text-xs">
                        Description
                      </Label>
                      <Textarea
                        id="ticketDescription"
                        value={(selectedNode.data.config?.ticketDescription as string) || ''}
                        onChange={(e) => handleUpdateConfig('ticketDescription', e.target.value)}
                        placeholder="Detailed description"
                        disabled={isGenerating}
                        rows={4}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ticketPriority" className="text-xs">
                        Priority
                      </Label>
                      <Select
                        value={(selectedNode.data.config?.ticketPriority as string) || '2'}
                        onValueChange={(value) => handleUpdateConfig('ticketPriority', value)}
                        disabled={isGenerating}
                      >
                        <SelectTrigger id="ticketPriority">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">No Priority</SelectItem>
                          <SelectItem value="1">Urgent</SelectItem>
                          <SelectItem value="2">High</SelectItem>
                          <SelectItem value="3">Medium</SelectItem>
                          <SelectItem value="4">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {/* Database Query fields */}
                {selectedNode.data.config?.actionType === 'Database Query' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="dbQuery" className="text-xs">
                        SQL Query
                      </Label>
                      <div className="overflow-hidden rounded-md border">
                        <Editor
                          height="150px"
                          defaultLanguage="sql"
                          value={(selectedNode.data.config?.dbQuery as string) || ''}
                          onChange={(value) => handleUpdateConfig('dbQuery', value || '')}
                          options={{
                            minimap: { enabled: false },
                            lineNumbers: 'on',
                            scrollBeyondLastLine: false,
                            fontSize: 12,
                            readOnly: isGenerating,
                          }}
                          theme="vs-dark"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dbTable" className="text-xs">
                        Table Name (optional)
                      </Label>
                      <Input
                        id="dbTable"
                        value={(selectedNode.data.config?.dbTable as string) || ''}
                        onChange={(e) => handleUpdateConfig('dbTable', e.target.value)}
                        placeholder="users"
                        disabled={isGenerating}
                      />
                    </div>
                  </>
                )}

                {/* HTTP Request fields */}
                {selectedNode.data.config?.actionType === 'HTTP Request' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="httpMethod" className="text-xs">
                        HTTP Method
                      </Label>
                      <Select
                        value={(selectedNode.data.config?.httpMethod as string) || 'POST'}
                        onValueChange={(value) => handleUpdateConfig('httpMethod', value)}
                        disabled={isGenerating}
                      >
                        <SelectTrigger id="httpMethod">
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GET">GET</SelectItem>
                          <SelectItem value="POST">POST</SelectItem>
                          <SelectItem value="PUT">PUT</SelectItem>
                          <SelectItem value="PATCH">PATCH</SelectItem>
                          <SelectItem value="DELETE">DELETE</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endpoint" className="text-xs">
                        URL
                      </Label>
                      <Input
                        id="endpoint"
                        value={(selectedNode.data.config?.endpoint as string) || ''}
                        onChange={(e) => handleUpdateConfig('endpoint', e.target.value)}
                        placeholder="https://api.example.com/endpoint"
                        disabled={isGenerating}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="httpHeaders" className="text-xs">
                        Headers (JSON)
                      </Label>
                      <div className="overflow-hidden rounded-md border">
                        <Editor
                          height="100px"
                          defaultLanguage="json"
                          value={(selectedNode.data.config?.httpHeaders as string) || '{}'}
                          onChange={(value) => handleUpdateConfig('httpHeaders', value || '{}')}
                          options={{
                            minimap: { enabled: false },
                            lineNumbers: 'off',
                            scrollBeyondLastLine: false,
                            fontSize: 12,
                            readOnly: isGenerating,
                          }}
                          theme="vs-dark"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="httpBody" className="text-xs">
                        Body (JSON)
                      </Label>
                      <div className="overflow-hidden rounded-md border">
                        <Editor
                          height="120px"
                          defaultLanguage="json"
                          value={(selectedNode.data.config?.httpBody as string) || '{}'}
                          onChange={(value) => handleUpdateConfig('httpBody', value || '{}')}
                          options={{
                            minimap: { enabled: false },
                            lineNumbers: 'off',
                            scrollBeyondLastLine: false,
                            fontSize: 12,
                            readOnly: isGenerating,
                          }}
                          theme="vs-dark"
                        />
                      </div>
                    </div>
                  </>
                )}
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
