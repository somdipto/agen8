# System Architecture Design

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Workflow     │  │ Code Editor  │  │ Execution    │          │
│  │ Canvas       │  │ (Monaco)     │  │ Dashboard    │          │
│  │ (React Flow) │  │              │  │              │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Application Layer                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Next.js      │  │ API Routes   │  │ Better Auth  │          │
│  │ App Router   │  │              │  │              │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Business Logic Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Workflow     │  │ Code         │  │ AI           │          │
│  │ DevKit       │  │ Generator    │  │ Generator    │          │
│  │ Engine       │  │              │  │              │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Data Layer                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ PostgreSQL   │  │ Drizzle ORM  │  │ Vercel Blob  │          │
│  │ (Neon)       │  │              │  │              │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    External Services Layer                       │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐       │
│  │ OpenAI │ │ Resend │ │ Linear │ │ Slack  │ │ GitHub │       │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘       │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐       │
│  │ Stripe │ │fal.ai  │ │Firecrawl│ │Perplexity│ │v0    │       │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

## Component Architecture

### Frontend Components

```
app/
├── (auth)/                    # Authentication pages
│   ├── login/
│   └── register/
├── (dashboard)/               # Main application
│   ├── workflows/             # Workflow list & management
│   ├── workflows/[id]/        # Workflow editor
│   ├── workflows/[id]/edit/   # Visual canvas editor
│   └── executions/            # Execution history
└── api/                       # API routes
    ├── auth/
    ├── workflows/
    ├── ai/
    └── integration/
```

### State Management Flow

```
User Action
    │
    ▼
React Component
    │
    ▼
Jotai Atom (State)
    │
    ▼
API Client (@/lib/api-client)
    │
    ▼
API Route (/api/*)
    │
    ▼
Business Logic
    │
    ▼
Database (via Drizzle ORM)
```

## Data Flow

### Workflow Creation Flow

```
1. User creates workflow in canvas
   │
   ▼
2. React Flow nodes/edges → JSON structure
   │
   ▼
3. POST /api/workflows
   │
   ▼
4. Validate workflow structure
   │
   ▼
5. Store in PostgreSQL (workflows table)
   │
   ▼
6. Return workflow ID
```

### Workflow Execution Flow

```
1. POST /api/workflows/{id}/execute
   │
   ▼
2. Load workflow definition from DB
   │
   ▼
3. Workflow DevKit processes nodes
   │
   ▼
4. Execute each node sequentially
   │   ├── Trigger nodes (webhook, schedule, manual)
   │   ├── Action nodes (integrations)
   │   └── Conditional nodes (branching logic)
   │
   ▼
5. Log execution to workflow_execution_logs
   │
   ▼
6. Store result in workflow_executions
   │
   ▼
7. Return execution result
```

### Code Generation Flow

```
1. GET /api/workflows/{id}/generate-code
   │
   ▼
2. Load workflow from DB
   │
   ▼
3. Parse nodes and edges
   │
   ▼
4. Generate TypeScript function
   │   ├── Add "use workflow" directive
   │   ├── Map nodes to step functions
   │   ├── Handle data flow between nodes
   │   └── Add type annotations
   │
   ▼
5. Return generated code
```

### AI Workflow Generation Flow

```
1. User provides natural language prompt
   │
   ▼
2. POST /api/ai/generate-workflow
   │
   ▼
3. Send prompt to OpenAI GPT-5 (via AI Gateway)
   │
   ▼
4. AI returns workflow structure (nodes + edges)
   │
   ▼
5. Validate generated workflow
   │
   ▼
6. Return workflow JSON for canvas
```

## Database Schema

```
┌─────────────────┐
│     user        │
├─────────────────┤
│ id              │
│ email           │
│ name            │
│ createdAt       │
└─────────────────┘
        │
        │ 1:N
        ▼
┌─────────────────┐
│   workflows     │
├─────────────────┤
│ id              │
│ userId          │◄────┐
│ name            │     │
│ description     │     │
│ nodes           │     │
│ edges           │     │
│ createdAt       │     │
│ updatedAt       │     │
└─────────────────┘     │
        │               │
        │ 1:N           │
        ▼               │
┌─────────────────────┐ │
│workflow_executions  │ │
├─────────────────────┤ │
│ id                  │ │
│ workflowId          │─┘
│ status              │
│ startedAt           │
│ completedAt         │
│ result              │
└─────────────────────┘
        │
        │ 1:N
        ▼
┌──────────────────────────┐
│workflow_execution_logs   │
├──────────────────────────┤
│ id                       │
│ executionId              │
│ nodeId                   │
│ status                   │
│ input                    │
│ output                   │
│ error                    │
│ timestamp                │
└──────────────────────────┘
```

## Security Architecture

### Authentication Flow

```
1. User submits credentials
   │
   ▼
2. POST /api/auth/sign-in (Better Auth)
   │
   ▼
3. Validate credentials against DB
   │
   ▼
4. Generate session token
   │
   ▼
5. Store session in database
   │
   ▼
6. Set secure HTTP-only cookie
   │
   ▼
7. Return user data
```

### Authorization

```
API Request
    │
    ▼
Better Auth Middleware
    │
    ├─── No session → 401 Unauthorized
    │
    ▼
Extract userId from session
    │
    ▼
Verify resource ownership
    │
    ├─── Not owner → 403 Forbidden
    │
    ▼
Process request
```

## Integration Architecture

### Plugin System

```
lib/steps/
├── ai-gateway/
│   ├── index.ts           # Plugin metadata
│   └── steps.ts           # Step implementations
├── resend/
├── linear/
├── slack/
└── [plugin-name]/
    ├── index.ts           # Export plugin config
    └── steps.ts           # Step functions using fetch
```

### Plugin Structure

```typescript
// index.ts
export const pluginMetadata = {
  name: "service-name",
  displayName: "Service Name",
  description: "Service description",
  steps: [...]
}

// steps.ts
export async function stepName(input: InputType): Promise<OutputType> {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { ... },
    body: JSON.stringify(input)
  });
  return response.json();
}
```

## Deployment Architecture

```
┌─────────────────────────────────────────┐
│           Vercel Platform                │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │     Next.js Application            │ │
│  │  ┌──────────┐  ┌──────────┐       │ │
│  │  │ Static   │  │ Server   │       │ │
│  │  │ Assets   │  │ Functions│       │ │
│  │  └──────────┘  └──────────┘       │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │     Environment Variables          │ │
│  │  - DATABASE_URL                    │ │
│  │  - BETTER_AUTH_SECRET              │ │
│  │  - AI_GATEWAY_API_KEY              │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│         Neon PostgreSQL                  │
│  (Auto-provisioned by Vercel)           │
└─────────────────────────────────────────┘
```

## Performance Considerations

### Caching Strategy
- Static assets cached at CDN edge
- API responses use appropriate cache headers
- Database queries optimized with indexes

### Scalability
- Serverless functions auto-scale with traffic
- Database connection pooling via Neon
- Stateless architecture for horizontal scaling

### Monitoring
- Workflow execution logs for debugging
- Error tracking via execution status
- Performance metrics via Vercel Analytics

## Technology Decisions

### Why Workflow DevKit?
- Native TypeScript support with `"use workflow"` directive
- Type-safe workflow execution
- Automatic code generation from visual workflows
- Built-in logging and error handling

### Why React Flow?
- Mature visual workflow canvas library
- Extensive customization options
- Built-in node/edge management
- Performance optimized for large graphs

### Why Drizzle ORM?
- Type-safe database queries
- Automatic migration generation
- Lightweight with minimal overhead
- Excellent TypeScript integration

### Why Better Auth?
- Modern authentication solution
- Built-in session management
- Easy integration with Next.js
- Secure by default

### Why Direct Fetch in Plugins?
- Reduces supply chain attack surface
- No transitive dependencies from SDKs
- Smaller bundle size
- More control over API calls
