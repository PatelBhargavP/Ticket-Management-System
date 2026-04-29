import { useState, useRef, useEffect } from 'react';
import { MCPClient } from '../lib/mcp-client';
import { LLMService } from '../lib/llm-service';
import type { MCPTool } from '../lib/mcp-client';
import type { ConversationMessage } from '../lib/llm-service';
import type { ChatMessage } from '../types/chat';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';

interface ChatInterfaceProps {
  mcpClient: MCPClient;
  geminiApiKey: string;
}

export default function ChatInterface({ mcpClient, geminiApiKey }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [tools, setTools] = useState<MCPTool[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Conversation history in Gemini Content format — does not drive rendering.
  const conversationHistoryRef = useRef<ConversationMessage[]>([]);
  // Stable LLMService instance for the lifetime of this component.
  const llmServiceRef = useRef<LLMService>(
    new LLMService({ apiKey: geminiApiKey }),
  );

  // Scroll to bottom on new messages.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch available MCP tools once on mount.
  useEffect(() => {
    mcpClient
      .listTools()
      .then(({ tools: t }) => setTools(t))
      .catch((err) => console.error('[ChatInterface] Failed to load tools:', err));
  }, [mcpClient]);

  const handleSend = async (input: string) => {
    if (!input.trim() || isLoading) return;

    // Show the user's message immediately.
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Append the user turn in Gemini Content format.
    conversationHistoryRef.current.push({ role: 'user', parts: [{ text: input }] });

    try {
      const { response, updatedHistory } = await llmServiceRef.current.chat(
        conversationHistoryRef.current,
        tools,
        (toolName, args) => mcpClient.callTool(toolName, args),
        setStatus,
      );

      // Persist the full updated history (includes tool_use / tool_result turns).
      conversationHistoryRef.current = updatedHistory;

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setStatus(null);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          MCP Chat Client
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Chat with your Ticket Management System
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
            <p className="text-lg font-medium mb-2">Welcome!</p>
            <p>Ask me anything about your projects and tickets:</p>
            <ul className="mt-2 space-y-1 text-sm">
              <li>"Show me all my projects"</li>
              <li>"Create a new project called Redesign"</li>
              <li>"What tickets are in project ABC?"</li>
              <li>"Create a high-priority ticket for the login bug"</li>
            </ul>
          </div>
        )}
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 dark:bg-gray-700 rounded-lg px-4 py-2 min-w-[120px]">
              {status ? (
                <span className="text-sm text-gray-600 dark:text-gray-300 italic">
                  {status}
                </span>
              ) : (
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              )}
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
