import { createProject } from "@/app/actions/createProject";
import tokenParser from "@/lib/token-parser";
import { okaResponseStatus } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    // Parse for the user id — supports both NextAuth session cookies and
    // Bearer API-key tokens sent by the MCP server.
    const token = await tokenParser(request);
    if (token.errorRes) {
        // Return 401 Unauthorized when token parsing fails
        return token.errorRes;
    }

    try {
        const data = await request.json();
        // Forward the resolved userId so createProject doesn't have to call
        // getServerSession() again (which would fail for Bearer-token requests
        // because there is no session cookie).
        const result = await createProject(data, token.jwt?.userId);
        return NextResponse.json(result, okaResponseStatus);
    } catch (error) {
        console.error('Error creating project:', error);
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
    }
}
