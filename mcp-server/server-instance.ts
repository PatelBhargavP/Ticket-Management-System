/**
 * MCP Server Instance Factory
 * 
 * Creates and configures the MCP server instance that can be used
 * with both stdio and HTTP transports
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { ApiClient } from './api-client';
import { projectTools } from './tools/projects';
import { ticketTools } from './tools/tickets';
import { kanbanTools } from './tools/kanban';

export interface MCPServerConfig {
  apiBaseUrl: string;
  authCookie?: string;
  apiKey?: string; // API key for Bearer token authentication
}

/**
 * Creates a configured MCP server instance
 */
export function createMCPServer(config: MCPServerConfig): {
  server: Server;
  apiClient: ApiClient;
  handleRequest: (method: string, params: unknown) => Promise<unknown>;
} {
  // Initialize API client with cookie or API key auth
  const apiClient = new ApiClient({
    apiBaseUrl: config.apiBaseUrl,
    authToken: config.apiKey || config.authCookie, // Prefer API key, fallback to cookie
  });

  // Initialize MCP server
  const server = new Server(
    {
      name: 'ticket-management-system',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Combine all tools
  const allTools = [
    ...projectTools,
    ...ticketTools,
    ...kanbanTools,
  ];

  // Handle list tools request
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: allTools.map((tool) => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
      })),
    };
  });

  // Handle call tool request
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    // Find the tool handler
    const tool = allTools.find((t) => t.name === name);

    if (!tool) {
      throw new Error(`Unknown tool: ${name}`);
    }

    // Execute the tool handler (it will validate the schema internally)
    return await tool.handler(args, apiClient);
  });

  /**
   * Handle MCP protocol requests via HTTP
   * MCP uses JSON-RPC style protocol
   */
  async function handleRequest(method: string, params: unknown): Promise<unknown> {
    // Map HTTP methods to MCP request handlers
    if (method === 'tools/list') {
      // Return tools directly (simpler than using server handler)
      return {
        tools: allTools.map((tool) => ({
          name: tool.name,
          description: tool.description,
          inputSchema: tool.inputSchema,
        })),
      };
    } else if (method === 'tools/call') {
      const callParams = params as { name: string; arguments: unknown };
      if (!callParams || typeof callParams !== 'object' || !('name' in callParams)) {
        throw new Error('Invalid params: name is required');
      }
      
      const toolName = callParams.name;
      const toolArgs = 'arguments' in callParams ? callParams.arguments : {};
      
      // Find and execute the tool
      const tool = allTools.find((t) => t.name === toolName);
      if (!tool) {
        throw new Error(`Unknown tool: ${toolName}`);
      }
      
      // Execute the tool handler
      return await tool.handler(toolArgs, apiClient);
    }

    throw new Error(`Unknown method: ${method}`);
  }

  return {
    server,
    apiClient,
    handleRequest,
  };
}

