import { useState } from 'react';
import { CodeEditor } from '@/components/CodeEditor';
import { WorkflowGraph } from '@/components/WorkflowGraph';
import { PromptInput } from '@/components/PromptInput';
import { Button } from '@/components/ui/button';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { Code2, GitBranch, Menu, X } from 'lucide-react';
import { useWorkflowStore } from '@/lib/store';

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { workflow } = useWorkflowStore();

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 z-10">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden"
          >
            {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <GitBranch className="h-4 w-4 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">n8n Workflow Studio</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Code2 className="h-4 w-4" />
          <span>{workflow.name}</span>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden bg-card border-r border-border`}>
          <div className="h-full p-4 overflow-y-auto">
            <PromptInput />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <PanelGroup direction="horizontal" className="h-full">
            {/* Code Editor Panel */}
            <Panel defaultSize={50} minSize={30}>
              <CodeEditor className="h-full" />
            </Panel>
            
            <PanelResizeHandle className="w-1 bg-border hover:bg-primary transition-colors" />
            
            {/* Workflow Graph Panel */}
            <Panel defaultSize={50} minSize={30}>
              <WorkflowGraph className="h-full" />
            </Panel>
          </PanelGroup>
        </div>
      </div>
    </div>
  );
};

export default Index;
