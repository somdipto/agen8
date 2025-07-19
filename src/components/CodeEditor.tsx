import { useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useWorkflowStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Copy, Download, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CodeEditorProps {
  className?: string;
}

export function CodeEditor({ className }: CodeEditorProps) {
  const { jsonCode, setJsonCode, exportWorkflow, importWorkflow } = useWorkflowStore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setJsonCode(value);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonCode);
      toast({
        title: "Copied!",
        description: "Workflow JSON copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        importWorkflow(content);
        toast({
          title: "Imported!",
          description: "Workflow imported successfully",
        });
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-editor-border bg-editor-background">
        <h2 className="text-lg font-semibold text-foreground">Workflow JSON</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="gap-2"
          >
            <Copy className="h-4 w-4" />
            Copy
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleImport}
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            Import
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={exportWorkflow}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Editor */}
      <div className="flex-1 bg-editor-background">
        <Editor
          height="100%"
          defaultLanguage="json"
          value={jsonCode}
          onChange={handleEditorChange}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            insertSpaces: true,
            wordWrap: 'on',
            theme: 'vs',
            formatOnPaste: true,
            formatOnType: true,
            scrollbar: {
              vertical: 'auto',
              horizontal: 'auto',
            },
          }}
          theme="vs"
        />
      </div>
    </div>
  );
}