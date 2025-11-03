# Workflow Builder

A powerful, n8n-style workflow automation application built with Next.js, React Flow, and Jotai.

![Workflow Builder](https://img.shields.io/badge/Next.js-16.0-black)
![React](https://img.shields.io/badge/React-19.2-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)

## Features

### 🎨 **Visual Workflow Editor**
- Drag-and-drop node-based interface powered by React Flow
- Beautiful, modern UI with Tailwind CSS
- Real-time visual feedback
- Minimap and zoom controls

### 🔧 **Node Types**
1. **Trigger Nodes** - Start your workflow
   - Manual triggers
   - Webhook triggers
   - Scheduled triggers

2. **Action Nodes** - Perform operations
   - HTTP requests
   - Database queries
   - Custom actions

3. **Condition Nodes** - Add logic branching
   - If/else conditions
   - Data validation
   - Route based on criteria

4. **Transform Nodes** - Modify data
   - Map data
   - Filter results
   - Aggregate values

### 💾 **Workflow Management**
- **Export**: Save workflows as JSON files
- **Import**: Load workflows from JSON files
- **Auto-save**: Workflows persist in localStorage
- **Clear**: Reset the entire workflow

### ⚡ **Execution Engine**
- Sequential workflow execution
- Real-time status updates
- Visual execution feedback (running, success, error states)
- Simulated async operations

### 🎯 **Node Configuration**
- Dynamic configuration panel
- Edit node properties on-the-fly
- Type-specific configuration options
- Delete nodes with connection cleanup

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **State Management**: Jotai
- **Workflow Engine**: React Flow (@xyflow/react)
- **Styling**: Tailwind CSS 4
- **UI Components**: AI Elements + Custom shadcn/ui components
- **Icons**: Lucide React
- **Language**: TypeScript

## Getting Started

### Prerequisites
- Node.js 20+
- pnpm (recommended) or npm

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd v8-workflow
\`\`\`

2. Install dependencies:
\`\`\`bash
pnpm install
\`\`\`

3. Run the development server:
\`\`\`bash
pnpm dev
\`\`\`

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Creating a Workflow

1. **Add Nodes**: Click on any node type in the Node Library (left sidebar) to add it to the canvas
2. **Connect Nodes**: Drag from the output handle (right) of one node to the input handle (left) of another
3. **Configure Nodes**: Click on a node to open the configuration panel (right sidebar)
4. **Execute**: Click the "Run" button in the toolbar to execute the workflow

### Keyboard Shortcuts

- **Delete**: Select a node and click the delete button in the properties panel
- **Pan**: Click and drag on the canvas background
- **Zoom**: Use mouse wheel or pinch gesture

### Example Workflow

Here's a simple example workflow:

1. **Trigger Node** → Start the workflow manually
2. **Action Node** → Make an HTTP request to an API
3. **Condition Node** → Check if the response was successful
4. **Transform Node** → Process and format the data

## Project Structure

\`\`\`
v8-workflow/
├── app/
│   ├── page.tsx              # Main application page
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/
│   ├── ai-elements/
│   │   └── node.tsx          # AI Elements Node component
│   ├── ui/                   # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── label.tsx
│   └── workflow/
│       ├── workflow-canvas.tsx      # Main canvas component
│       ├── workflow-toolbar.tsx     # Toolbar with controls
│       ├── node-library.tsx         # Node library sidebar
│       ├── node-config-panel.tsx    # Configuration panel
│       └── nodes/
│           ├── trigger-node.tsx
│           ├── action-node.tsx
│           ├── condition-node.tsx
│           └── transform-node.tsx
├── lib/
│   ├── workflow-store.ts     # Jotai state management
│   ├── workflow-executor.ts  # Workflow execution engine
│   └── utils.ts              # Utility functions
└── package.json
\`\`\`

## State Management

The application uses Jotai for state management with the following atoms:

- `nodesAtom`: Stores all workflow nodes (persisted in localStorage)
- `edgesAtom`: Stores all connections between nodes (persisted in localStorage)
- `selectedNodeAtom`: Tracks the currently selected node
- `isExecutingAtom`: Tracks workflow execution state

## Customization

### Adding New Node Types

1. Create a new node component in `components/workflow/nodes/`
2. Add the node type to `WorkflowNodeType` in `lib/workflow-store.ts`
3. Register the node type in `workflow-canvas.tsx`
4. Add a template in `node-library.tsx`
5. Implement execution logic in `workflow-executor.ts`

### Styling

The application uses Tailwind CSS. Customize colors and themes in `app/globals.css` and `tailwind.config.ts`.

## Deployment

### Build for Production

\`\`\`bash
pnpm build
pnpm start
\`\`\`

### Deploy to Vercel

\`\`\`bash
vercel deploy
\`\`\`

## Features Roadmap

- [ ] Real API integrations
- [ ] Database persistence
- [ ] User authentication
- [ ] Workflow templates
- [ ] Version control for workflows
- [ ] Collaborative editing
- [ ] Advanced node types (loops, subflows)
- [ ] Error handling and retry logic
- [ ] Workflow scheduling
- [ ] Analytics and monitoring

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Acknowledgments

- [n8n](https://n8n.io/) - Inspiration for the workflow automation concept
- [React Flow](https://reactflow.dev/) - Powerful node-based UI library
- [Jotai](https://jotai.org/) - Primitive and flexible state management
- [AI Elements](https://ai-sdk.dev/elements) - Beautiful workflow components
- [Vercel](https://vercel.com/) - Hosting and deployment platform
