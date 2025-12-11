// app/api/transactions/[ticketId]/route.ts
import { getTransactions } from '@/app/actions/getTransactions';
import tokenParser from '@/lib/token-parser';
import { ITransactionDetails } from '@/models/Transaction';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: Promise<{ entityId: string }> }) {
    try {
        // Parse for the user id
        const token = await tokenParser(req);
        if(token.errorRes) {
            return NextResponse.json({ error: 'User unauthorized' }, { status: 401 });
        }
        const { entityId } = await params;
        const data = await getTransactions(entityId);
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error processing request:', error);
        return NextResponse.json({ error: 'Failed to process get transactions request' }, { status: 500 });
    }
}
