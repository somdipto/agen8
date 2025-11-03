'use client';

import { Settings } from 'lucide-react';
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
import { IntegrationIcon } from '@/components/ui/integration-icon';
import Editor from '@monaco-editor/react';

interface ActionConfigProps {
  config: Record<string, unknown>;
  onUpdateConfig: (key: string, value: string) => void;
  disabled: boolean;
}

export function ActionConfig({ config, onUpdateConfig, disabled }: ActionConfigProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="actionType" className="text-xs">
          Action Type
        </Label>
        <Select
          value={(config?.actionType as string) || 'HTTP Request'}
          onValueChange={(value) => onUpdateConfig('actionType', value)}
          disabled={disabled}
        >
          <SelectTrigger id="actionType">
            <SelectValue placeholder="Select action type" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel className="flex items-center gap-2">
                <Settings className="h-3 w-3" />
                System
              </SelectLabel>
              <SelectItem value="HTTP Request">HTTP Request</SelectItem>
              <SelectItem value="Database Query">Database Query</SelectItem>
            </SelectGroup>
            <SelectGroup>
              <SelectLabel className="flex items-center gap-2">
                <IntegrationIcon integration="resend" />
                Resend
              </SelectLabel>
              <SelectItem value="Send Email">Send Email</SelectItem>
            </SelectGroup>
            <SelectGroup>
              <SelectLabel className="flex items-center gap-2">
                <IntegrationIcon integration="slack" />
                Slack
              </SelectLabel>
              <SelectItem value="Send Slack Message">Send Slack Message</SelectItem>
            </SelectGroup>
            <SelectGroup>
              <SelectLabel className="flex items-center gap-2">
                <IntegrationIcon integration="linear" />
                Linear
              </SelectLabel>
              <SelectItem value="Create Ticket">Create Ticket</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Send Email fields */}
      {config?.actionType === 'Send Email' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="emailTo" className="text-xs">
              To (Email Address)
            </Label>
            <Input
              id="emailTo"
              value={(config?.emailTo as string) || ''}
              onChange={(e) => onUpdateConfig('emailTo', e.target.value)}
              placeholder="user@example.com"
              disabled={disabled}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emailSubject" className="text-xs">
              Subject
            </Label>
            <Input
              id="emailSubject"
              value={(config?.emailSubject as string) || ''}
              onChange={(e) => onUpdateConfig('emailSubject', e.target.value)}
              placeholder="Email subject"
              disabled={disabled}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emailBody" className="text-xs">
              Body
            </Label>
            <Textarea
              id="emailBody"
              value={(config?.emailBody as string) || ''}
              onChange={(e) => onUpdateConfig('emailBody', e.target.value)}
              placeholder="Email body content"
              disabled={disabled}
              rows={4}
            />
          </div>
        </>
      )}

      {/* Send Slack Message fields */}
      {config?.actionType === 'Send Slack Message' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="slackChannel" className="text-xs">
              Channel
            </Label>
            <Input
              id="slackChannel"
              value={(config?.slackChannel as string) || ''}
              onChange={(e) => onUpdateConfig('slackChannel', e.target.value)}
              placeholder="#general or @username"
              disabled={disabled}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slackMessage" className="text-xs">
              Message
            </Label>
            <Textarea
              id="slackMessage"
              value={(config?.slackMessage as string) || ''}
              onChange={(e) => onUpdateConfig('slackMessage', e.target.value)}
              placeholder="Your message text"
              disabled={disabled}
              rows={4}
            />
          </div>
        </>
      )}

      {/* Create Ticket fields */}
      {config?.actionType === 'Create Ticket' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="ticketTitle" className="text-xs">
              Ticket Title
            </Label>
            <Input
              id="ticketTitle"
              value={(config?.ticketTitle as string) || ''}
              onChange={(e) => onUpdateConfig('ticketTitle', e.target.value)}
              placeholder="Bug report title"
              disabled={disabled}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ticketDescription" className="text-xs">
              Description
            </Label>
            <Textarea
              id="ticketDescription"
              value={(config?.ticketDescription as string) || ''}
              onChange={(e) => onUpdateConfig('ticketDescription', e.target.value)}
              placeholder="Detailed description"
              disabled={disabled}
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ticketPriority" className="text-xs">
              Priority
            </Label>
            <Select
              value={(config?.ticketPriority as string) || '2'}
              onValueChange={(value) => onUpdateConfig('ticketPriority', value)}
              disabled={disabled}
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
      {config?.actionType === 'Database Query' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="dbQuery" className="text-xs">
              SQL Query
            </Label>
            <div className="overflow-hidden rounded-md border">
              <Editor
                height="150px"
                defaultLanguage="sql"
                value={(config?.dbQuery as string) || ''}
                onChange={(value) => onUpdateConfig('dbQuery', value || '')}
                options={{
                  minimap: { enabled: false },
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  fontSize: 12,
                  readOnly: disabled,
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
              value={(config?.dbTable as string) || ''}
              onChange={(e) => onUpdateConfig('dbTable', e.target.value)}
              placeholder="users"
              disabled={disabled}
            />
          </div>
        </>
      )}

      {/* HTTP Request fields */}
      {config?.actionType === 'HTTP Request' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="httpMethod" className="text-xs">
              HTTP Method
            </Label>
            <Select
              value={(config?.httpMethod as string) || 'POST'}
              onValueChange={(value) => onUpdateConfig('httpMethod', value)}
              disabled={disabled}
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
              value={(config?.endpoint as string) || ''}
              onChange={(e) => onUpdateConfig('endpoint', e.target.value)}
              placeholder="https://api.example.com/endpoint"
              disabled={disabled}
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
                value={(config?.httpHeaders as string) || '{}'}
                onChange={(value) => onUpdateConfig('httpHeaders', value || '{}')}
                options={{
                  minimap: { enabled: false },
                  lineNumbers: 'off',
                  scrollBeyondLastLine: false,
                  fontSize: 12,
                  readOnly: disabled,
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
                value={(config?.httpBody as string) || '{}'}
                onChange={(value) => onUpdateConfig('httpBody', value || '{}')}
                options={{
                  minimap: { enabled: false },
                  lineNumbers: 'off',
                  scrollBeyondLastLine: false,
                  fontSize: 12,
                  readOnly: disabled,
                }}
                theme="vs-dark"
              />
            </div>
          </div>
        </>
      )}
    </>
  );
}
