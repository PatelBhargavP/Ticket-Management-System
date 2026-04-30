import { useState, useRef, useEffect, useCallback } from 'react';
import { AlertCircle, CheckCircle, RefreshCw, Loader2 } from 'lucide-react';
import type { AgentLog, ChatMessage, UISchema } from '../types/chat';
import { AgentClient, makeLog } from '../lib/agent-client';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';

interface ChatInterfaceProps {
  agentClient: AgentClient;
  /** MCP API key forwarded to the Python server */
  apiKey: string;
  /** Optional MCP server URL override */
  mcpUrl?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ServerStatus = 'checking' | 'online' | 'offline';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ChatInterface({ agentClient, apiKey, mcpUrl }: ChatInterfaceProps) {
  const [messages, setMessages]       = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading]     = useState(false);
  const [serverStatus, setServerStatus] = useState<ServerStatus>('checking');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<(() => void) | null>(null);

  // Agent server health check
  const checkServer = useCallback(async () => {
    setServerStatus('checking');
    const ok = await agentClient.ping();
    setServerStatus(ok ? 'online' : 'offline');
  }, [agentClient]);

  useEffect(() => {
    checkServer();
    // Re-check every 30 s while the tab is visible
    const interval = setInterval(checkServer, 30_000);
    return () => clearInterval(interval);
  }, [checkServer]);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Cleanup on unmount
  useEffect(() => () => { abortRef.current?.(); }, []);

  // ---------------------------------------------------------------------------
  // Message mutation helpers
  // ---------------------------------------------------------------------------

  const updateAssistantMsg = useCallback(
    (id: string, updater: (prev: ChatMessage) => ChatMessage) => {
      setMessages(msgs => msgs.map(m => (m.id === id ? updater(m) : m)));
    },
    [],
  );

  // ---------------------------------------------------------------------------
  // Action handler (user clicks a DynamicRenderer action button)
  // ---------------------------------------------------------------------------

  const handleAction = useCallback(
    (tool: string, args: Record<string, unknown>) => {
      // Synthesise a natural-language query and re-run the pipeline
      const query = `Call tool ${tool} with args ${JSON.stringify(args)}`;
      handleSend(query);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [apiKey, mcpUrl],
  );

  // ---------------------------------------------------------------------------
  // Core send handler
  // ---------------------------------------------------------------------------

  const handleSend = useCallback(
    async (input: string) => {
      if (!input.trim() || isLoading) return;

      // Abort any in-flight request
      abortRef.current?.();

      // Add user message
      const userMsg: ChatMessage = {
        id: makeId(),
        role: 'user',
        content: input,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMsg]);
      setIsLoading(true);

      // Placeholder assistant message (will be mutated in place)
      const assistantId = makeId();
      const assistantMsg: ChatMessage = {
        id: assistantId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        agentLogs: [],
      };
      setMessages(prev => [...prev, assistantMsg]);

      // ── SSE callbacks ────────────────────────────────────────────────

      const appendLog = (log: AgentLog) => {
        updateAssistantMsg(assistantId, m => ({
          ...m,
          agentLogs: [...(m.agentLogs ?? []), log],
        }));
      };

      const abort = agentClient.streamChat(
        input,
        apiKey,
        {
          onThinking(agent, message) {
            appendLog(makeLog('thinking', { agent, message }));
          },

          onToolSelected(tool, args, reasoning) {
            appendLog(makeLog('tool_selected', { tool, args, reasoning }));
          },

          onToolExecuting(tool) {
            appendLog(makeLog('tool_executing', { tool }));
          },

          onToolResult(tool, result) {
            appendLog(makeLog('tool_result', { tool, result }));
          },

          onUiGenerating(message) {
            appendLog(makeLog('ui_generating', { message }));
          },

          onUiSchema(schema: UISchema) {
            updateAssistantMsg(assistantId, m => ({
              ...m,
              uiSchema: schema,
            }));
          },

          onToken(text, agent) {
            // Suppress tokens from the ui_renderer node — those are raw JSON
            // schema fragments that will be displayed via DynamicRenderer once
            // the ui_schema SSE event arrives.  Showing them as plain text
            // produces unreadable JSON noise in the chat bubble.
            if (agent === 'ui_renderer') return;
            updateAssistantMsg(assistantId, m => ({
              ...m,
              content: m.content + text,
            }));
          },

          onDone() {
            setIsLoading(false);
            abortRef.current = null;
          },

          onError(message) {
            updateAssistantMsg(assistantId, m => ({
              ...m,
              error: message,
              content: m.content || `Error: ${message}`,
            }));
            setIsLoading(false);
            abortRef.current = null;
          },
        },
        mcpUrl,
      );

      abortRef.current = abort;
    },
    [agentClient, apiKey, isLoading, mcpUrl, updateAssistantMsg],
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Generative UI Chat
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Powered by LangGraph agents · Ticket Management System
            </p>
          </div>
          {/* Server status indicator */}
          <div className="flex items-center gap-1.5">
            {serverStatus === 'checking' && (
              <span className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Connecting…
              </span>
            )}
            {serverStatus === 'online' && (
              <span className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
                <CheckCircle className="w-3.5 h-3.5" />
                Agent server online
              </span>
            )}
            {serverStatus === 'offline' && (
              <button
                onClick={checkServer}
                className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                Agent server offline
                <RefreshCw className="w-3 h-3 ml-0.5" />
              </button>
            )}
          </div>
        </div>

        {/* Offline warning banner */}
        {serverStatus === 'offline' && (
          <div className="mt-2 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3 py-2 text-sm text-red-700 dark:text-red-300">
            ⚠️ The agent server at <code className="font-mono text-xs">{agentClient['serverUrl']}</code> is unreachable.
            Make sure the Python server is running (<code className="font-mono text-xs">uvicorn main:app</code>) then{' '}
            <button onClick={checkServer} className="underline hover:no-underline font-medium">
              retry
            </button>.
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400 mt-10">
            <p className="text-lg font-medium mb-2">What would you like to do?</p>
            <ul className="mt-3 space-y-1.5 text-sm">
              {[
                'Show all my projects',
                'Create a project called Launch Tracker',
                'Create a ticket in project ABC for Login bug',
                'Show kanban board for project XYZ',
              ].map(example => (
                <li key={example}>
                  <button
                    onClick={() => handleSend(example)}
                    className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
                  >
                    "{example}"
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {messages.map((message, idx) => (
          <MessageBubble
            key={message.id}
            message={message}
            onAction={handleAction}
            isLoading={isLoading && idx === messages.length - 1}
          />
        ))}

        {/* Streaming indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 dark:bg-gray-700 rounded-lg px-4 py-2">
              <div className="flex space-x-1">
                {[0, 150, 300].map(delay => (
                  <div
                    key={delay}
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${delay}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-4">
        <MessageInput
          onSend={handleSend}
          disabled={isLoading || serverStatus === 'offline'}
          placeholder={
            serverStatus === 'offline'
              ? 'Agent server offline — cannot send messages'
              : serverStatus === 'checking'
              ? 'Connecting to agent server…'
              : 'Ask anything about your projects or tickets…'
          }
        />
      </div>
    </div>
  );
}
