import { getPaginatedProjectTickets } from "@/app/actions/getPaginatedProjectTickets";
import tokenParser from "@/lib/token-parser";
import { okaResponseStatus } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    // Parse for the user id
    const token = await tokenParser(request);
    if (token.errorRes) {
        return token.errorRes;
    }

    const { searchParams } = new URL(request.url);

    const projectId = searchParams.get("projectId");
    if (!projectId) {
        return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }

    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const pageSize = Math.min(200, Math.max(1, parseInt(searchParams.get("pageSize") ?? "100", 10)));
    const sortBy = searchParams.get("sortBy") ?? "createdAt";
    const sortOrderRaw = searchParams.get("sortOrder") ?? "desc";
    const sortOrder = sortOrderRaw === "asc" ? "asc" : "desc";

    try {
        const result = await getPaginatedProjectTickets(projectId, {}, { page, pageSize, sortBy, sortOrder });
        return NextResponse.json(result, okaResponseStatus);
    } catch (error) {
        console.error("Error listing tickets:", error);
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ error: "Failed to list tickets" }, { status: 500 });
    }
}
