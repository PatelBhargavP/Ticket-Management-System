/**
 * Custom environment variable loader
 * This ensures .env file is loaded and available
 * Next.js automatically loads .env files, but this ensures .env is explicitly loaded first
 */
import { config } from 'dotenv';
import { resolve } from 'path';
import { existsSync } from 'fs';

// Load .env file explicitly before Next.js processes environment variables
// This ensures .env variables are available
const envPath = resolve(process.cwd(), '.env');

if (existsSync(envPath)) {
  config({ path: envPath });
}

// Dynamically set NEXTAUTH_URL if not already set
// This ensures it works on Vercel (production and preview deployments) and local dev
if (!process.env.NEXTAUTH_URL) {
  // Check VERCEL_URL (automatically provided by Vercel)
  if (process.env.VERCEL_URL) {
    process.env.NEXTAUTH_URL = `https://${process.env.VERCEL_URL}`;
  } 
  // Fallback to localhost for local development
  else if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
    process.env.NEXTAUTH_URL = 'http://localhost:3000';
  }
  // Check NEXT_PUBLIC_BASE_URL as fallback
  else if (process.env.NEXT_PUBLIC_BASE_URL) {
    process.env.NEXTAUTH_URL = process.env.NEXT_PUBLIC_BASE_URL;
  }
}

// Export a function to verify env vars are loaded
export function verifyEnvVars() {
  const requiredVars = ['MONGODB_URI', 'NEXTAUTH_SECRET'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.warn(
      `⚠️  Warning: Missing environment variables: ${missingVars.join(', ')}\n` +
      `Please ensure these are defined in your .env file.`
    );
  }
}
