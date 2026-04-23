/**
 * AgentClient
 * -----------
 * SSE client that talks to the Python LangGraph agent server.
 *
 * Usage
 * -----
 * const client = new AgentClient('http://localhost:8000');
 * const abort = client.streamChat(query, apiKey, {
 *   onThinking, onToolSelected, onToolExecuting,
 *   onToolResult, onUiGenerating, onUiSchema,
 *   onToken, onDone, onError,
 * });
 * // later: abort();
 */

import type { AgentLog, UISchema } from '../types/chat';

// ---------------------------------------------------------------------------
// Callback contract
// ---------------------------------------------------------------------------

export interface AgentStreamCallbacks {
  onThinking: (agent: string, message: string) => void;
  onToolSelected: (tool: string, args: Record<string, unknown>, reasoning: string) => void;
  onToolExecuting: (tool: string) => void;
  onToolResult: (tool: string, result: unknown) => void;
  onUiGenerating: (message: string) => void;
  onUiSchema: (schema: UISchema) => void;
  onToken: (text: string, agent: string) => void;
  onDone: () => void;
  onError: (message: string) => void;
}

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------

export class AgentClient {
  private readonly serverUrl: string;

  constructor(serverUrl: string) {
    this.serverUrl = serverUrl.replace(/\/$/, '');
  }

  /**
   * Open an SSE connection to /chat/stream, parse events, and fire callbacks.
   * Returns a cleanup function that aborts the connection.
   */
  streamChat(
    query: string,
    apiKey: string,
    callbacks: AgentStreamCallbacks,
    mcpUrl?: string,
  ): () => void {
    const params = new URLSearchParams({
      query,
      api_key: apiKey,
      ...(mcpUrl ? { mcp_url: mcpUrl } : {}),
    });

    const url = `${this.serverUrl}/chat/stream?${params.toString()}`;
    const es = new EventSource(url);

    // ── Event listeners ──────────────────────────────────────────────────

    es.addEventListener('agent_thinking', (e: MessageEvent) => {
      try {
        const d = JSON.parse(e.data) as { agent: string; message: string };
        callbacks.onThinking(d.agent, d.message);
      } catch { /* ignore parse errors */ }
    });

    es.addEventListener('tool_selected', (e: MessageEvent) => {
      try {
        const d = JSON.parse(e.data) as {
          tool: string;
          args: Record<string, unknown>;
          reasoning: string;
        };
        callbacks.onToolSelected(d.tool, d.args, d.reasoning);
      } catch { /* ignore */ }
    });

    es.addEventListener('tool_executing', (e: MessageEvent) => {
      try {
        const d = JSON.parse(e.data) as { tool: string };
        callbacks.onToolExecuting(d.tool);
      } catch { /* ignore */ }
    });

    es.addEventListener('tool_result', (e: MessageEvent) => {
      try {
        const d = JSON.parse(e.data) as { tool: string; result: unknown };
        callbacks.onToolResult(d.tool, d.result);
      } catch { /* ignore */ }
    });

    es.addEventListener('ui_generating', (e: MessageEvent) => {
      try {
        const d = JSON.parse(e.data) as { message: string };
        callbacks.onUiGenerating(d.message);
      } catch { /* ignore */ }
    });

    es.addEventListener('ui_schema', (e: MessageEvent) => {
      try {
        const d = JSON.parse(e.data) as { schema: UISchema };
        callbacks.onUiSchema(d.schema);
      } catch { /* ignore */ }
    });

    es.addEventListener('token', (e: MessageEvent) => {
      try {
        const d = JSON.parse(e.data) as { text: string; agent: string };
        callbacks.onToken(d.text, d.agent);
      } catch { /* ignore */ }
    });

    es.addEventListener('done', () => {
      es.close();
      callbacks.onDone();
    });

    // Named server-sent error events (event: error  data: {...})
    es.addEventListener('error', (e: MessageEvent) => {
      if (!e.data) return; // ignore — handled by onerror below
      try {
        const d = JSON.parse(e.data) as { message: string };
        callbacks.onError(d.message);
      } catch {
        /* malformed payload — onerror will clean up */
      }
    });

    // Connection-level errors and normal stream close without a `done` event.
    // This is the single authoritative place that calls es.close() and resets
    // loading state when something goes wrong at the transport layer.
    es.onerror = () => {
      es.close();
      callbacks.onError('SSE connection failed or closed unexpectedly');
    };

    return () => es.close();
  }

  /** Health-check the agent server. */
  async ping(): Promise<boolean> {
    try {
      const res = await fetch(`${this.serverUrl}/health`);
      return res.ok;
    } catch {
      return false;
    }
  }
}

// ---------------------------------------------------------------------------
// Helper — build AgentLog entries from callback payloads
// ---------------------------------------------------------------------------

export function makeLog(
  kind: AgentLog['kind'],
  payload: Record<string, unknown>,
): AgentLog {
  return { kind, payload, ts: Date.now() };
}
