import { useState, useEffect } from 'react';
import { MCPClient } from './lib/mcp-client';
import AuthForm from './components/AuthForm';
import ChatInterface from './components/ChatInterface';

const MCP_SERVER_URL = import.meta.env.VITE_MCP_SERVER_URL || 'http://localhost:3001/mcp';
const GEMINI_API_KEY: string = import.meta.env.VITE_GEMINI_API_KEY || '';

function App() {
  // Guard: VITE_GEMINI_API_KEY must be set in .env before the app can work.
  if (!GEMINI_API_KEY) {
    return (
      <div className="h-screen flex flex-col items-center justify-center space-y-3 p-6 text-center">
        <p className="text-red-600 font-semibold text-lg">VITE_GEMINI_API_KEY is not set.</p>
        <p className="text-gray-600 dark:text-gray-400 text-sm max-w-md">
          Create a <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">.env</code> file
          inside <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">mcp-chat-client/</code> and add:
        </p>
        <pre className="bg-gray-100 dark:bg-gray-800 rounded px-4 py-2 text-sm text-left">
          VITE_GEMINI_API_KEY=AIza...
        </pre>
        <p className="text-gray-500 dark:text-gray-500 text-xs">Then restart the dev server.</p>
      </div>
    );
  }

  const [apiKey, setApiKey] = useState<string | null>(null);
  const [mcpClient, setMcpClient] = useState<MCPClient | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    const storedKey = localStorage.getItem('mcp_api_key');
    if (!storedKey) return;

    const initClient = async () => {
      setIsConnecting(true);
      try {
        const client = new MCPClient({ serverUrl: MCP_SERVER_URL, apiKey: storedKey });
        await client.connect();
        setApiKey(storedKey);
        setMcpClient(client);
      } catch (err) {
        setConnectionError(err instanceof Error ? err.message : 'Failed to connect to MCP server');
      } finally {
        setIsConnecting(false);
      }
    };

    initClient();
  }, []);

  const handleAuth = async (key: string) => {
    localStorage.setItem('mcp_api_key', key);

    setIsConnecting(true);
    setConnectionError(null);

    try {
      const client = new MCPClient({ serverUrl: MCP_SERVER_URL, apiKey: key });
      await client.connect();
      setApiKey(key);
      setMcpClient(client);
    } catch (err) {
      setConnectionError(err instanceof Error ? err.message : 'Failed to connect to MCP server');
      setApiKey(null);
      setMcpClient(null);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('mcp_api_key');
    setApiKey(null);
    setMcpClient(null);
  };

  if (isConnecting) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-lg font-medium">Connecting to MCP server...</div>
      </div>
    );
  }

  if (connectionError) {
    return (
      <div className="h-screen flex flex-col items-center justify-center space-y-4 p-4">
        <div className="text-red-600">{connectionError}</div>
        <button
          onClick={() => setConnectionError(null)}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!apiKey || !mcpClient) {
    return <AuthForm onAuth={handleAuth} serverUrl={MCP_SERVER_URL} />;
  }

  return (
    <div className="h-screen flex flex-col">
      <ChatInterface mcpClient={mcpClient} geminiApiKey={GEMINI_API_KEY} />
      <button
        onClick={handleLogout}
        className="fixed top-4 right-4 px-4 py-2 bg-gray-600 text-white cursor-pointer rounded-lg hover:bg-gray-700 text-sm z-50"
      >
        Logout
      </button>
    </div>
  );
}


export default App;
