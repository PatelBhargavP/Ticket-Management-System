/**
 * API Key Management Endpoint
 * 
 * POST /api/mcp-auth/api-key - Create a new API key
 * GET /api/mcp-auth/api-key - List user's API keys (without exposing keys)
 * DELETE /api/mcp-auth/api-key/[keyId] - Revoke an API key
 */

import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { createApiKey } from '@/app/actions/createApiKey';
import dbConnect from '@/lib/db';
import { ApiKey, IApiKeyDocument } from '@/models/ApiKey';
import { okaResponseStatus } from '@/lib/utils';

/**
 * Create a new API key
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = await getToken({ req: request });
    if (!token?.userId) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in to create an API key.' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { name, expiresInDays } = body;

    // Validate expiresInDays if provided
    // Allow decimal values (e.g., 0.5 for 12 hours)
    if (expiresInDays !== undefined && expiresInDays !== null) {
      const days = Number(expiresInDays);
      if (isNaN(days) || days <= 0 || days > 365) {
        return NextResponse.json(
          { error: 'expiresInDays must be greater than 0 and not more than 365' },
          { status: 400 }
        );
      }
    }

    // Create API key
    const result = await createApiKey(name, expiresInDays);

    return NextResponse.json(result, okaResponseStatus);
  } catch (error) {
    console.error('Error creating API key:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to create API key',
      },
      { status: 500 }
    );
  }
}

/**
 * List user's API keys (without exposing the actual keys)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = await getToken({ req: request });
    if (!token?.userId) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in to view API keys.' },
        { status: 401 }
      );
    }

    await dbConnect();

    // Get user's API keys, sorted by creation date (newest first)
    const apiKeys = await ApiKey.find({
      userId: token.userId,
    })
      .select('-keyHash') // Don't expose the hash
      .sort({ createdAt: -1 }) // Sort by creation date, newest first
      .lean<IApiKeyDocument[]>();

    // Format response
    const formattedKeys = apiKeys.map((key) => ({
      keyId: key.keyId,
      name: key.name,
      createdAt: key.createdAt,
      expiresAt: key.expiresAt,
      lastUsedAt: key.lastUsedAt,
      isActive: key.isActive,
    }));

    return NextResponse.json(formattedKeys, okaResponseStatus);
  } catch (error) {
    console.error('Error fetching API keys:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch API keys',
      },
      { status: 500 }
    );
  }
}

