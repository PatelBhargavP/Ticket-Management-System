"use server";

import { authOptions } from "@/auth";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/db";
import { ApiKey, IApiKeyDocument, IApiKeyModel } from "@/models/ApiKey";

export interface CreateApiKeyResult {
  apiKey: string; // Only returned once - plain text key
  keyId: string;
  name?: string;
  createdAt: Date;
  expiresAt?: Date;
}

export async function createApiKey(name?: string, expiresInDays?: number): Promise<CreateApiKeyResult> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.userId) {
      throw new Error('Cannot create API key: user is not logged in');
    }

    await dbConnect();

    // Generate new API key
    const plainKey = (ApiKey as IApiKeyModel).generateKey();
    const keyHash = (ApiKey as IApiKeyModel).hashKey(plainKey);

    // Calculate expiration date if provided
    // expiresInDays can be a decimal (e.g., 0.5 for 12 hours)
    const expiresAt = expiresInDays && expiresInDays > 0
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : undefined;

    // Create API key document
    const apiKeyDoc = await ApiKey.create({
      userId: session.userId,
      
      keyHash,
      name: name || 'MCP Client Key',
      expiresAt,
      isActive: true,
    });

    // Return the plain key (only time it's available)
    // Mongoose documents return Date objects, but TypeScript sees them as Date | string
    const createdAt = apiKeyDoc.createdAt instanceof Date 
      ? apiKeyDoc.createdAt 
      : new Date(apiKeyDoc.createdAt as string);
    
    const expiresAtDate = apiKeyDoc.expiresAt 
      ? (apiKeyDoc.expiresAt instanceof Date 
          ? apiKeyDoc.expiresAt 
          : new Date(apiKeyDoc.expiresAt as string))
      : undefined;

    // Ensure we're returning the plainKey, not the keyId
    // Double-check that plainKey is still the generated key
    if (!plainKey || !plainKey.startsWith('tms_')) {
      throw new Error('Failed to generate API key in correct format');
    }

    const result: CreateApiKeyResult = {
      apiKey: plainKey, // This MUST be the tms_ prefixed key (only returned once)
      keyId: apiKeyDoc.keyId || apiKeyDoc._id?.toString() || '',
      name: apiKeyDoc.name,
      createdAt,
      expiresAt: expiresAtDate,
    };
    
    // Final verification before returning
    if (!result.apiKey.startsWith('tms_')) {
      throw new Error('API key format validation failed');
    }
    
    return result;
  } catch (error) {
    console.error('Error creating API key:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to create API key: ${error.message}`);
    }
    throw new Error('Failed to create API key');
  }
}
