# MCP Server Quick Start Guide

## What Was Created

A complete Model Context Protocol (MCP) server that exposes your Ticket Management System API endpoints as MCP tools. The server is organized in a clean, modular architecture.

## File Structure

```
mcp-server/
├── index.ts              # Main server entry point
├── api-client.ts         # HTTP client with auth support
├── types.ts             # TypeScript type definitions
├── tools/
│   ├── projects.ts      # 4 project tools (create, update, list, getByIdentifier)
│   ├── tickets.ts       # 2 ticket tools (create, update)
│   └── kanban.ts        # 2 kanban tools (setColumnOrder, getColumnOrder)
├── tsconfig.json        # TypeScript configuration
├── README.md            # Comprehensive documentation
├── ARCHITECTURE.md      # Architecture details
└── QUICKSTART.md        # This file
```

## Quick Start

### 1. Install Dependencies (Already Done)
```bash
npm install
```

### 2. Configure Environment
Set environment variables:
```bash
export NEXTAUTH_URL=http://localhost:3000
export AUTH_TOKEN=your-session-cookie-or-token
```

### 3. Run the Server
```bash
# Development (TypeScript)
npm run mcp:dev

# Or build and run
npm run mcp:build
npm run mcp:start
```

## Available Tools

### Projects
- `project_create` - Create a new project
- `project_update` - Update an existing project
- `project_list` - List all user projects
- `project_get_by_identifier` - Get project by identifier

### Tickets
- `ticket_create` - Create a new ticket
- `ticket_update` - Update an existing ticket

### Kanban
- `kanban_set_column_order` - Set kanban column order
- `kanban_get_column_order` - Get kanban column order (placeholder)

## Authentication

The server automatically detects authentication method:
- **Bearer Token**: Simple token → `Authorization: Bearer <token>`
- **Cookie**: String with `=` → `Cookie: <cookie-string>`

For NextAuth.js, extract the `next-auth.session-token` cookie from your browser.

## Integration Example

Add to your MCP client configuration (e.g., Claude Desktop):

```json
{
  "mcpServers": {
    "ticket-management-system": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-server/index.js"],
      "env": {
        "NEXTAUTH_URL": "http://localhost:3000",
        "AUTH_TOKEN": "next-auth.session-token=your-cookie-value"
      }
    }
  }
}
```

## Key Features

✅ **Type-Safe**: Full TypeScript with Zod validation  
✅ **Modular**: Easy to extend with new tools  
✅ **Secure**: Input validation and error handling  
✅ **Flexible Auth**: Supports Bearer tokens and cookies  
✅ **Well-Documented**: Comprehensive docs and examples  

## Next Steps

1. Test the server with your API
2. Add any missing tools following the existing patterns
3. Customize authentication if needed
4. Deploy or integrate with your MCP client

For detailed information, see [README.md](./README.md) and [ARCHITECTURE.md](./ARCHITECTURE.md).


