import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWorkflowStore } from '@/lib/store';
import { Send, Loader2, Settings2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { DemoButton } from '@/components/DemoButton';

interface PromptInputProps {
  className?: string;
}

export function PromptInput({ className }: PromptInputProps) {
  const { 
    prompt, 
    setPrompt, 
    generateWorkflow, 
    isLoading, 
    error,
    selectedModel,
    setSelectedModel,
    openaiApiKey,
    setOpenaiApiKey,
    geminiApiKey,
    setGeminiApiKey 
  } = useWorkflowStore();
  
  const [showSettings, setShowSettings] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generateWorkflow();
  };

  const examples = [
    "When I receive an email with attachments, save them to Google Drive and send a Slack notification",
    "Monitor my website for downtime and send SMS alerts when it's down",
    "Sync new Airtable records to my CRM and create calendar events",
    "Process new GitHub issues: assign labels and notify the team on Discord",
    "Backup daily data from MySQL to AWS S3 and send summary reports"
  ];

  return (
    <Card className={`border-border shadow-sm ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground">
            Generate Workflow
          </CardTitle>
          <div className="flex items-center gap-2">
            <DemoButton />
            <Collapsible open={showSettings} onOpenChange={setShowSettings}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Settings2 className="h-4 w-4" />
                  Settings
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">AI Model</Label>
                    <Select value={selectedModel} onValueChange={(value: 'openai' | 'gemini') => setSelectedModel(value)}>
                      <SelectTrigger className="bg-editor-background border-editor-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="openai">OpenAI GPT-4</SelectItem>
                        <SelectItem value="gemini">Google Gemini</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {selectedModel === 'openai' && (
                    <div className="space-y-2">
                      <Label htmlFor="openaiKey" className="text-sm font-medium">
                        OpenAI API Key
                      </Label>
                      <Input
                        id="openaiKey"
                        type="password"
                        placeholder="sk-..."
                        value={openaiApiKey}
                        onChange={(e) => setOpenaiApiKey(e.target.value)}
                        className="bg-editor-background border-editor-border"
                      />
                      <p className="text-xs text-muted-foreground">
                        Get your API key from platform.openai.com
                      </p>
                    </div>
                  )}
                  
                  {selectedModel === 'gemini' && (
                    <div className="space-y-2">
                      <Label htmlFor="geminiKey" className="text-sm font-medium">
                        Gemini API Key
                      </Label>
                      <Input
                        id="geminiKey"
                        type="password"
                        placeholder="AI..."
                        value={geminiApiKey}
                        onChange={(e) => setGeminiApiKey(e.target.value)}
                        className="bg-editor-background border-editor-border"
                      />
                      <p className="text-xs text-muted-foreground">
                        Get your API key from aistudio.google.com
                      </p>
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prompt" className="text-sm font-medium">
              Describe your automation workflow
            </Label>
            <Textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what you want to automate..."
              className="min-h-[120px] bg-editor-background border-editor-border resize-none"
              disabled={isLoading}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full gap-2 bg-gradient-primary"
            disabled={isLoading || !prompt.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Generate Workflow
              </>
            )}
          </Button>
        </form>

        <div className="space-y-3">
          <Label className="text-sm font-medium text-muted-foreground">
            Example prompts:
          </Label>
          <div className="space-y-2">
            {examples.map((example, index) => (
              <button
                key={index}
                onClick={() => setPrompt(example)}
                className="w-full text-left text-sm p-3 rounded-lg bg-code-background hover:bg-muted transition-colors border border-border"
                disabled={isLoading}
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}