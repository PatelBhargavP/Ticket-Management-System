import { useState, useRef, useEffect, useCallback } from 'react';
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
// Component
// ---------------------------------------------------------------------------

export default function ChatInterface({ agentClient, apiKey, mcpUrl }: ChatInterfaceProps) {
  const [messages, setMessages]   = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<(() => void) | null>(null);

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

          onToken(text, _agent) {
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
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          Generative UI Chat
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Powered by LangGraph agents · Ticket Management System
        </p>
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

        {messages.map(message => (
          <MessageBubble
            key={message.id}
            message={message}
            onAction={handleAction}
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
        <MessageInput onSend={handleSend} disabled={isLoading} />
      </div>
    </div>
  );
}
