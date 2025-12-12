# Vercel Deployment Guide

This guide explains how the MCP server is deployed alongside the Next.js application on Vercel.

## Architecture

The MCP server is integrated as a Next.js API route at `/api/mcp/*`, which means:

- ✅ **No separate deployment needed** - Deploys with your Next.js app
- ✅ **Automatic scaling** - Uses Vercel's serverless functions
- ✅ **Same authentication** - Uses NextAuth session cookies
- ✅ **HTTP transport** - Simple HTTP/JSON protocol (no SSE needed)

## Deployment

### Automatic Deployment

When you deploy your Next.js app to Vercel, the MCP server is automatically included:

1. Push to your repository
2. Vercel detects changes
3. Builds and deploys the Next.js app
4. `/api/mcp` endpoint is available at: `https://your-app.vercel.app/api/mcp`

### Manual Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Or deploy to production
vercel --prod
```

## Environment Variables

Ensure these environment variables are set in Vercel:

1. **NEXTAUTH_URL** - Your app's base URL
   - Production: `https://your-app.vercel.app`
   - Preview: Automatically set by Vercel (or use `VERCEL_URL`)

2. **NEXTAUTH_SECRET** - Required for NextAuth
   - Generate: `openssl rand -base64 32`

3. **Database/Other vars** - Your existing environment variables

## Endpoint URLs

After deployment, your MCP server is available at:

- **Production**: `https://your-app.vercel.app/api/mcp`
- **Preview**: `https://your-app-git-branch-username.vercel.app/api/mcp`

## Testing the Deployment

### 1. Health Check

```bash
curl https://your-app.vercel.app/api/mcp
```

Should return server info (requires authentication).

### 2. List Tools

```bash
curl -X POST https://your-app.vercel.app/api/mcp \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list"
  }'
```

### 3. Call a Tool

```bash
curl -X POST https://your-app.vercel.app/api/mcp \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/call",
    "params": {
      "name": "project_list",
      "arguments": {}
    }
  }'
```

## Vercel Configuration

### Function Configuration

The MCP endpoint uses Vercel's serverless functions. No special configuration needed, but you can optimize:

**`vercel.json`** (optional):
```json
{
  "functions": {
    "app/api/mcp/[...path]/route.ts": {
      "maxDuration": 30
    }
  }
}
```

### CORS (if needed for external clients)

If you need to allow CORS from external domains, add headers in the route:

```typescript
// In app/api/mcp/[...path]/route.ts
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': 'https://your-client-domain.com',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Cookie',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}
```

## Monitoring

### Vercel Logs

View logs in Vercel dashboard:
- Go to your project → Functions → `/api/mcp`
- View real-time logs and errors

### Error Tracking

The route includes error logging:
```typescript
console.error('MCP server error:', error);
```

Consider adding:
- Sentry for error tracking
- Vercel Analytics for performance monitoring

## Performance Considerations

### Cold Starts

Serverless functions have cold starts. To minimize:
- Keep functions warm with periodic pings
- Use Vercel Pro for better performance
- Consider Edge Functions for lower latency (if compatible)

### Timeout

Default timeout is 10 seconds (Hobby) or 60 seconds (Pro).
- Most MCP tool calls should complete quickly
- If you need longer, upgrade to Pro plan

### Rate Limiting

Vercel has rate limits based on your plan:
- Hobby: 100GB-hours/month
- Pro: 1000GB-hours/month

Monitor usage in Vercel dashboard.

## Troubleshooting

### 401 Unauthorized

- **Cause**: Session cookie expired or invalid
- **Solution**: Log in to the app in browser, extract fresh cookie

### 500 Internal Server Error

- **Cause**: Tool execution error or server issue
- **Solution**: Check Vercel function logs for details

### Function Timeout

- **Cause**: Tool execution taking too long
- **Solution**: 
  - Optimize tool handlers
  - Upgrade to Pro plan for longer timeouts
  - Consider breaking into smaller operations

### CORS Errors

- **Cause**: Making requests from different origin
- **Solution**: 
  - Use cookie forwarding (see CLIENT_SETUP.md)
  - Or configure CORS headers (see above)

## Security

### Authentication

- ✅ Uses NextAuth session cookies
- ✅ Validates session on every request
- ✅ No API keys needed

### HTTPS

- ✅ Vercel automatically provides HTTPS
- ✅ Cookies are secure (HttpOnly, Secure flags)

### Rate Limiting

Consider adding rate limiting for production:
- Use Vercel's built-in rate limiting
- Or implement custom middleware

## Next Steps

1. Deploy to Vercel
2. Test the endpoint
3. Set up monitoring
4. Configure CORS if needed
5. Share endpoint URL with clients

For client setup, see [CLIENT_SETUP.md](./CLIENT_SETUP.md).

