# CLAUDE.md — Ticket Management System

## Project Overview

Full-stack **Next.js 16 (App Router)** ticket management application with:
- MongoDB/Mongoose for persistence
- NextAuth v4 (Google OAuth) for authentication
- Built-in **MCP HTTP server** at `GET|POST /api/mcp` (JSON-RPC 2.0)
- Standalone **MCP stdio server** in `mcp-server/`
- Vite/React chat client in `mcp-chat-client/`

The app is the **data source** for the `generative-ui-agents-server` — the Python agent backend calls this app's MCP endpoint to fetch/mutate data.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16, React 19, TypeScript 5 |
| Styling | Tailwind CSS 4, shadcn/ui (Radix UI primitives) |
| Database | MongoDB via Mongoose 9 |
| Auth | NextAuth v4, Google OAuth, JWT session |
| Forms | react-hook-form 7 + Zod 3 |
| Tables | TanStack Table 8 |
| Drag & Drop | dnd-kit (core + sortable) |
| MCP | @modelcontextprotocol/sdk 1.x |
| Icons | lucide-react |

---

## Directory Structure

```
Ticket-Management-System/
├── app/                          # Next.js App Router
│   ├── actions/                  # Server Actions (DB mutations/queries)
│   │   ├── createTicket.ts
│   │   ├── updateTicket.ts
│   │   ├── createProject.ts
│   │   ├── updateProject.ts
│   │   ├── getUserProjects.ts
│   │   ├── getPaginatedProjectTickets.ts
│   │   ├── getKanbanColumnOrder.ts
│   │   ├── setKanbanColumnOrder.ts
│   │   ├── createApiKey.ts / getApiKeys.ts / revokeApiKey.ts / validateApiKey.ts
│   │   ├── getUserDetails.ts / createUser.ts / updateUser.ts / getAppUsers.ts
│   │   ├── getStatuses.ts / getPriorities.ts
│   │   └── getTransactions.ts / getGroupedTicketsForUser.ts
│   ├── api/                      # REST API routes
│   │   ├── auth/[...nextauth]/   # NextAuth handler
│   │   ├── mcp/route.ts          # ← MCP HTTP endpoint (JSON-RPC 2.0)
│   │   ├── mcp-auth/api-key/     # API key management REST routes
│   │   ├── ticket/create|update/ # Ticket REST routes
│   │   ├── project/create|update|identifier/[id]/
│   │   ├── projects/
│   │   ├── users/
│   │   ├── transactions/[entityId]/
│   │   └── kanban/column-order/
│   ├── context/
│   │   ├── ProjectTicketContext.tsx   # Project + ticket state
│   │   └── SharedAppContext.tsx       # App-wide shared state
│   ├── projects/
│   │   ├── page.tsx                   # /projects — list view
│   │   └── [identifier]/
│   │       ├── layout.tsx
│   │       ├── board/page.tsx          # /projects/:id/board — Kanban
│   │       └── list/page.tsx           # /projects/:id/list — Table
│   ├── api-keys/page.tsx
│   ├── login/page.tsx
│   ├── page.tsx                        # Home / redirect
│   ├── layout.tsx                      # Root layout
│   ├── not-found.tsx
│   └── globals.css
│
├── components/                   # Feature components
│   ├── ui/                       # shadcn/ui primitives (do not edit)
│   ├── ticket-kanban-board.tsx   # Kanban board with dnd-kit
│   ├── kanban-board-column.tsx
│   ├── kanban-board-card.tsx
│   ├── ticket-list.tsx           # Table view (TanStack)
│   ├── ticket-form.tsx           # Create/edit ticket form
│   ├── project-list.tsx
│   ├── project-edit.tsx
│   ├── project-ticket-layout.tsx # Tabs: board ↔ list
│   ├── navbar.tsx
│   ├── profile-dropdown.tsx
│   ├── api-keys-page-client.tsx
│   ├── grouped-transactions.tsx
│   └── ...skeletons, badges, avatars
│
├── lib/                          # Shared utilities
│   ├── db.ts                     # Mongoose connection (singleton)
│   ├── utils.ts                  # cn() and misc helpers
│   ├── drag.utils.ts             # dnd-kit drag helpers
│   ├── status.data.ts            # Status enum/data
│   ├── priority.data.ts          # Priority enum/data
│   ├── metadata.ts               # Next.js metadata helpers
│   ├── prefetch-data.ts          # Server-side data prefetch helpers
│   ├── token-parser.ts           # JWT helpers
│   ├── grouped-transactions.ts
│   └── env-loader.ts             # Forces .env load before Next.js starts
│
├── models/                       # Mongoose models
│   ├── index.ts                  # Barrel export
│   ├── User.ts                   # IAppUser
│   ├── Project.ts
│   ├── Ticket.ts
│   ├── Status.ts
│   ├── Priority.ts
│   ├── KanbanColumnOrder.ts
│   ├── ApiKey.ts                 # Hashed API keys for MCP auth
│   ├── Transaction.ts            # Audit log
│   └── time-stamp.ts             # Shared timestamp mixin
│
├── mcp-server/                   # Standalone MCP stdio server
│   ├── index.ts                  # Entry point, wires tools to MCP SDK
│   ├── server-instance.ts        # Server singleton
│   ├── api-client.ts             # HTTP client calling Next.js API routes
│   ├── types.ts                  # Shared TS types
│   └── tools/
│       ├── projects.ts           # project_list, project_get, project_create, project_update
│       ├── tickets.ts            # ticket_list, ticket_get, ticket_create, ticket_update
│       └── kanban.ts             # kanban_get_column_order, kanban_set_column_order
│
├── mcp-chat-client/              # Vite + React chat UI (separate app, port 5173)
│   └── src/
│       ├── App.tsx               # Main chat interface with DynamicRenderer
│       ├── components/AuthForm.tsx
│       ├── lib/mcp-client.ts     # SSE client connecting to agents server
│       └── types/chat.ts
│
├── auth.ts                       # NextAuth config, Google provider, JWT callbacks
├── next.config.ts                # Turbopack config
├── vercel.json                   # Vercel deployment config
└── .env                          # Local env vars (see below)
```

---

## Environment Variables (`.env`)

```
MONGODB_URI=                    # MongoDB connection string
GOOGLE_CLIENT_ID=               # Google OAuth client ID
GOOGLE_CLIENT_SECRET=           # Google OAuth client secret
NEXTAUTH_SECRET=                # NextAuth JWT secret
NEXTAUTH_URL=                   # App base URL (auto-set from VERCEL_URL on Vercel)
```

---

## Key Patterns

### Server Actions
All DB reads/writes go through `app/actions/`. They import Mongoose models directly and are called from Server Components or Client Components via `'use server'`.

### MCP HTTP Endpoint
`app/api/mcp/route.ts` — accepts JSON-RPC 2.0 `POST` requests. Authentication uses `Authorization: Bearer <api-key>` validated against the `ApiKey` collection (hashed). The Python agents server calls this endpoint.

### MCP Tools (HTTP endpoint exposes)
- `project_list`, `project_get`, `project_create`, `project_update`
- `ticket_list`, `ticket_get`, `ticket_create`, `ticket_update`
- `kanban_get_column_order`, `kanban_set_column_order`

### API Key Flow
Users generate API keys via `/api-keys` page → stored hashed in `models/ApiKey.ts` → used by external clients (Python agents server) to authenticate MCP requests.

### Auth Flow
Google OAuth → `auth.ts` callbacks → upsert user in MongoDB → JWT session with `userId`.

---

## Scripts

```bash
npm run dev          # Next.js dev server (port 3000) with Node inspector
npm run build        # Production build
npm run start        # Production server
npm run mcp:dev      # MCP stdio server (tsx, for Claude Desktop)
npm run mcp:build    # Compile MCP stdio server
npm run mcp:start    # Run compiled MCP stdio server
```

---

## Inter-Service Communication

```
mcp-chat-client (Vite :5173)
    └─ GET /chat/stream?query=...&api_key=... ──► generative-ui-agents-server (:8000)
                                                      └─ POST /api/mcp (JSON-RPC) ──► This app (:3000)
```

---

## Important Files to Know First

When working on this codebase, start with:
1. `models/index.ts` — understand all data models
2. `app/actions/` — all server-side data access patterns
3. `app/api/mcp/route.ts` — MCP protocol implementation
4. `auth.ts` — authentication setup
5. `lib/db.ts` — database connection
