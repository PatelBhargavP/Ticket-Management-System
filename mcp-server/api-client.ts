/**
 * API Client for making authenticated requests to the Ticket Management System API
 * 
 * Supports both Bearer token and cookie-based authentication (NextAuth.js)
 */

import { MCPConfig, ApiError } from './types';

export class ApiClient {
  private baseUrl: string;
  private authToken?: string;
  private authCookie?: string;

  constructor(config: MCPConfig) {
    this.baseUrl = config.apiBaseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.authToken = config.authToken;
    // Support cookie-based auth (for NextAuth.js)
    // If AUTH_TOKEN looks like a cookie string, treat it as such
    if (this.authToken && this.authToken.includes('=')) {
      this.authCookie = this.authToken;
      this.authToken = undefined;
    }
  }

  /**
   * Makes an authenticated API request
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      // Add header to indicate this is an internal MCP server request
      // This allows the middleware to distinguish internal MCP calls from external requests
      'X-MCP-Internal': 'true',
      ...(options.headers as Record<string, string>),
    };

    // Add authentication - prefer Bearer token, fallback to cookie
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    } else if (this.authCookie) {
      // For NextAuth.js, send the session cookie
      headers['Cookie'] = this.authCookie;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        // Include credentials for cookie-based auth
        credentials: this.authCookie ? 'include' : 'same-origin',
      });

      // Check content type to ensure we're getting JSON
      const contentType = response.headers.get('content-type') || '';
      const isJson = contentType.includes('application/json');
      
      // Get response text first to check if it's HTML
      const responseText = await response.text();
      
      // Check if response is HTML (error page)
      if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<!doctype')) {
        throw new Error(
          `Received HTML response instead of JSON. This usually means the endpoint doesn't exist or there's a routing issue. ` +
          `URL: ${url}, Status: ${response.status} ${response.statusText}`
        );
      }

      if (!response.ok) {
        // Try to parse as JSON for error details
        let errorData: ApiError;
        if (isJson) {
          try {
            errorData = JSON.parse(responseText) as ApiError;
          } catch {
            errorData = {
              error: `HTTP ${response.status}: ${response.statusText}`,
            };
          }
        } else {
          errorData = {
            error: `HTTP ${response.status}: ${response.statusText}. Response was not JSON.`,
          };
        }
        throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
      }

      // Parse JSON response
      if (!isJson) {
        throw new Error(
          `Expected JSON response but received ${contentType || 'unknown content type'}. ` +
          `URL: ${url}, Response preview: ${responseText.substring(0, 200)}`
        );
      }

      try {
        return JSON.parse(responseText) as T;
      } catch (parseError) {
        throw new Error(
          `Failed to parse JSON response. URL: ${url}, ` +
          `Response preview: ${responseText.substring(0, 200)}`
        );
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error occurred during API request');
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  /**
   * Update authentication token or cookie
   */
  setAuthToken(token: string | undefined): void {
    if (token && token.includes('=')) {
      // Looks like a cookie string
      this.authCookie = token;
      this.authToken = undefined;
    } else {
      this.authToken = token;
      this.authCookie = undefined;
    }
  }

  /**
   * Set authentication cookie (for NextAuth.js)
   */
  setAuthCookie(cookie: string | undefined): void {
    this.authCookie = cookie;
    this.authToken = undefined;
  }
}


