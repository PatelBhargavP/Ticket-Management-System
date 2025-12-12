# MCP Chat Client

A chat interface client for the Ticket Management System MCP server. Interact with your projects, tickets, and kanban boards through natural language commands.

## Features

- Natural language command parsing
- Real-time chat interface
- API key authentication
- Tool result display
- Dark mode support

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env and set VITE_MCP_SERVER_URL to your MCP server URL
```

3. Start development server:
```bash
npm run dev
```

## Getting an API Key

The chat client includes instructions on the login screen, but here are the methods:

### Method 1: Browser Console (Easiest)

1. Log into the Ticket Management System in your browser
2. Open DevTools (F12) → Console tab
3. Run this command (replace the URL if your server is on a different port):
```javascript
fetch('http://localhost:3000/api/mcp-auth/api-key', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ name: 'MCP Chat Client' })
})
.then(r => r.json())
.then(d => {
  console.log('API Key:', d.apiKey);
  alert('API Key: ' + d.apiKey);
})
```
4. Copy the API key from the alert/console
5. Paste it into the chat client

### Method 2: Using curl

```bash
curl -X POST http://localhost:3000/api/mcp-auth/api-key \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{"name": "MCP Chat Client"}'
```

Replace `YOUR_SESSION_TOKEN` with your session cookie from browser DevTools → Application → Cookies.

**Important:** The API key is only shown once when created. Make sure to copy it immediately!

## Usage

### Example Commands

- "create project called MyProject"
- "list projects"
- "create ticket in PROJECT123 called Fix bug"
- "update ticket TICKET456 in PROJECT123 name: New name"

### Available Tools

- **Projects**: create, list, get by identifier
- **Tickets**: create, update
- **Kanban**: set column order

## Development

```bash
# Development
npm run dev

# Build
npm run build

# Preview
npm run preview
```

## Architecture

- `src/lib/mcp-client.ts` - MCP protocol client
- `src/lib/nlp-parser.ts` - Natural language parser
- `src/components/` - React components
- `src/types/` - TypeScript types
