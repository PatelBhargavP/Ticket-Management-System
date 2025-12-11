"use server";

import { authOptions } from "@/auth";
import { GroupingType } from "@/models";
import { getServerSession } from "next-auth";
import { getKanbanColumnOrderKey } from '@/lib/utils'
import { IKanbanColumnOrder, KanbanColumnOrder } from "@/models/KanbanColumnOrder";
import { revalidatePath } from "next/cache";

export async function setKanbanColumnOrder(projectId: string, groupType: GroupingType, colums: string[], projectIdentifier?: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.userId) {
            throw new Error('Cannot perform operation since user is not logged in');
        }

        const key = getKanbanColumnOrderKey(projectId, groupType, session.userId);
        const doc = await KanbanColumnOrder.findOneAndUpdate(
            { identifier: key },
            { entityOrder: colums },
            {
                new: true,
                upsert: true // Make this update into an upsert
            }
        ).lean<IKanbanColumnOrder>();

        if (!doc) {
            throw new Error('Failed to update kanban column order');
        }

        // Revalidate path only if projectIdentifier is provided
        if (projectIdentifier) {
            revalidatePath(`/projects/${projectIdentifier}/board`);
        }

        return doc;
    } catch (error) {
        console.error('Error setting kanban column order:', error);
        if (error instanceof Error) {
            throw new Error(`Failed to set kanban column order: ${error.message}`);
        }
        throw new Error('Failed to set kanban column order');
    }
}