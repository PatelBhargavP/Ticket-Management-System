import { useState, useEffect } from 'react';
import { MCPClient } from './lib/mcp-client';
import AuthForm from './components/AuthForm';
import ChatInterface from './components/ChatInterface';

const MCP_SERVER_URL = import.meta.env.VITE_MCP_SERVER_URL || 'http://localhost:3000/api/mcp';

function App() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [mcpClient, setMcpClient] = useState<MCPClient | null>(null);

  useEffect(() => {
    // Load API key from localStorage
    const storedKey = localStorage.getItem('mcp_api_key');
    if (storedKey) {
      setApiKey(storedKey);
      setMcpClient(new MCPClient({
        serverUrl: MCP_SERVER_URL,
        apiKey: storedKey,
      }));
    }
  }, []);

  const handleAuth = (key: string) => {
    localStorage.setItem('mcp_api_key', key);
    setApiKey(key);
    setMcpClient(new MCPClient({
      serverUrl: MCP_SERVER_URL,
      apiKey: key,
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem('mcp_api_key');
    setApiKey(null);
    setMcpClient(null);
  };

  if (!apiKey || !mcpClient) {
    return <AuthForm onAuth={handleAuth} serverUrl={MCP_SERVER_URL} />;
  }

  return (
    <div className="h-screen flex flex-col">
      <ChatInterface mcpClient={mcpClient} />
      <button
        onClick={handleLogout}
        className="fixed bottom-4 right-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
      >
        Logout
      </button>
    </div>
  );
}

export default App;
