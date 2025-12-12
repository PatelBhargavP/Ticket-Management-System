"use server";

import dbConnect from "@/lib/db";
import { ApiKey, IApiKeyDocument, IApiKeyModel } from "@/models/ApiKey";

export interface ApiKeyValidationResult {
  valid: boolean;
  userId?: string;
  keyId?: string;
  error?: string;
}

export async function validateApiKey(apiKey: string): Promise<ApiKeyValidationResult> {
  try {
    await dbConnect();

    // Validate API key format (should start with tms_)
    // But also allow keyId format for backward compatibility during migration
    const isKeyIdFormat = /^[0-9a-f]{24}$/i.test(apiKey);
    const isTmsFormat = apiKey.startsWith('tms_');
    
    if (!isTmsFormat && !isKeyIdFormat) {
      console.error('API key validation failed: Invalid format. API key should start with "tms_" or be a valid keyId');
      return {
        valid: false,
        error: 'Invalid API key format. API key should start with "tms_"',
      };
    }

    // If it's a keyId format, try to look it up directly
    if (isKeyIdFormat && !isTmsFormat) {
      console.warn('API key validation: Received keyId format instead of full API key. This is deprecated.');
      const apiKeyDoc = await ApiKey.findOne({
        keyId: apiKey,
        isActive: true,
      }).lean<IApiKeyDocument>();

      if (!apiKeyDoc) {
        return {
          valid: false,
          error: 'Invalid API key',
        };
      }

      // Check expiration
      if (apiKeyDoc.expiresAt) {
        const expiresDate = apiKeyDoc.expiresAt instanceof Date 
          ? apiKeyDoc.expiresAt 
          : new Date(apiKeyDoc.expiresAt as string);
        
        if (expiresDate < new Date()) {
          return {
            valid: false,
            error: 'API key has expired',
          };
        }
      }

      // Update last used timestamp
      await ApiKey.updateOne(
        { keyId: apiKeyDoc.keyId },
        { lastUsedAt: new Date() }
      );

      return {
        valid: true,
        userId: apiKeyDoc.userId,
        keyId: apiKeyDoc.keyId,
      };
    }

    // Hash the provided key
    const keyHash = (ApiKey as IApiKeyModel).hashKey(apiKey);

    // Find the API key by hash
    const apiKeyDoc = await ApiKey.findOne({
      keyHash,
      isActive: true,
    }).lean<IApiKeyDocument>();

    if (!apiKeyDoc) {
      console.error('API key validation failed: Key not found in database');
      return {
        valid: false,
        error: 'Invalid API key',
      };
    }

    // Check expiration
    // When using .lean(), dates are returned as strings, so we need to convert
    if (apiKeyDoc.expiresAt) {
      const expiresDate = apiKeyDoc.expiresAt instanceof Date 
        ? apiKeyDoc.expiresAt 
        : new Date(apiKeyDoc.expiresAt as string);
      
      if (expiresDate < new Date()) {
        return {
          valid: false,
          error: 'API key has expired',
        };
      }
    }

    // Update last used timestamp
    await ApiKey.updateOne(
      { keyId: apiKeyDoc.keyId },
      { lastUsedAt: new Date() }
    );

    return {
      valid: true,
      userId: apiKeyDoc.userId,
      keyId: apiKeyDoc.keyId,
    };
  } catch (error) {
    console.error('Error validating API key:', error);
    return {
      valid: false,
      error: 'Failed to validate API key',
    };
  }
}
