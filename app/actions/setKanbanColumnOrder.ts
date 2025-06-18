"use server";

import { authOptions } from "@/auth";
import { GroupingType } from "@/models";
import { getServerSession } from "next-auth";
import { getKanbanColumnOrderKey } from '@/lib/utils'
import { IKanbanColumnOrder, KanbanColumnOrder } from "@/models/KanbanColumnOrder";
import { revalidatePath } from "next/cache";

export async function setKanbanColumnOrder(projectId: string, groupType: GroupingType, colums: string[], projectIdentifier?: string) {
    const session = await getServerSession(authOptions);
    if (!session) {
        throw 'Cannot perform get operation since user is not logged in';
    }
    const key = getKanbanColumnOrderKey(projectId, groupType, session.userId);
    const doc = await KanbanColumnOrder.findOneAndUpdate({ identifier: key }, { entityOrder: colums }, {
        new: true,
        upsert: true // Make this update into an upsert
    }).lean<IKanbanColumnOrder>();
        revalidatePath(`/projects/${projectIdentifier}/board`);

    return doc;
}