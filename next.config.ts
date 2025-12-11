import type { NextConfig } from 'next';
import path from 'path';
// Load .env file explicitly before Next.js processes environment variables
import './lib/env-loader';

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(process.cwd(), '..'),
  },
};

export default nextConfig;