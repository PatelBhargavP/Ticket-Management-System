"use server";

import { authOptions } from "@/auth";
import { GroupingType } from "@/models";
import { getServerSession } from "next-auth";
import { getKanbanColumnOrderKey } from '@/lib/utils'
import { IKanbanColumnOrder, KanbanColumnOrder } from "@/models/KanbanColumnOrder";

export async function getKanbanColumnOrder(projectId: string, groupType: GroupingType) {
    const session = await getServerSession(authOptions);
    if (!session) {
        throw 'Cannot perform get operation since user is not logged in';
    }
    const key = getKanbanColumnOrderKey(projectId, groupType, session.userId);
    const order = await (await KanbanColumnOrder.findOne({ identifier: key }).lean<IKanbanColumnOrder>());

    return order?.entityOrder || [];
}