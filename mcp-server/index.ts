#!/usr/bin/env node
/**
 * MCP Server for Ticket Management System
 * 
 * This server exposes tools for managing projects, tickets, and kanban boards
 * through the Model Context Protocol (MCP).
 * 
 * Usage:
 *   node mcp-server/index.js
 * 
 * Environment Variables:
 *   NEXTAUTH_URL - Base URL for the Ticket Management System API (default: http://localhost:3000)
 *   AUTH_TOKEN - Optional authentication token for API requests
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { ApiClient } from './api-client';
import { projectTools } from './tools/projects';
import { ticketTools } from './tools/tickets';
import { kanbanTools } from './tools/kanban';

// Get configuration from environment variables
const NEXTAUTH_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';
const AUTH_TOKEN = process.env.AUTH_TOKEN;

// Initialize API client
const apiClient = new ApiClient({
  apiBaseUrl: NEXTAUTH_URL,
  authToken: AUTH_TOKEN,
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

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  console.error('Ticket Management System MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error in MCP server:', error);
  process.exit(1);
});


