import { setKanbanColumnOrder } from "@/app/actions/setKanbanColumnOrder";
import tokenParser from "@/lib/token-parser";
import { getKanbanColumnOrderKey, okaResponseStatus } from "@/lib/utils";
import { GroupingType } from "@/models";
import { IKanbanColumnOrder, KanbanColumnOrder } from "@/models/KanbanColumnOrder";
import dbConnect from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    // Parse for the user id
    const token = await tokenParser(request);
    if (token.errorRes) {
        return token.errorRes;
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const groupType = searchParams.get("groupType") as GroupingType | null;

    if (!projectId) {
        return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }
    if (!groupType || !["status", "priority"].includes(groupType)) {
        return NextResponse.json({ error: "groupType must be 'status' or 'priority'" }, { status: 400 });
    }

    try {
        const userId = token.jwt?.userId;
        if (!userId) {
            return NextResponse.json({ error: "User ID could not be resolved" }, { status: 401 });
        }

        await dbConnect();
        const key = getKanbanColumnOrderKey(projectId, groupType, userId);
        const order = await KanbanColumnOrder.findOne({ identifier: key }).lean<IKanbanColumnOrder>();

        return NextResponse.json(
            {
                projectId,
                groupType,
                columns: order?.entityOrder ?? [],
                identifier: key,
            },
            okaResponseStatus,
        );
    } catch (error) {
        console.error("Error getting kanban column order:", error);
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ error: "Failed to get kanban column order" }, { status: 500 });
    }
}

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
