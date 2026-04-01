import { useState, useEffect } from 'react';
import { MCPClient } from './lib/mcp-client';
import AuthForm from './components/AuthForm';
import ChatInterface from './components/ChatInterface';

const MCP_SERVER_URL = import.meta.env.VITE_MCP_SERVER_URL || 'http://localhost:3001/mcp';

function App() {
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
      <ChatInterface mcpClient={mcpClient} />
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
