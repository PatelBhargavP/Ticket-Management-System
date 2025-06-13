// app/api/transactions/[ticketId]/route.ts
import { getTransactions } from '@/app/actions/getTransactions';
import tokenParser from '@/lib/token-parser';
import { ITransactionDetails } from '@/models/Transaction';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { entityId: string } }) {
    try {
        // Parse for the user id
        const res = NextResponse<ITransactionDetails[] | { message: string }>;
        const token = await tokenParser(req);
        if(token.errorRes) {
            return res.json({ error: 'User unauthorized' }, { status: 401 });
        }
        const data = await getTransactions(params.entityId);
        return res.json(data);
    } catch (error) {
        console.error('Error processing request:', error);
        return NextResponse.json({ error: 'Failed to process get transactions request' }, { status: 500 });
    }
}
