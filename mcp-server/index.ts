#!/usr/bin/env node
/**
 * Standalone MCP Server for Ticket Management System
 *
 * This is a standalone MCP server using stdio transport.
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
 *   NEXTAUTH_URL - Base URL for the Ticket Management System API (default: http://localhost:3000)
 *   AUTH_TOKEN - Optional authentication token for API requests
 *   NODE_ENV - Environment (development/production)
 */

// Load environment variables from .env.local or .env.example
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';
import express from 'express';
import cors from 'cors';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Try to load from .env.local first, then .env.example
dotenv.config({ path: path.resolve(__dirname, '.env.local') });
dotenv.config({ path: path.resolve(__dirname, '.env.example') });

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema, ListToolsRequestSchema, ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import { ApiClient } from './api-client.js';
import { projectTools } from './tools/projects.js';
import { ticketTools } from './tools/tickets.js';
import { kanbanTools } from './tools/kanban.js';


// Configuration
const NEXTAUTH_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';
const AUTH_TOKEN = process.env.AUTH_TOKEN;
const MCP_PORT = parseInt(process.env.MCP_PORT || '3001', 10);

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

/**
 * Create a new MCP Server + Transport pair for a single session.
 *
 * The SDK's _initialized flag is per-transport-instance, so every new
 * initialize handshake must get a brand-new transport (and a fresh Server
 * bound to it). Subsequent requests in the same session are routed to the
 * same transport via the sessions map.
 *
 * authToken comes from the client's Authorization header so the backend API
 * receives the same credentials the chat client was given.
 */
async function createSessionTransport(
  sessions: Map<string, StreamableHTTPServerTransport>,
  authToken?: string
): Promise<StreamableHTTPServerTransport> {
  // Per-session API client: prefer the token forwarded from the client,
  // fall back to the server-level AUTH_TOKEN env var.
  const sessionApiClient = new ApiClient({
    apiBaseUrl: NEXTAUTH_URL,
    authToken: authToken || AUTH_TOKEN,
  });

  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => randomUUID(),
    onsessioninitialized: (sessionId) => {
      console.error(`[MCP] Session created: ${sessionId}`);
      sessions.set(sessionId, transport);
    },
  });

  const server = new Server(
    { name: 'ticket-management-mcp-server', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: allTools.map((tool) => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema,
    })),
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const tool = allTools.find((t) => t.name === name);
    if (!tool) {
      throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
    }
    try {
      return await tool.handler(args, sessionApiClient);
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  });

  transport.onclose = () => {
    const sessionId = transport.sessionId;
    if (sessionId) {
      console.error(`[MCP] Session closed: ${sessionId}`);
      sessions.delete(sessionId);
    }
  };

  await server.connect(transport);
  return transport;
}

async function main() {
  // Map of active sessions: sessionId → transport
  const sessions = new Map<string, StreamableHTTPServerTransport>();

  const app = express();

  // CORS — expose mcp-session-id so browser JS can read it from the initialize response
  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'mcp-protocol-version', 'mcp-session-id'],
    exposedHeaders: ['mcp-session-id'],
  }));

  // Parse JSON bodies — Express hands the result to us via req.body
  app.use(express.json());

  // ── Health check ──────────────────────────────────────────────────────────
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', sessions: sessions.size });
  });

  // ── Shared MCP handler (POST + DELETE share the same logic) ───────────────
  async function handleMcp(req: express.Request, res: express.Response) {
    try {
      const sessionId = req.headers['mcp-session-id'] as string | undefined;
      let transport: StreamableHTTPServerTransport;

      if (sessionId) {
        // Subsequent request — route to the existing session transport
        const existing = sessions.get(sessionId);
        if (!existing) {
          res.status(404).json({ jsonrpc: '2.0', error: { code: -32000, message: 'Session not found' }, id: null });
          return;
        }
        transport = existing;
      } else {
        // No session ID → initialize request; create a new session.
        // Extract the client's API key and forward it to the backend API client.
        const authHeader = req.headers['authorization'] as string | undefined;
        const authToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
        transport = await createSessionTransport(sessions, authToken);
      }

      // req.body is already parsed by express.json(); pass it as parsedBody
      await transport.handleRequest(req, res, req.body);
    } catch (error) {
      console.error('[MCP] Error handling request:', error instanceof Error ? error.message : error);
      if (!res.headersSent) {
        res.status(500).json({ jsonrpc: '2.0', error: { code: -32603, message: 'Internal server error' }, id: null });
      }
    }
  }

  app.post('/mcp', handleMcp);
  app.delete('/mcp', handleMcp);
  // GET /mcp supports SSE streaming (used by some MCP clients)
  app.get('/mcp', handleMcp);

  app.listen(MCP_PORT, () => {
    console.error(`[MCP Server] Running on http://localhost:${MCP_PORT}/mcp`);
    console.error(`[MCP Server] Health: http://localhost:${MCP_PORT}/health`);
  });
}

main();


