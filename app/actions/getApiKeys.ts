"use server";

import { authOptions } from "@/auth";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/db";
import { ApiKey, IApiKeyDocument } from "@/models/ApiKey";

export interface ApiKeyListItem {
  keyId: string;
  name?: string;
  keyHash: string;
  createdAt: Date | string;
  expiresAt?: Date | string;
  lastUsedAt?: Date | string;
  isActive: boolean;
}

export async function getApiKeys(): Promise<ApiKeyListItem[]> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.userId) {
      throw new Error('Cannot fetch API keys: user is not logged in');
    }

    await dbConnect();

    // Get user's API keys
    const apiKeys = await ApiKey.find({
      userId: session.userId,
    })
      .select('-keyHash') // Don't expose the hash
      .sort({ createdAt: -1 }) // Most recent first
      .lean<IApiKeyDocument[]>();

    // Format response
    // Note: keyHash is excluded from the query, so it will be undefined
    // We don't expose the hash for security reasons
    return apiKeys.map((key) => ({
      keyId: key.keyId,
      name: key.name,
      keyHash: '', // Not exposed for security
      createdAt: key.createdAt,
      expiresAt: key.expiresAt,
      lastUsedAt: key.lastUsedAt,
      isActive: key.isActive,
    }));
  } catch (error) {
    console.error('Error fetching API keys:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to fetch API keys: ${error.message}`);
    }
    throw new Error('Failed to fetch API keys');
  }
}
