import { useState } from 'react';
import type { KeyboardEvent } from 'react';
import { cn } from '../lib/utils';

interface MessageInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export default function MessageInput({ onSend, disabled }: MessageInputProps) {
  const [input, setInput] = useState('');

  const handleSubmit = () => {
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex gap-2">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Type your command..."
        disabled={disabled}
        rows={1}
        className={cn(
          'flex-1 px-4 py-2 border rounded-lg resize-none',
          'bg-white dark:bg-gray-700',
          'text-gray-900 dark:text-white',
          'border-gray-300 dark:border-gray-600',
          'focus:outline-none focus:ring-2 focus:ring-blue-500',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        style={{ minHeight: '44px', maxHeight: '120px' }}
      />
      <button
        onClick={handleSubmit}
        disabled={!input.trim() || disabled}
        className={cn(
          'px-6 py-2 rounded-lg font-medium',
          'bg-blue-600 text-white',
          'hover:bg-blue-700',
          'focus:outline-none focus:ring-2 focus:ring-blue-500',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      >
        Send
      </button>
    </div>
  );
}
