/**
 * Dynamically determines the base URL for the application
 * 
 * Priority order:
 * 1. NEXTAUTH_URL (if explicitly set - allows manual override)
 * 2. VERCEL_URL (automatically provided by Vercel for all deployments)
 * 3. NEXT_PUBLIC_BASE_URL (if set for client-side usage)
 * 4. Localhost fallback for development
 * 
 * This ensures the app works correctly on:
 * - Vercel production deployments (uses VERCEL_URL)
 * - Vercel preview deployments (uses VERCEL_URL with dynamic subdomain)
 * - Local development (uses localhost)
 * - Custom domains (can set NEXTAUTH_URL explicitly)
 * 
 * Note: VERCEL_URL is automatically set by Vercel and includes:
 * - Production: your-app.vercel.app
 * - Preview: your-app-git-branch-username.vercel.app
 * - Custom domain: your-custom-domain.com (if configured)
 */
export function getBaseUrl(): string {
  // 1. Check if NEXTAUTH_URL is explicitly set (highest priority - allows manual override)
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL;
  }

  // 2. Check VERCEL_URL (automatically provided by Vercel)
  // VERCEL_URL is provided without protocol, so we need to add https
  // This works for both production and preview deployments
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // 3. Check NEXT_PUBLIC_BASE_URL (if set for client-side usage)
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }

  // 4. Fallback to localhost for local development
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }

  // 5. Last resort fallback (shouldn't reach here in production)
  // This is a safety net, but VERCEL_URL should always be available on Vercel
  console.warn('⚠️  No base URL detected. Using localhost fallback. This may cause issues in production.');
  return 'http://localhost:3000';
}

/**
 * Gets the base URL from request headers (for runtime determination)
 * Useful when you have access to the request object
 */
export function getBaseUrlFromRequest(request: Request | { headers: Headers | { get: (key: string) => string | null } }): string {
  const headers = request.headers instanceof Headers 
    ? request.headers 
    : new Headers(Object.entries(request.headers).map(([key, value]) => [key, typeof value === 'string' ? value : String(value)]) as [string, string][]);

  // Check for forwarded host (from proxies/load balancers)
  const forwardedHost = headers.get('x-forwarded-host');
  const forwardedProto = headers.get('x-forwarded-proto') || 'https';
  
  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  // Check for host header
  const host = headers.get('host');
  if (host) {
    // Determine protocol
    const protocol = headers.get('x-forwarded-proto') || 
                    (process.env.NODE_ENV === 'development' ? 'http' : 'https');
    return `${protocol}://${host}`;
  }

  // Fallback to environment-based URL
  return getBaseUrl();
}
