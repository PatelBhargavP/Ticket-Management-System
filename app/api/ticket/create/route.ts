import { createTicket } from "@/app/actions/createTicket";
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
        const { projectId, ...ticketData } = data;

        if (!projectId) {
            return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
        }

        const result = await createTicket(projectId, ticketData);
        return NextResponse.json(result, okaResponseStatus);
    } catch (error) {
        console.error('Error creating ticket:', error);
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 });
    }
}
