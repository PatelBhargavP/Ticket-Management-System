import { useState, useRef, useEffect } from 'react';
import { MCPClient } from '../lib/mcp-client';
import { NLPParser } from '../lib/nlp-parser';
import type { ChatMessage } from '../types/chat';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';

interface ChatInterfaceProps {
  mcpClient: MCPClient;
}

export default function ChatInterface({ mcpClient }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const parser = new NLPParser();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (input: string) => {
    if (!input.trim() || isLoading) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Parse natural language to tool call
      const command = parser.parse(input);

      if (!command) {
        // If no command matched, show error
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'I didn\'t understand that command. Try:\n- "create project called MyProject"\n- "list projects"\n- "create ticket in PROJECT123"',
          timestamp: new Date(),
          error: 'Unknown command',
        };
        setMessages(prev => [...prev, errorMessage]);
        setIsLoading(false);
        return;
      }

      // Call the MCP tool
      const result = await mcpClient.callTool(command.tool, command.args);

      // Format result
      const resultMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Executed: ${command.tool}\n\nResult:\n${JSON.stringify(result, null, 2)}`,
        timestamp: new Date(),
        toolResult: result,
      };
      setMessages(prev => [...prev, resultMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
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
            <p>Try commands like:</p>
            <ul className="mt-2 space-y-1 text-sm">
              <li>"create project called &lt;project name&gt;"</li>
              <li>"list projects"</li>
              <li>"create ticket in &lt;project name&gt;"</li>
            </ul>
          </div>
        )}
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 dark:bg-gray-700 rounded-lg px-4 py-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
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
