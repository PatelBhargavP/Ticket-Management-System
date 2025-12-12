# MCP Client Setup Guide

This guide explains how to set up an external MCP client to connect to the Ticket Management System MCP server hosted at `/api/mcp`.

## Server Endpoint

The MCP server is available at:
```
https://your-domain.com/api/mcp
```

## Authentication

The server uses **NextAuth.js session cookies** for authentication. This means:

1. **You must be logged in** to the Ticket Management System in your browser
2. The MCP client must **forward cookies** from the browser session
3. Cookies are automatically sent when making requests from the same origin

## Client Setup Options

### Option 1: Browser-Based Client (Same Origin)

If your client runs in the browser on the same domain, cookies are automatically included:

```typescript
// Example: Browser-based MCP client
async function callMCPTool(toolName: string, args: unknown) {
  const response = await fetch('/api/mcp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Important: include cookies
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: args,
      },
    }),
  });
  
  return await response.json();
}

// List available tools
async function listTools() {
  const response = await fetch('/api/mcp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/list',
    }),
  });
  
  return await response.json();
}
```

### Option 2: External Client with Cookie Forwarding

For external clients (different domain), you need to:

1. **Extract cookies from browser**
2. **Forward them in requests**

#### Step 1: Extract Session Cookie

Open browser DevTools → Application → Cookies → Copy the `next-auth.session-token` cookie value.

#### Step 2: Use Cookie in Client

```typescript
// Example: Node.js/TypeScript client
import fetch from 'node-fetch';

const MCP_ENDPOINT = 'https://your-domain.com/api/mcp';
const SESSION_COOKIE = 'next-auth.session-token=YOUR_COOKIE_VALUE';

async function callMCPTool(toolName: string, args: unknown) {
  const response = await fetch(MCP_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': SESSION_COOKIE,
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: args,
      },
    }),
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  return await response.json();
}

// List tools
async function listTools() {
  const response = await fetch(MCP_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': SESSION_COOKIE,
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/list',
    }),
  });
  
  return await response.json();
}
```

### Option 3: Python Client Example

```python
import requests
import json

MCP_ENDPOINT = "https://your-domain.com/api/mcp"
SESSION_COOKIE = "next-auth.session-token=YOUR_COOKIE_VALUE"

def call_mcp_tool(tool_name: str, args: dict):
    """Call an MCP tool"""
    payload = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "tools/call",
        "params": {
            "name": tool_name,
            "arguments": args
        }
    }
    
    headers = {
        "Content-Type": "application/json",
        "Cookie": SESSION_COOKIE
    }
    
    response = requests.post(MCP_ENDPOINT, json=payload, headers=headers)
    response.raise_for_status()
    return response.json()

def list_tools():
    """List available MCP tools"""
    payload = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "tools/list"
    }
    
    headers = {
        "Content-Type": "application/json",
        "Cookie": SESSION_COOKIE
    }
    
    response = requests.post(MCP_ENDPOINT, json=payload, headers=headers)
    response.raise_for_status()
    return response.json()

# Example usage
if __name__ == "__main__":
    # List available tools
    tools = list_tools()
    print("Available tools:", json.dumps(tools, indent=2))
    
    # Create a project
    result = call_mcp_tool("project_create", {
        "name": "My New Project",
        "identifier": "MYPROJ"
    })
    print("Created project:", json.dumps(result, indent=2))
```

### Option 4: Using Official MCP Client SDK

If using the official `@modelcontextprotocol/sdk` client:

```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';

// Note: The server uses HTTP, not SSE, so you'll need to use fetch directly
// or create a custom transport adapter

// For HTTP-based MCP, use fetch directly (see Option 1 or 2)
```

## MCP Protocol

The server implements the MCP (Model Context Protocol) specification:

### Request Format

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/list" | "tools/call",
  "params": {
    // For tools/call:
    "name": "tool_name",
    "arguments": { ... }
  }
}
```

### Response Format

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    // Tool result
  }
}
```

### Error Format

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "error": {
    "code": -32603,
    "message": "Internal error",
    "data": "Error details"
  }
}
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
- `kanban_get_column_order` - Get kanban column order

## Example: Complete Workflow

```typescript
// 1. List available tools
const toolsResponse = await fetch('/api/mcp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/list',
  }),
});
const { result: tools } = await toolsResponse.json();
console.log('Available tools:', tools.tools);

// 2. Create a project
const createProjectResponse = await fetch('/api/mcp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/call',
    params: {
      name: 'project_create',
      arguments: {
        name: 'My New Project',
        identifier: 'MYPROJ',
      },
    },
  }),
});
const { result: project } = await createProjectResponse.json();
console.log('Created project:', project);

// 3. Create a ticket in the project
const createTicketResponse = await fetch('/api/mcp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    jsonrpc: '2.0',
    id: 3,
    method: 'tools/call',
    params: {
      name: 'ticket_create',
      arguments: {
        projectId: project.projectId,
        name: 'Fix bug in authentication',
        description: 'Users cannot log in',
      },
    },
  }),
});
const { result: ticket } = await createTicketResponse.json();
console.log('Created ticket:', ticket);
```

## Troubleshooting

### 401 Unauthorized
- **Cause**: Not logged in or session expired
- **Solution**: Log in to the Ticket Management System in your browser, then refresh/extract the session cookie

### CORS Errors
- **Cause**: Making requests from a different origin
- **Solution**: 
  - Use cookie forwarding (see Option 2)
  - Or configure CORS on the server (if needed for your use case)

### Cookie Expiration
- **Cause**: NextAuth session cookies expire
- **Solution**: Extract a fresh cookie from the browser after logging in

### Invalid Method
- **Cause**: Using wrong method name
- **Solution**: Use `tools/list` or `tools/call` (not `tools/list` vs `list_tools`)

## Security Notes

1. **Session cookies are sensitive** - Never commit them to version control
2. **Use HTTPS in production** - Always use HTTPS for cookie-based authentication
3. **Cookie scope** - Cookies are scoped to the domain, so same-origin requests work automatically
4. **Session expiration** - NextAuth sessions expire; clients should handle re-authentication

## Next Steps

1. Choose a client option based on your use case
2. Extract/configure session cookies
3. Test with `tools/list` first
4. Implement your workflow using available tools
5. Handle errors and session expiration gracefully

