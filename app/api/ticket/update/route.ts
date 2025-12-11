import { updateTicket } from "@/app/actions/updateTicket";
import tokenParser from "@/lib/token-parser";
import { okaResponseStatus } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    // Parse for the user id
    const token = await tokenParser(request);
    if (token.errorRes) {
        // Return 401 Unauthorized when token parsing fails
        return token.errorRes;
    }

    try {
        const data = await request.json();
        const { ticketId, projectId, ...payload } = data;

        if (!ticketId) {
            return NextResponse.json({ error: 'Ticket ID is required' }, { status: 400 });
        }

        if (!projectId) {
            return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
        }

        const result = await updateTicket(ticketId, projectId, payload);
        return NextResponse.json(result, okaResponseStatus);
    } catch (error) {
        console.error('Error updating ticket:', error);
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 });
    }
}
