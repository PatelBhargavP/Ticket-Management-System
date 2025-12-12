# MCP Server Architecture

## Overview

This document describes the architecture and design decisions for the Ticket Management System MCP Server.

## Design Principles

1. **Modularity**: Tools are organized by domain (projects, tickets, kanban)
2. **Type Safety**: Full TypeScript support with Zod schema validation
3. **Error Handling**: Comprehensive error handling at all levels
4. **Extensibility**: Easy to add new tools following established patterns
5. **Security**: Input validation and secure authentication handling

## Architecture Layers

### 1. Transport Layer
- **StdioServerTransport**: Handles communication via standard input/output
- Standard MCP protocol implementation
- No HTTP server needed - communicates via stdio streams

### 2. Server Layer (`index.ts`)
- Initializes the MCP server
- Registers request handlers for `ListTools` and `CallTool`
- Manages tool registry and routing
- Handles server lifecycle

### 3. Tool Layer (`tools/`)
- **projects.ts**: Project management tools
- **tickets.ts**: Ticket management tools
- **kanban.ts**: Kanban board tools
- Each tool follows a consistent interface:
  - `name`: Unique tool identifier
  - `description`: Human-readable description
  - `inputSchema`: Zod schema for input validation
  - `handler`: Async function that executes the tool

### 4. API Client Layer (`api-client.ts`)
- Abstraction over HTTP requests
- Handles authentication
- Provides typed request/response handling
- Centralized error handling

### 5. Type Definitions (`types.ts`)
- Shared TypeScript interfaces
- Input/output type definitions
- Error type definitions

## Data Flow

```
MCP Client
    ↓ (stdio)
MCP Server (index.ts)
    ↓ (routing)
Tool Handler (tools/*.ts)
    ↓ (validation)
Zod Schema Validation
    ↓ (API call)
API Client (api-client.ts)
    ↓ (HTTP)
Ticket Management System API
    ↓ (response)
API Client
    ↓ (formatting)
Tool Handler
    ↓ (MCP format)
MCP Server
    ↓ (stdio)
MCP Client
```

## Tool Registration Pattern

All tools follow this pattern:

```typescript
export const toolName: ProjectTool[] = [
  {
    name: 'tool_name',
    description: 'What the tool does',
    inputSchema: z.object({
      // Zod schema definition
    }),
    handler: async (args: unknown, client: ApiClient): Promise<CallToolResult> => {
      // 1. Validate args using schema
      // 2. Make API call using client
      // 3. Format and return result
      // 4. Handle errors appropriately
    },
  },
];
```

## Authentication Strategy

The server supports authentication via:

1. **Environment Variable**: `AUTH_TOKEN` set at server startup
2. **Bearer Token**: Sent in `Authorization` header
3. **Future Enhancement**: Could support dynamic token refresh

For NextAuth.js integration:
- Extract session token from NextAuth
- Pass as `AUTH_TOKEN` environment variable
- Or modify `api-client.ts` to handle cookie-based auth

## Error Handling Strategy

1. **Input Validation**: Zod schemas validate all inputs before processing
2. **API Errors**: Caught and formatted with `isError: true` flag
3. **Network Errors**: Handled gracefully with descriptive messages
4. **Unknown Errors**: Fallback to generic error message

## Extension Points

### Adding a New Tool

1. Create tool definition in appropriate `tools/*.ts` file
2. Export as array following `ProjectTool[]` pattern
3. Import in `index.ts`
4. Add to `allTools` array

### Adding a New Domain

1. Create new file `tools/new-domain.ts`
2. Follow existing tool pattern
3. Import and register in `index.ts`

### Custom Authentication

1. Modify `ApiClient` class
2. Update `setAuthToken` method or add new auth methods
3. Update initialization in `index.ts`

## Configuration

Configuration is done via environment variables:

- `NEXTAUTH_URL`: API endpoint (default: `http://localhost:3000`)
- `AUTH_TOKEN`: Authentication token (optional)

## Testing Strategy

1. **Unit Tests**: Test individual tool handlers with mocked API client
2. **Integration Tests**: Test against real API (with test credentials)
3. **E2E Tests**: Test full MCP protocol flow with MCP client

## Performance Considerations

1. **Connection Pooling**: API client could be enhanced with connection pooling
2. **Caching**: Could add caching layer for frequently accessed data
3. **Batch Operations**: Could add batch operation support for multiple requests

## Security Considerations

1. **Input Validation**: All inputs validated with Zod schemas
2. **Token Security**: Tokens stored in environment variables, never logged
3. **Error Messages**: Sanitized to avoid information leakage
4. **HTTPS**: Use HTTPS for NEXTAUTH_URL in production

## Future Enhancements

1. **Resource Support**: Add MCP resources for exposing data
2. **Prompt Templates**: Add MCP prompts for common operations
3. **Streaming**: Support streaming responses for large datasets
4. **WebSocket Transport**: Add WebSocket transport option
5. **Metrics**: Add logging and metrics collection
6. **Rate Limiting**: Add rate limiting for API calls


