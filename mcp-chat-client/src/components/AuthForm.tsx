import { useState } from 'react';
import { cn } from '../lib/utils';
import GetApiKeyInstructions from './GetApiKeyInstructions';

interface AuthFormProps {
  onAuth: (apiKey: string) => void;
  serverUrl?: string;
}

export default function AuthForm({ onAuth, serverUrl }: AuthFormProps) {
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      setError('Please enter an API key');
      return;
    }
    setError('');
    onAuth(apiKey.trim());
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div>
          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
            MCP Chat Client
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Enter your API key to continue
          </p>
        </div>
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label htmlFor="api-key" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              API Key
            </label>
            <input
              id="api-key"
              type="password"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setError('');
              }}
              placeholder="tms_..."
              className={cn(
                "mt-1 block w-full px-3 py-2 border rounded-md shadow-sm",
                "bg-white dark:bg-gray-700",
                "text-gray-900 dark:text-white",
                "border-gray-300 dark:border-gray-600",
                "focus:outline-none focus:ring-2 focus:ring-blue-500",
                error && "border-red-500"
              )}
            />
            {error && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Connect
          </button>
        </form>
        <GetApiKeyInstructions serverUrl={serverUrl} />
      </div>
    </div>
  );
}
