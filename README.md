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
- **Database Persistence**: Workflows stored in PostgreSQL with Drizzle ORM
- **Auto-save**: Changes automatically saved to database (2-second debounce)
- **Save As**: Create named workflow versions
- **Export**: Download workflows as JSON files
- **Import**: Load workflows from JSON files
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
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Better Auth
- **Workflow Engine**: React Flow (@xyflow/react)
- **Styling**: Tailwind CSS 4
- **UI Components**: AI Elements + Custom shadcn/ui components
- **Icons**: Lucide React
- **Language**: TypeScript

## Getting Started

### Prerequisites
- Node.js 20+
- pnpm (recommended) or npm
- PostgreSQL 14+ (local or cloud)

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

3. Set up environment variables:
\`\`\`bash
# Create a .env.local file
cat > .env.local << EOF
DATABASE_URL=postgres://localhost:5432/workflow
BETTER_AUTH_SECRET=your-secret-key-here
BETTER_AUTH_URL=http://localhost:3000

# Optional: Social auth providers
# GITHUB_CLIENT_ID=your-github-client-id
# GITHUB_CLIENT_SECRET=your-github-client-secret
# GOOGLE_CLIENT_ID=your-google-client-id
# GOOGLE_CLIENT_SECRET=your-google-client-secret
EOF

# Generate a secure secret key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
\`\`\`

4. Set up the database:
\`\`\`bash
# Generate and push the database schema
pnpm db:push
\`\`\`

5. Run the development server:
\`\`\`bash
pnpm dev
\`\`\`

6. Open [http://localhost:3000](http://localhost:3000) and create an account

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

## Authentication

The app uses **Better Auth** for authentication with the following features:

- **Email/Password Authentication**: Users can sign up and sign in with email and password
- **Session Management**: Secure session handling with token-based authentication
- **Social Providers** (Optional): GitHub and Google OAuth support
- **Protected Routes**: All workflow pages require authentication
- **User-specific Data**: Workflows are scoped to individual users

### Setting Up Social Providers

**GitHub OAuth:**
1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create a new OAuth App
3. Set Homepage URL to `http://localhost:3000`
4. Set Authorization callback URL to `http://localhost:3000/api/auth/callback/github`
5. Copy Client ID and Client Secret to `.env.local`

**Google OAuth:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project and enable Google+ API
3. Create OAuth 2.0 credentials
4. Add `http://localhost:3000` to Authorized JavaScript origins
5. Add `http://localhost:3000/api/auth/callback/google` to Authorized redirect URIs
6. Copy Client ID and Client Secret to `.env.local`

## Database Setup

### Local PostgreSQL

\`\`\`bash
# Install PostgreSQL (macOS with Homebrew)
brew install postgresql
brew services start postgresql

# Create database
createdb workflow

# Set DATABASE_URL in .env.local
echo "DATABASE_URL=postgres://localhost:5432/workflow" > .env.local

# Push schema to database
pnpm db:push
\`\`\`

### Cloud Database Options

**Neon (Recommended - Free tier available):**
\`\`\`bash
# Sign up at https://neon.tech
# Copy connection string to .env.local
DATABASE_URL=postgres://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb
\`\`\`

**Vercel Postgres:**
\`\`\`bash
# Create database in Vercel dashboard
# Copy connection string
DATABASE_URL=postgres://default:xxx@xxx.postgres.vercel-storage.com:5432/verceldb
\`\`\`

**Supabase:**
\`\`\`bash
# Create project at https://supabase.com
# Copy connection string from Settings > Database
DATABASE_URL=postgres://postgres:password@db.xxx.supabase.co:5432/postgres
\`\`\`

### Database Commands

\`\`\`bash
# Generate migrations
pnpm db:generate

# Push schema changes to database
pnpm db:push

# Open Drizzle Studio (database GUI)
pnpm db:studio
\`\`\`

## State Management

The application uses Jotai for state management with the following atoms:

- `nodesAtom`: Stores all workflow nodes (persisted in database)
- `edgesAtom`: Stores all connections between nodes (persisted in database)
- `selectedNodeAtom`: Tracks the currently selected node
- `isExecutingAtom`: Tracks workflow execution state
- `isLoadingAtom`: Tracks workflow loading state

All changes are automatically saved to the database with a 2-second debounce to optimize performance.

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
