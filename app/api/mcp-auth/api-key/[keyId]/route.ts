/**
 * API Key Management - Delete/Revoke
 * 
 * DELETE /api/mcp-auth/api-key/[keyId] - Revoke an API key
 */

import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import dbConnect from '@/lib/db';
import { ApiKey } from '@/models/ApiKey';
import { okaResponseStatus } from '@/lib/utils';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ keyId: string }> }
) {
  try {
    // Verify authentication
    const token = await getToken({ req: request });
    if (!token?.userId) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in to revoke an API key.' },
        { status: 401 }
      );
    }

    const { keyId } = await params;

    await dbConnect();

    // Find and verify ownership
    const apiKey = await ApiKey.findOne({
      keyId,
      userId: token.userId,
    });

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not found or you do not have permission to revoke it.' },
        { status: 404 }
      );
    }

    // Deactivate the key (soft delete)
    apiKey.isActive = false;
    await apiKey.save();

    return NextResponse.json(
      { message: 'API key revoked successfully', keyId },
      okaResponseStatus
    );
  } catch (error) {
    console.error('Error revoking API key:', error);
    return NextResponse.json(
      {
        error: 'Failed to revoke API key',
      },
      { status: 500 }
    );
  }
}

