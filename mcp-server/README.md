# Ticket Management System MCP Server

A Model Context Protocol (MCP) server that exposes tools for managing projects, tickets, and kanban boards in the Ticket Management System.

## Overview

This MCP server provides a standardized interface for LLMs and other MCP clients to interact with the Ticket Management System API. It exposes tools for:

- **Projects**: Create, update, list, and retrieve projects
- **Tickets**: Create and update tickets
- **Kanban Boards**: Set and get column order for kanban boards

## Deployment

The MCP server is **hosted alongside the Next.js application** on Vercel:

- **Endpoint**: `/api/mcp`
- **Transport**: HTTP (JSON-RPC protocol)
- **Authentication**: NextAuth session cookies (browser login required)

For deployment details, see [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md).

For client setup, see [CLIENT_SETUP.md](./CLIENT_SETUP.md).

## Architecture

The server follows a modular architecture:

```
mcp-server/
├── index.ts              # Main server entry point
├── api-client.ts         # HTTP client for API requests
├── types.ts             # TypeScript type definitions
├── tools/
│   ├── projects.ts      # Project-related tools
│   ├── tickets.ts       # Ticket-related tools
│   └── kanban.ts        # Kanban board-related tools
└── README.md            # This file
```

## Installation

The MCP server dependencies are already installed in the main project:

```bash
npm install
```

## Configuration

The server can be configured using environment variables:

- `NEXTAUTH_URL` - Base URL for the Ticket Management System API (default: `http://localhost:3000`)
- `AUTH_TOKEN` - Optional authentication token or cookie for API requests

### Authentication Options

The server supports two authentication methods:

1. **Bearer Token**: If `AUTH_TOKEN` is a simple token string, it's sent as `Authorization: Bearer <token>`
2. **NextAuth Cookie**: If `AUTH_TOKEN` contains an `=` character (cookie format), it's sent as a `Cookie` header

For NextAuth.js authentication, extract the session cookie from your browser:
- Open browser DevTools → Application → Cookies
- Find the `next-auth.session-token` cookie
- Set `AUTH_TOKEN` to the full cookie string: `next-auth.session-token=<value>`

**Note**: Cookie-based auth requires the MCP server to run in the same domain context or use a proxy that forwards cookies.

## Usage

### HTTP Endpoint (Production)

The server is available as a Next.js API route at `/api/mcp`:

```bash
# List tools
curl -X POST https://your-domain.com/api/mcp \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

See [CLIENT_SETUP.md](./CLIENT_SETUP.md) for detailed client examples.

### Stdio Mode (Development/Standalone)

For local development or standalone usage, the server can run via stdio:

```bash
node mcp-server/index.js
```

Or using ts-node for TypeScript:

```bash
npx ts-node mcp-server/index.ts
```

### Building the Server

To compile TypeScript to JavaScript:

```bash
npx tsc mcp-server/index.ts --outDir mcp-server/dist --module esnext --target es2020 --moduleResolution node --esModuleInterop
```

### Integration with MCP Clients

To use this server with an MCP client (like Claude Desktop), add it to your MCP configuration:

```json
{
  "mcpServers": {
    "ticket-management-system": {
      "command": "node",
      "args": ["/path/to/mcp-server/index.js"],
      "env": {
        "NEXTAUTH_URL": "http://localhost:3000",
        "AUTH_TOKEN": "your-auth-token-here"
      }
    }
  }
}
```

## Available Tools

### Project Tools

#### `project_create`
Create a new project.

**Parameters:**
- `name` (string, required): Project name
- `identifier` (string, optional): Project identifier
- `memberIds` (string[], optional): Array of user IDs to add as members

**Example:**
```json
{
  "name": "My New Project",
  "identifier": "MYPROJ",
  "memberIds": ["user123", "user456"]
}
```

#### `project_update`
Update an existing project.

**Parameters:**
- `projectId` (string, required): Project ID
- `name` (string, optional): New project name
- `memberIds` (string[], optional): Updated array of member IDs

#### `project_list`
Get all projects for the authenticated user.

**Parameters:** None

#### `project_get_by_identifier`
Get a project by its identifier (public endpoint).

**Parameters:**
- `identifier` (string, required): Project identifier

### Ticket Tools

#### `ticket_create`
Create a new ticket in a project.

**Parameters:**
- `projectId` (string, required): Project ID
- `name` (string, required): Ticket name
- `description` (string, optional): Ticket description
- `assigneeIds` (string[], optional): Array of user IDs to assign
- `statusId` (string, optional): Status ID
- `priorityId` (string, optional): Priority ID

#### `ticket_update`
Update an existing ticket.

**Parameters:**
- `ticketId` (string, required): Ticket ID
- `projectId` (string, required): Project ID
- `name` (string, optional): New ticket name
- `description` (string, optional): New description
- `assigneeIds` (string[], optional): Updated assignee IDs
- `statusId` (string, optional): New status ID
- `priorityId` (string, optional): New priority ID

### Kanban Tools

#### `kanban_set_column_order`
Set the column order for a kanban board.

**Parameters:**
- `projectId` (string, required): Project ID
- `groupType` (string, required): Either "status" or "priority"
- `columns` (string[], required): Array of column IDs in desired order
- `projectIdentifier` (string, optional): Project identifier for cache revalidation

#### `kanban_get_column_order`
Get the column order for a kanban board.

**Parameters:**
- `projectId` (string, required): Project ID
- `groupType` (string, required): Either "status" or "priority"

**Note:** This tool currently returns a placeholder message as the GET endpoint is not yet implemented in the API.

## Authentication

The server supports authentication via the `AUTH_TOKEN` environment variable. The authentication method is automatically detected:

- **Bearer Token**: Simple token strings are sent as `Authorization: Bearer <token>`
- **Cookie-based**: Cookie strings (containing `=`) are sent as `Cookie` headers

For NextAuth.js cookie-based authentication:
1. Extract the session cookie from your browser's DevTools (Application → Cookies)
2. Copy the full cookie string (e.g., `next-auth.session-token=eyJ...`)
3. Set it as `AUTH_TOKEN` environment variable

**Important**: Cookie-based authentication may require the MCP server to run in the same domain or use CORS/proxy configuration.

## Error Handling

All tools include comprehensive error handling:
- Input validation using Zod schemas
- API error responses are properly formatted
- Errors are returned with `isError: true` flag in the response

## Development

### Adding New Tools

To add a new tool:

1. Create a new tool definition in the appropriate file under `tools/`
2. Export it following the `ProjectTool` interface pattern
3. Import and add it to the `allTools` array in `index.ts`

Example:

```typescript
export const myNewTool: ProjectTool[] = [
  {
    name: 'my_new_tool',
    description: 'Description of what the tool does',
    inputSchema: z.object({
      // Define your schema
    }),
    handler: async (args: unknown, client: ApiClient): Promise<CallToolResult> => {
      // Implement your handler
    },
  },
];
```

### Testing

To test the server locally:

1. Start your Ticket Management System API server
2. Set environment variables:
   ```bash
   export NEXTAUTH_URL=http://localhost:3000
   export AUTH_TOKEN=your-token-here
   ```
3. Run the MCP server:
   ```bash
   node mcp-server/index.js
   ```

## Security Considerations

- **Authentication**: Always use secure authentication tokens. Never commit tokens to version control.
- **NEXTAUTH_URL**: Use HTTPS in production environments.
- **Input Validation**: All inputs are validated using Zod schemas to prevent injection attacks.
- **Error Messages**: Error messages are sanitized to avoid leaking sensitive information.

## Troubleshooting

### Server won't start
- Check that all dependencies are installed: `npm install`
- Verify Node.js version (requires Node.js 18+)
- Check that the NEXTAUTH_URL is correct

### Authentication errors
- Verify that AUTH_TOKEN is set correctly
- Check that your API server is running and accessible
- Ensure the token format matches what your API expects

### Tool execution errors
- Check API server logs for detailed error messages
- Verify that required parameters are provided
- Ensure the API endpoint is accessible and responding

## License

Same as the main Ticket Management System project.


