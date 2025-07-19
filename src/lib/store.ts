import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { generateWorkflow } from '@/lib/api';

export interface N8nNode {
  id: string;
  name: string;
  type: string;
  position: [number, number];
  parameters: Record<string, any>;
  credentials?: Record<string, any>;
  disabled?: boolean;
  notes?: string;
  webhookId?: string;
}

export interface N8nConnection {
  node: string;
  type: string;
  index: number;
}

export interface N8nWorkflow {
  id?: string;
  name: string;
  nodes: N8nNode[];
  connections: Record<string, Record<string, N8nConnection[][]>>;
  active: boolean;
  settings: Record<string, any>;
  staticData?: Record<string, any>;
  tags?: string[];
  meta?: Record<string, any>;
}

interface WorkflowStore {
  // State
  workflow: N8nWorkflow;
  jsonCode: string;
  isLoading: boolean;
  error: string | null;
  prompt: string;
  selectedModel: 'openai' | 'gemini';
  openaiApiKey: string;
  geminiApiKey: string;
  
  // Actions
  setWorkflow: (workflow: N8nWorkflow) => void;
  setJsonCode: (code: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setPrompt: (prompt: string) => void;
  setSelectedModel: (model: 'openai' | 'gemini') => void;
  setOpenaiApiKey: (key: string) => void;
  setGeminiApiKey: (key: string) => void;
  generateWorkflow: () => Promise<void>;
  exportWorkflow: () => void;
  importWorkflow: (json: string) => void;
}

const defaultWorkflow: N8nWorkflow = {
  name: "Welcome to n8n Studio",
  nodes: [
    {
      id: "start",
      name: "Start Here",
      type: "n8n-nodes-base.start",
      position: [300, 300],
      parameters: {},
      notes: "Click 'Load Demo' or generate a workflow from a prompt!"
    },
    {
      id: "welcome",
      name: "Welcome",
      type: "n8n-nodes-base.noOp",
      position: [500, 300],
      parameters: {},
      notes: "This is your n8n Workflow Studio. Use the sidebar to generate workflows with AI!"
    }
  ],
  connections: {
    "Start Here": {
      "main": [
        [
          {
            "node": "Welcome",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  active: false,
  settings: {
    "executionOrder": "v1"
  },
  tags: ["demo", "welcome"]
};

export const useWorkflowStore = create<WorkflowStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      workflow: defaultWorkflow,
      jsonCode: JSON.stringify(defaultWorkflow, null, 2),
      isLoading: false,
      error: null,
      prompt: "",
      selectedModel: 'openai',
      openaiApiKey: "",
      geminiApiKey: "",

      // Actions
      setWorkflow: (workflow) => {
        set({ workflow });
        set({ jsonCode: JSON.stringify(workflow, null, 2) });
      },

      setJsonCode: (code) => {
        set({ jsonCode: code });
        try {
          const workflow = JSON.parse(code);
          set({ workflow, error: null });
        } catch (error) {
          set({ error: "Invalid JSON format" });
        }
      },

      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      setPrompt: (prompt) => set({ prompt }),
      setSelectedModel: (selectedModel) => set({ selectedModel }),
      setOpenaiApiKey: (openaiApiKey) => set({ openaiApiKey }),
      setGeminiApiKey: (geminiApiKey) => set({ geminiApiKey }),

      generateWorkflow: async () => {
        const { prompt, selectedModel, openaiApiKey, geminiApiKey } = get();
        if (!prompt.trim()) {
          set({ error: "Please enter a workflow description" });
          return;
        }

        set({ isLoading: true, error: null });

        try {
          const apiKey = selectedModel === 'openai' ? openaiApiKey : geminiApiKey;
          const generatedWorkflow = await generateWorkflow(prompt, selectedModel, apiKey);
          set({ 
            workflow: generatedWorkflow,
            jsonCode: JSON.stringify(generatedWorkflow, null, 2),
            error: null 
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to generate workflow'
          });
        } finally {
          set({ isLoading: false });
        }
      },

      exportWorkflow: () => {
        const { workflow } = get();
        const dataStr = JSON.stringify(workflow, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `${workflow.name.replace(/\s+/g, '_')}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
      },

      importWorkflow: (json) => {
        try {
          const workflow = JSON.parse(json);
          set({ 
            workflow,
            jsonCode: JSON.stringify(workflow, null, 2),
            error: null 
          });
        } catch (error) {
          set({ error: "Invalid workflow JSON" });
        }
      },
    }),
    {
      name: 'workflow-store',
    }
  )
);