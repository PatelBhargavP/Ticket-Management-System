/**
 * MCP Server API Route Handler
 * 
 * Handles MCP protocol requests via HTTP transport.
 * Available at /api/mcp
 * 
 * Authentication: Uses NextAuth session cookies from the browser
 */

import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { createMCPServer } from '@/mcp-server/server-instance';
import { getBaseUrlFromRequest } from '@/lib/get-base-url';
import { validateApiKey } from '@/app/actions/validateApiKey';

/**
 * Handle MCP protocol requests
 * 
 * MCP uses JSON-RPC style requests:
 * - POST /api/mcp with body: { method: "tools/list" } or { method: "tools/call", params: {...} }
 * 
 * Authentication: Supports both NextAuth session cookies and API key (Bearer token)
 */
export async function POST(request: NextRequest) {
  try {
    // Try API key authentication first (Bearer token)
    const authHeader = request.headers.get('authorization');
    let userId: string | undefined;
    let authMethod: 'session' | 'api-key' = 'session';

    if (authHeader?.startsWith('Bearer ')) {
      const apiKey = authHeader.substring(7);
      const validation = await validateApiKey(apiKey);
      if (validation.valid && validation.userId) {
        userId = validation.userId;
        authMethod = 'api-key';
      } else {
        return NextResponse.json(
          { 
            jsonrpc: '2.0',
            id: null,
            error: { 
              code: -32001, 
              message: validation.error || 'Invalid API key.',
              data: validation.error
            } 
          },
          { 
            status: 401,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'POST, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
          }
        );
      }
    } else {
      // Fallback to NextAuth session cookie
      const token = await getToken({ req: request });
      if (!token?.userId) {
        return NextResponse.json(
          { 
            jsonrpc: '2.0',
            id: null,
            error: { code: -32001, message: 'Unauthorized. Please log in or provide a valid API key.' } 
          },
          { 
            status: 401,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'POST, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
          }
        );
      }
      userId = token.userId;
    }

    // Get the request body
    const body = await request.json();
    const { method, params, id } = body;

    if (!method) {
      return NextResponse.json(
        { error: { code: -32600, message: 'Invalid Request: method is required' }, id },
        { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        }
      );
    }

    // Get base URL for API client - use request headers for accurate URL
    const baseUrl = getBaseUrlFromRequest(request);
    
    // Prepare authentication for API client
    let authCookie: string | undefined;
    let apiKey: string | undefined;
    
    if (authMethod === 'session') {
      // Use cookies for session-based auth
      authCookie = request.headers.get('cookie') || undefined;
    } else {
      // Use API key for Bearer token auth
      apiKey = authHeader?.substring(7); // Extract API key from "Bearer <key>"
    }
    
    // Create MCP server instance with authenticated API client
    const { handleRequest } = createMCPServer({
      apiBaseUrl: baseUrl,
      authCookie,
      apiKey,
    });

    // Handle the MCP request
    try {
      // For tools/call, params should be { name, arguments }
      // For tools/list, params can be empty
      const result = await handleRequest(method, params || {});
      
      // Return JSON-RPC style response
      return NextResponse.json({
        jsonrpc: '2.0',
        id: id ?? null,
        result,
      }, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    } catch (error) {
      // Handle tool execution errors
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('MCP tool execution error:', error);
        return NextResponse.json({
          jsonrpc: '2.0',
          id: id ?? null,
          error: {
            code: -32603,
            message: 'Internal error',
            data: errorMessage,
          },
        }, { 
          status: 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        });
    }
  } catch (error) {
    console.error('MCP server error:', error);
      return NextResponse.json(
      {
        jsonrpc: '2.0',
        id: null,
        error: {
          code: -32603,
          message: 'Internal server error',
          data: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );
  }
}

/**
 * Handle OPTIONS requests for CORS preflight
 */
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}

/**
 * Handle GET requests for server info or health checks
 */
export async function GET(request: NextRequest) {
  // Verify authentication
  const token = await getToken({ req: request });
  if (!token) {
    return NextResponse.json(
      { error: 'Unauthorized. Please log in to the application.' },
      { status: 401 }
    );
  }

  // Return server information
  return NextResponse.json({
    name: 'ticket-management-system',
    version: '1.0.0',
    protocol: 'mcp',
    transport: 'http',
    endpoint: '/api/mcp',
  });
}
