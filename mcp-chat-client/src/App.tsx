import { useState, useEffect } from 'react';
import { AgentClient } from './lib/agent-client';
import AuthForm from './components/AuthForm';
import ChatInterface from './components/ChatInterface';

// ---------------------------------------------------------------------------
// Environment config
// ---------------------------------------------------------------------------

// Python LangGraph agent server
const AGENT_SERVER_URL =
  import.meta.env.VITE_AGENT_SERVER_URL || 'http://localhost:8000';

// Ticket Management System MCP server (forwarded to the Python server)
const MCP_SERVER_URL =
  import.meta.env.VITE_MCP_SERVER_URL || 'http://localhost:3000/api/mcp';

// Singleton client — recreated only when serverUrl changes
const agentClient = new AgentClient(AGENT_SERVER_URL);

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

function App() {
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('mcp_api_key');
    if (stored) setApiKey(stored);
  }, []);

  const handleAuth = (key: string) => {
    localStorage.setItem('mcp_api_key', key);
    setApiKey(key);
  };

  const handleLogout = () => {
    localStorage.removeItem('mcp_api_key');
    setApiKey(null);
  };

  if (!apiKey) {
    return <AuthForm onAuth={handleAuth} serverUrl={MCP_SERVER_URL} />;
  }

  return (
    <div className="h-screen flex flex-col">
      <ChatInterface
        agentClient={agentClient}
        apiKey={apiKey}
        mcpUrl={MCP_SERVER_URL}
      />
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
