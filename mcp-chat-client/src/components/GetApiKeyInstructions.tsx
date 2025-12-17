import { useState } from 'react';

interface GetApiKeyInstructionsProps {
  serverUrl?: string;
}

export default function GetApiKeyInstructions({ serverUrl }: GetApiKeyInstructionsProps) {
  const [copied, setCopied] = useState(false);

  const apiEndpoint = serverUrl 
    ? `${serverUrl.replace('/api/mcp', '')}/api/mcp-auth/api-key`
    : 'http://localhost:3000/api/mcp-auth/api-key';

  const curlCommand = `curl -X POST ${apiEndpoint} \\
  -H "Content-Type: application/json" \\
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \\
  -d '{"name": "MCP Chat Client"}'`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
      <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
        How to Get Your API Key
      </h3>
      
      <div className="space-y-3 text-xs text-blue-800 dark:text-blue-200">
        <div>
          <p className="font-medium mb-1">Method 1: Browser Console (Easiest)</p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>Log into the Ticket Management System in your browser</li>
            <li>Open DevTools (F12) → Console tab</li>
            <li>Run this command:</li>
          </ol>
          <div className="mt-2 relative">
            <pre className="p-2 bg-white dark:bg-gray-800 rounded text-xs overflow-x-auto border border-blue-200 dark:border-blue-700">
              <code>{`fetch('${apiEndpoint}', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ name: 'MCP Chat Client' })
})
.then(r => r.json())
.then(d => {
  console.log('API Key:', d.apiKey);
  alert('API Key: ' + d.apiKey);
})`}</code>
            </pre>
            <button
              onClick={() => copyToClipboard(`fetch('${apiEndpoint}', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ name: 'MCP Chat Client' })
})
.then(r => r.json())
.then(d => {
  console.log('API Key:', d.apiKey);
  alert('API Key: ' + d.apiKey);
})`)}
              className="absolute top-2 right-2 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        <div>
          <p className="font-medium mb-1">Method 2: Using curl</p>
          <div className="mt-2 relative">
            <pre className="p-2 bg-white dark:bg-gray-800 rounded text-xs overflow-x-auto border border-blue-200 dark:border-blue-700">
              <code>{curlCommand}</code>
            </pre>
            <button
              onClick={() => copyToClipboard(curlCommand)}
              className="absolute top-2 right-2 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <p className="mt-1 text-xs italic">
            Replace YOUR_SESSION_TOKEN with your actual session cookie from browser DevTools → Application → Cookies
          </p>
        </div>

        <div className="pt-2 border-t border-blue-200 dark:border-blue-700">
          <p className="text-xs">
            <strong>Note:</strong> The API key is only shown once when created. Make sure to copy it immediately!
          </p>
        </div>
      </div>
    </div>
  );
}
