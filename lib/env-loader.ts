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
