#!/usr/bin/env node
/**
 * Standalone MCP Server for Ticket Management System
 * 
 * This is a standalone HTTP server that exposes MCP tools.
 * 
 * Installation:
 *   npm install
 *   cp .env.example .env.local
 * 
 * Usage:
 *   npm run dev     # Development mode
 *   npm run build   # Build to dist/
 *   npm start       # Run production build
 * 
 * Environment Variables:
 *   MCP_PORT - Port to run server on (default: 3001)
 *   NEXTAUTH_URL - Base URL for the Ticket Management System API (default: http://localhost:3000)
 *   AUTH_TOKEN - Optional authentication token for API requests
 *   NODE_ENV - Environment (development/production)
 */

// Load environment variables from .env.local or .env.example
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Try to load from .env.local first, then .env.example
dotenv.config({ path: path.resolve(__dirname, '.env.local') });
dotenv.config({ path: path.resolve(__dirname, '.env.example') });

import http from 'http';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { ApiClient } from './api-client.js';
import { projectTools } from './tools/projects.js';
import { ticketTools } from './tools/tickets.js';
import { kanbanTools } from './tools/kanban.js';

// Configuration
const MCP_PORT = parseInt(process.env.MCP_PORT || '3001', 10);
const NEXTAUTH_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';
const AUTH_TOKEN = process.env.AUTH_TOKEN;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Validate configuration
if (!NEXTAUTH_URL) {
  console.error('[MCP Server] Error: NEXTAUTH_URL environment variable is required');
  process.exit(1);
}

// Combine all tools
const allTools = [
  ...projectTools,
  ...ticketTools,
  ...kanbanTools,
];

// Handle JSON-RPC requests
async function handleRpcRequest(method: string, params?: unknown, authToken?: string): Promise<{ result?: unknown; error?: { code: number; message: string } }> {
  // Create API client with the auth token from the request
  const apiClient = new ApiClient({
    apiBaseUrl: NEXTAUTH_URL,
    authToken: authToken || AUTH_TOKEN,
  });

  if (NODE_ENV === 'development') {
    console.log(`[MCP Server] RPC Request: ${method}`);
    if (authToken) {
      console.log(`[MCP Server] Auth: Bearer token provided by client`);
    } else if (AUTH_TOKEN) {
      console.log(`[MCP Server] Auth: Using server AUTH_TOKEN`);
    } else {
      console.log(`[MCP Server] Auth: No authentication provided`);
    }
  }

  try {
    if (method === 'tools/list') {
      return {
        result: {
          tools: allTools.map((tool) => ({
            name: tool.name,
            description: tool.description,
            inputSchema: tool.inputSchema,
          })),
        },
      };
    }

    if (method === 'tools/call') {
      const callParams = params as { name: string; arguments: unknown };
      if (!callParams.name) {
        return {
          error: { code: -32602, message: 'Tool name is required' },
        };
      }

      const tool = allTools.find((t) => t.name === callParams.name);
      if (!tool) {
        return {
          error: { code: -32601, message: `Unknown tool: ${callParams.name}` },
        };
      }

      const result = await tool.handler(callParams.arguments, apiClient);
      return { result };
    }

    return {
      error: { code: -32601, message: `Unknown method: ${method}` },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      error: { code: -32603, message },
    };
  }
}

// Create HTTP server
const server = http.createServer(async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Only accept POST requests to /
  if (req.method !== 'POST' || req.url !== '/') {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
    return;
  }

  // Parse request body
  let body = '';
  req.on('data', (chunk) => {
    body += chunk.toString();
  });

  req.on('end', async () => {
    try {
      const request = JSON.parse(body);
      const { jsonrpc = '2.0', id = null, method, params } = request;

      // Extract authorization token from request headers
      const authHeader = req.headers.authorization || '';
      let authToken: string | undefined;
      if (authHeader.startsWith('Bearer ')) {
        authToken = authHeader.slice(7); // Remove 'Bearer ' prefix
      }

      // Handle the RPC request
      const response = await handleRpcRequest(method, params, authToken);

      // Send JSON-RPC response
      const rpcResponse = {
        jsonrpc,
        id,
        ...response,
      };

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(rpcResponse));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid JSON';
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          jsonrpc: '2.0',
          id: null,
          error: { code: -32700, message },
        })
      );
    }
  });
});

// Start the server
server.listen(MCP_PORT, '0.0.0.0', () => {
  if (NODE_ENV === 'development') {
    console.log(`[MCP Server] Starting in ${NODE_ENV} mode`);
    console.log(`[MCP Server] API Base URL: ${NEXTAUTH_URL}`);
    console.log(`[MCP Server] Authentication: ${AUTH_TOKEN ? 'Enabled' : 'Disabled'}`);
    console.log(`[MCP Server] Available tools: ${allTools.length}`);
  }
  console.log(`[MCP Server] Server running on http://0.0.0.0:${MCP_PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[MCP Server] SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('[MCP Server] Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('[MCP Server] SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('[MCP Server] Server closed');
    process.exit(0);
  });
});


