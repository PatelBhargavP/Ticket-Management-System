/**
 * MCP Client Library
 * 
 * Wrapper around the MCP (Model Context Protocol) JSON-RPC protocol
 * for communicating with the Ticket Management System MCP server
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { CallToolResultSchema } from '@modelcontextprotocol/sdk/types.js';

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: unknown;
}

export interface MCPClientConfig {
  serverUrl: string;
  apiKey: string;
}

export class MCPClient {
  private serverUrl: string;
  private apiKey: string;
  private client: Client;
  private transport: StreamableHTTPClientTransport;
  private connected = false;

  constructor(config: MCPClientConfig) {
    this.serverUrl = config.serverUrl.replace(/\/$/, '');
    this.apiKey = config.apiKey;

    const endpoint = new URL(this.serverUrl);

    this.transport = new StreamableHTTPClientTransport(endpoint, {
      requestInit: {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json, text/event-stream',
          'Authorization': `Bearer ${this.apiKey}`,
        },
      },
    }) as unknown as StreamableHTTPClientTransport;

    this.client = new Client(
      { name: 'mcp-chat-client', version: '1.0.0' },
      { capabilities: {} }
    );
  }

  async connect(): Promise<void> {
    if (this.connected) return;

    try {
      await this.client.connect(this.transport);
      this.connected = true;
    } catch (error) {
      console.error('[MCP Client] Connection error:', error);
      throw new Error(
        error instanceof Error 
          ? `Failed to connect to MCP server: ${error.message}`
          : 'Failed to connect to MCP server'
      );
    }
  }

  async disconnect(): Promise<void> {
    await this.transport.close();
    this.connected = false;
  }

  private maybeReauth() {
    if (!this.connected) {
      throw new Error('MCP client is not connected. Call connect() first.');
    }
  }

  async listTools(): Promise<{ tools: MCPTool[] }> {
    this.maybeReauth();
    const result = await this.client.listTools();
    return { tools: result.tools as MCPTool[] };
  }

  async callTool(toolName: string, args: unknown): Promise<unknown> {
    this.maybeReauth();
    const result = await this.client.callTool(
      {
        name: toolName,
        arguments: (typeof args === 'object' && args !== null ? (args as Record<string, unknown>) : {}),
      },
      CallToolResultSchema
    );

    return result;
  }

  async setApiKey(apiKey: string): Promise<void> {
    this.apiKey = apiKey;

    // Close old transport and recreate with new credentials.
    if (this.connected) {
      await this.transport.close();
      this.connected = false;
    }

    this.transport = new StreamableHTTPClientTransport(new URL(this.serverUrl), {
      requestInit: {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json, text/event-stream',
          'Authorization': `Bearer ${this.apiKey}`,
        },
      },
    });

    await this.connect();
  }
}
