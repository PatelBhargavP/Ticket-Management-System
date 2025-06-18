"use server";

import { authOptions } from "@/auth";
import { Ticket } from "@/models";
import { getServerSession } from "next-auth";
import { appUserAttributes, castTicketDocumentToDetails, priorityAttributes, projectBaseAttributes, statusAttributes } from '@/lib/utils'
import { ITicketDocument } from "@/models/Ticket";

export async function getUserProjectTickets(projectId: string) {
    const session = await getServerSession(authOptions);
    const tickets = (await Ticket.find({
        assigneeIds: { $in: [session?.userId || ''] },
        projectId
    })
        .populate('assigneeIds', appUserAttributes)
        .populate('projectId', projectBaseAttributes)
        .populate('statusId', statusAttributes)
        .populate('priorityId', priorityAttributes)
        .populate('updatedById', appUserAttributes)
        .populate('createdById', appUserAttributes)
        .lean<ITicketDocument[]>()).map(ticket => castTicketDocumentToDetails(ticket))

    // if (!groupBy) return tickets;

    return tickets;
}