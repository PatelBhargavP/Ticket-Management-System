import { setKanbanColumnOrder } from "@/app/actions/setKanbanColumnOrder";
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
        const { projectId, groupType, columns, projectIdentifier } = data;

        if (!projectId) {
            return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
        }

        if (!groupType) {
            return NextResponse.json({ error: 'Group type is required' }, { status: 400 });
        }

        if (!columns || !Array.isArray(columns)) {
            return NextResponse.json({ error: 'Columns array is required' }, { status: 400 });
        }

        const result = await setKanbanColumnOrder(projectId, groupType, columns, projectIdentifier);
        return NextResponse.json(result, okaResponseStatus);
    } catch (error) {
        console.error('Error setting kanban column order:', error);
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ error: 'Failed to set kanban column order' }, { status: 500 });
    }
}
