import type { ChatMessage } from '../types/chat';
import { cn } from '../lib/utils';

interface MessageBubbleProps {
  message: ChatMessage;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isError = !!message.error;

  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[80%] rounded-lg px-4 py-2',
          isUser
            ? 'bg-blue-600 text-white'
            : isError
            ? 'bg-red-100 dark:bg-red-900 text-red-900 dark:text-red-100'
            : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
        )}
      >
        <div className="whitespace-pre-wrap text-sm">{message.content}</div>
        {message.toolResult ? (
          <details className="mt-2">
            <summary className="text-xs opacity-75 cursor-pointer">View details</summary>
            <pre className="mt-2 text-xs overflow-x-auto bg-gray-100 dark:bg-gray-900 p-2 rounded">
              {JSON.stringify(message.toolResult, null, 2)}
            </pre>
          </details>
        ) : null}
        <div className="text-xs opacity-75 mt-1">
          {message.timestamp.toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}
