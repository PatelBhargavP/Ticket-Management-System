/**
 * MCP Client Library
 * 
 * Wrapper around the MCP (Model Context Protocol) JSON-RPC protocol
 * for communicating with the Ticket Management System MCP server
 */

export interface MCPRequest {
  jsonrpc: '2.0';
  id: number | string | null;
  method: string;
  params?: unknown;
}

export interface MCPResponse {
  jsonrpc: '2.0';
  id: number | string | null;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

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
  private requestId = 0;

  constructor(config: MCPClientConfig) {
    this.serverUrl = config.serverUrl.replace(/\/$/, ''); // Remove trailing slash
    this.apiKey = config.apiKey;
  }

  /**
   * Make an MCP request
   */
  private async request(method: string, params?: unknown): Promise<MCPResponse> {
    const requestId = ++this.requestId;
    const request: MCPRequest = {
      jsonrpc: '2.0',
      id: requestId,
      method,
      params,
    };

    try {
      const response = await fetch(this.serverUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: MCPResponse = await response.json();

      if (data.error) {
        throw new Error(data.error.message || 'MCP request failed');
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error occurred during MCP request');
    }
  }

  /**
   * List available tools
   */
  async listTools(): Promise<{ tools: MCPTool[] }> {
    const response = await this.request('tools/list');
    return response.result as { tools: MCPTool[] };
  }

  /**
   * Call a tool
   */
  async callTool(toolName: string, args: unknown): Promise<unknown> {
    const response = await this.request('tools/call', {
      name: toolName,
      arguments: args,
    });
    return response.result;
  }

  /**
   * Update API key
   */
  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }
}
