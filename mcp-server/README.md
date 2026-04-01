# MCP Server — Ticket Management System

A standalone [Model Context Protocol](https://modelcontextprotocol.io/) server that exposes the Ticket Management System as a set of AI-callable tools over HTTP.


---

## Table of Contents

1. [Overview](#1-overview)
2. [Architecture](#2-architecture)
3. [Authentication](#3-authentication)
4. [Setup & Running](#4-setup--running)
5. [Using with MCP-compatible AI Clients](#5-using-with-mcp-compatible-ai-clients)
6. [Available Tools](#6-available-tools)
7. [Health Check](#7-health-check)

---

## 1. Overview

The MCP server is a **standalone Node.js process** that implements the [Model Context Protocol](https://modelcontextprotocol.io/) over HTTP. It acts as a bridge between any MCP-compatible AI client (such as Claude Desktop, a custom chat UI, or any agent framework) and the Ticket Management System REST API.

| Service | Port | Technology |
|---|---|---|
| Ticket Management System (Next.js app) | `3000` | Next.js + MongoDB |
| MCP Server | `3001` | Express.js + MCP SDK |

### Why is it a separate process?

The MCP server runs independently for several reasons:

- **Protocol boundary**: MCP clients speak JSON-RPC over HTTP (Streamable HTTP transport), not the Next.js API format. A dedicated server keeps that protocol concern isolated.
- **Session state**: The server maintains a `Map` of active MCP sessions in memory. Embedding this inside the stateless Next.js edge/serverless runtime is not feasible.
- **Independent lifecycle**: The server can be started, stopped, or restarted without touching the main application. It also allows different scaling strategies.
- **Separation of concerns**: The Next.js app owns the business logic and data. The MCP server owns the AI-facing protocol layer.

---

## 2. Architecture

```
MCP Client (e.g. chat UI, Claude Desktop)
        │
        │  POST/GET/DELETE http://localhost:3001/mcp
        │  Header: Authorization: Bearer tms_...
        │  Header: mcp-session-id: <uuid>  (after initialize)
        ▼
┌─────────────────────────────────────────────┐
│            Express.js HTTP Server            │
│                 (index.ts)                   │
│                                              │
│  cors()       → sets CORS + exposes headers  │
│  express.json()→ parses JSON body            │
│                                              │
│  POST /mcp ──► handleMcp()                  │
│  DELETE /mcp ─► handleMcp()                  │
│  GET /mcp ───► handleMcp() (SSE streaming)  │
│  GET /health ─► { status, sessions }         │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│         Per-Session Transport Model          │
│                                              │
│  sessions: Map<sessionId, Transport>         │
│                                              │
│  initialize (no mcp-session-id header):      │
│    → createSessionTransport()               │
│      • new StreamableHTTPServerTransport     │
│      • new Server (MCP SDK)                 │
│      • new ApiClient(authToken)              │
│      • server.connect(transport)            │
│      • onsessioninitialized → sessions.set() │
│                                              │
│  subsequent requests (mcp-session-id set):   │
│    → sessions.get(sessionId) → transport     │
│    → transport.handleRequest(req, res, body) │
│                                              │
│  session close:                              │
│    → transport.onclose → sessions.delete()   │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│              Tool Handlers                   │
│                                              │
│  projectTools   (tools/projects.ts)          │
│  ticketTools    (tools/tickets.ts)           │
│  kanbanTools    (tools/kanban.ts)            │
│                                              │
│  Each tool:                                  │
│    1. Validates args with Zod schema         │
│    2. Calls ApiClient.get/post/put/delete    │
│    3. Returns { content: [{ type, text }] }  │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│         ApiClient (api-client.ts)            │
│                                              │
│  baseUrl: http://localhost:3000              │
│  authToken: <forwarded from MCP client>      │
│                                              │
│  GET/POST/PUT/DELETE → Next.js REST API      │
│  Header: Authorization: Bearer <token>       │
└─────────────────────────────────────────────┘
```

### Key components

#### Express.js HTTP server (`index.ts`)

The entry point spins up an Express app with two middleware layers applied globally:

- **`cors()`** — allows all origins, exposes the `mcp-session-id` response header (required so browser-based clients can read the session ID assigned by the server during `initialize`), and handles `OPTIONS` preflight automatically.
- **`express.json()`** — parses the JSON-RPC request body and makes it available as `req.body`, which is then forwarded as the `parsedBody` argument to `transport.handleRequest()`.

#### `StreamableHTTPServerTransport`

The MCP SDK's `StreamableHTTPServerTransport` implements the [Streamable HTTP](https://spec.modelcontextprotocol.io/specification/basic/transports/#streamable-http) transport specification. It handles the JSON-RPC framing, SSE streaming for server-to-client notifications, and session lifecycle. The server passes `{ sessionIdGenerator: () => randomUUID() }` to enable **stateful mode** — without this the transport is stateless and can only serve a single request before throwing an error.

#### Per-session transport model

The MCP SDK's `_initialized` flag is tracked **per transport instance**. This means a single transport can only ever complete one `initialize` handshake. The server therefore creates a fresh `Server` + `Transport` pair for every new session:

| Request | `mcp-session-id` header | Action |
|---|---|---|
| `initialize` | absent | `createSessionTransport()` → new `Server` + `Transport` + `ApiClient`; stored in `sessions` map via `onsessioninitialized` |
| Any subsequent call | present | `sessions.get(sessionId)` → route to existing transport |
| Session close | — | `transport.onclose` → `sessions.delete(sessionId)` |

This model also handles React Strict Mode's double-mount correctly, since each `initialize` call creates its own isolated session.

#### Tool groups

| File | Exported array | Covers |
|---|---|---|
| `tools/projects.ts` | `projectTools` | CRUD on projects |
| `tools/tickets.ts` | `ticketTools` | CRUD on tickets |
| `tools/kanban.ts` | `kanbanTools` | Kanban board column ordering |

All three arrays are merged into `allTools` in `index.ts` and registered on the MCP `Server` instance via `setRequestHandler(ListToolsRequestSchema, ...)` and `setRequestHandler(CallToolRequestSchema, ...)`.

#### `ApiClient` (`api-client.ts`)

A thin HTTP client that wraps `fetch`. Every session gets its own `ApiClient` instance constructed with the auth token forwarded from the connecting MCP client. It adds `Authorization: Bearer <token>` to every outbound request and handles JSON parsing, error formatting, and network failure messages.

---

## 3. Authentication

Authentication flows through two layers.

### Layer 1 — MCP client → MCP server

The connecting client (chat UI, Claude Desktop, etc.) sends its API key on the **`initialize` request**:

```
POST http://localhost:3001/mcp
Authorization: Bearer tms_xxxxxxxxxxxxxxxx
Content-Type: application/json

{ "jsonrpc": "2.0", "method": "initialize", ... }
```

The MCP server extracts the token from the `Authorization` header during `initialize` (when no `mcp-session-id` is present) and stores it inside the per-session `ApiClient`. All subsequent requests in that session use the same token — the client does not need to re-send it on every message.

### Layer 2 — MCP server → Next.js backend

Every tool call ultimately makes an HTTP request to the Next.js REST API. The per-session `ApiClient` injects the forwarded token:

```
GET http://localhost:3000/api/projects
Authorization: Bearer tms_xxxxxxxxxxxxxxxx
Content-Type: application/json
X-MCP-Internal: true
```

### Token validation in the Next.js backend

The Next.js API routes call `tokenParser(request)` (in `lib/token-parser.ts`), which applies the following logic in order:

1. **API key (Bearer token)** — if `Authorization: Bearer <value>` is present and `<value>` starts with `tms_`, the key's SHA-256 hash is looked up in the `ApiKey` collection. Expiry is checked. If valid, a synthetic JWT-like object is returned.
2. **NextAuth session cookie** — if no `Authorization` header is present, `getToken()` reads the `next-auth.session-token` cookie. Valid sessions are accepted.
3. **Reject** — if neither check passes, `tokenParser` returns a `401 Unauthorized` response.

The `AUTH_TOKEN` environment variable on the MCP server acts as a **fallback**: if a connecting MCP client provides no `Authorization` header, the server uses `AUTH_TOKEN` when constructing the `ApiClient`. This is useful for testing or trusted server-to-server setups.

### Obtaining an API key

1. Sign in to the Ticket Management System at `http://localhost:3000`.
2. Navigate to **Settings → API Keys**.
3. Generate a new key — it will be displayed once in the format `tms_xxxxxxxx...`.
4. Copy it immediately; it cannot be retrieved again.
5. Use it as `Authorization: Bearer tms_xxxxxxxx...` when connecting an MCP client to this server.

---

## 4. Setup & Running

### Prerequisites

- **Node.js ≥ 18** (the server uses native `fetch`, `crypto.randomUUID`, and ES module imports)
- The Ticket Management System Next.js app must be running on port `3000` before tool calls will succeed (the MCP server itself starts independently)

### Installation

```bash
cd mcp-server
npm install
```

### Environment variables

Copy the example file and edit it:

```bash
cp .env.example .env.local
```

`.env.local` is loaded first; `.env.example` is used as a fallback for any missing keys.

| Variable | Required | Default | Description |
|---|---|---|---|
| `NEXTAUTH_URL` | Yes | `http://localhost:3000` | Base URL of the Ticket Management System REST API. Must not have a trailing slash. |
| `AUTH_TOKEN` | No | _(empty)_ | Server-level fallback API key. Used when a connecting MCP client provides no `Authorization` header. Leave empty if every client will supply its own key. |
| `MCP_PORT` | No | `3001` | Port the MCP server listens on. |
| `NODE_ENV` | No | `development` | Set to `production` for production deployments. |

Minimal `.env.local` for local development:

```env
NEXTAUTH_URL=http://localhost:3000
MCP_PORT=3001
NODE_ENV=development
```

### Running

**Development** (TypeScript executed directly via `tsx`, with Node.js inspector and file watching):

```bash
npm run dev
```

**Production** (compile TypeScript first, then run the compiled output):

```bash
npm run build
npm start
```

The server prints two lines on startup:

```
[MCP Server] Running on http://localhost:3001/mcp
[MCP Server] Health: http://localhost:3001/health
```

---

## 5. Using with MCP-compatible AI Clients

Any client that implements the Model Context Protocol using the **Streamable HTTP transport** can connect to this server.

**MCP server URL:** `http://localhost:3001/mcp`

The client must send a valid `Authorization: Bearer tms_...` header on the `initialize` request. The server returns a `mcp-session-id` header in the response; subsequent requests must include that header so the server routes them to the correct session.

### Included chat client (`mcp-chat-client`)

The repository includes a Vite + React chat client in `mcp-chat-client/`. It connects to `http://localhost:3001/mcp` by default. Start it with:

```bash
cd mcp-chat-client
npm install
npm run dev   # served on http://localhost:5173
```

Enter your API key in the auth form on first load — the client stores it in memory and sends it as `Authorization: Bearer <key>` on every MCP connection.

### Claude Desktop

Claude Desktop supports the Streamable HTTP transport via the `url` field in its MCP server configuration. Add the following to `claude_desktop_config.json` (typically found at `~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "ticket-management": {
      "url": "http://localhost:3001/mcp",
      "headers": {
        "Authorization": "Bearer tms_your_api_key_here"
      }
    }
  }
}
```

Replace `tms_your_api_key_here` with a key generated from the Ticket Management System settings page. Restart Claude Desktop after saving the file.

> **Note:** Streamable HTTP transport support in Claude Desktop was introduced in early 2025. If your version predates this, update to the latest release.

### Other MCP clients

For any other client (LangChain, custom agent, etc.), configure it to:

- Send `POST` requests to `http://localhost:3001/mcp`
- Include `Authorization: Bearer tms_...` on the `initialize` request
- Read the `mcp-session-id` response header and include it on all subsequent requests

---

## 6. Available Tools

### Projects

| Tool | Description | Required inputs | Optional inputs |
|---|---|---|---|
| `project_list` | List all projects for the authenticated user | — | — |
| `project_create` | Create a new project | `name` | `identifier`, `memberIds` |
| `project_update` | Update an existing project | `projectId` | `name`, `memberIds` |
| `project_get_by_identifier` | Fetch a project by its short identifier | `identifier` | — |

**`project_create` inputs:**
- `name` _(string)_ — display name of the project
- `identifier` _(string, optional)_ — short uppercase slug (e.g. `MYPROJ`)
- `memberIds` _(string[], optional)_ — user IDs to add as members on creation

**`project_update` inputs:**
- `projectId` _(string)_ — MongoDB `_id` of the project to update
- `name` _(string, optional)_ — new display name
- `memberIds` _(string[], optional)_ — replacement member list

**`project_get_by_identifier` inputs:**
- `identifier` _(string)_ — the short project slug (public endpoint, no auth required)

---

### Tickets

| Tool | Description | Required inputs | Optional inputs |
|---|---|---|---|
| `ticket_create` | Create a new ticket inside a project | `projectId`, `name` | `description`, `assigneeIds`, `statusId`, `priorityId` |
| `ticket_update` | Update an existing ticket | `ticketId`, `projectId` | `name`, `description`, `assigneeIds`, `statusId`, `priorityId` |

**`ticket_create` inputs:**
- `projectId` _(string)_ — project to create the ticket in
- `name` _(string)_ — ticket title
- `description` _(string, optional)_ — markdown description
- `assigneeIds` _(string[], optional)_ — user IDs to assign
- `statusId` _(string, optional)_ — initial status
- `priorityId` _(string, optional)_ — initial priority

**`ticket_update` inputs:** same fields as above, plus `ticketId` _(string)_ identifying the ticket; all other fields are optional.

---

### Kanban

| Tool | Description | Required inputs | Optional inputs |
|---|---|---|---|
| `kanban_set_column_order` | Persist a custom column order for a board grouped by status or priority | `projectId`, `groupType`, `columns` | `projectIdentifier` |
| `kanban_get_column_order` | Retrieve the saved column order for a board | `projectId`, `groupType` | — |

**`kanban_set_column_order` inputs:**
- `projectId` _(string)_ — project whose board to configure
- `groupType` _(`"status"` \| `"priority"`)_ — which grouping axis the columns represent
- `columns` _(string[])_ — ordered array of column IDs
- `projectIdentifier` _(string, optional)_ — short slug used for cache revalidation

**`kanban_get_column_order` inputs:**
- `projectId` _(string)_
- `groupType` _(`"status"` \| `"priority"`)_

> **Note:** `kanban_get_column_order` currently returns a placeholder message — the corresponding `GET /api/kanban/column-order` backend endpoint is not yet implemented.

---

## 7. Health Check

The server exposes a lightweight health endpoint for monitoring and readiness checks.

**Request:**
```
GET http://localhost:3001/health
```

**Response (`200 OK`):**
```json
{
  "status": "ok",
  "sessions": 2
}
```

| Field | Type | Description |
|---|---|---|
| `status` | `"ok"` | Always `"ok"` while the process is running |
| `sessions` | number | Number of currently active MCP sessions held in the in-memory `sessions` Map |

This endpoint requires no authentication and is safe to poll from an external health-check probe.
