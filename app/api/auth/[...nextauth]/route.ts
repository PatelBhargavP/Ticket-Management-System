import { handlers } from "@/auth" // Referring to the auth.ts we just created

/**
 * NextAuth route handlers
 * 
 * The base URL is automatically determined from:
 * - NEXTAUTH_URL (if explicitly set)
 * - VERCEL_URL (automatically provided by Vercel)
 * - Localhost (for local development)
 * 
 * This ensures it works correctly on:
 * - Vercel production deployments
 * - Vercel preview deployments (dynamic URLs)
 * - Local development
 */
export { handlers as GET, handlers as POST };
