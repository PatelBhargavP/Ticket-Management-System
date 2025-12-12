"use server";

import { authOptions } from "@/auth";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/db";
import { ApiKey } from "@/models/ApiKey";

export async function revokeApiKey(keyId: string): Promise<void> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.userId) {
      throw new Error('Cannot revoke API key: user is not logged in');
    }

    await dbConnect();

    // Find and verify ownership
    const apiKey = await ApiKey.findOne({
      keyId,
      userId: session.userId,
    });

    if (!apiKey) {
      throw new Error('API key not found or you do not have permission to revoke it');
    }

    // Deactivate the key (soft delete)
    apiKey.isActive = false;
    await apiKey.save();
  } catch (error) {
    console.error('Error revoking API key:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to revoke API key: ${error.message}`);
    }
    throw new Error('Failed to revoke API key');
  }
}
