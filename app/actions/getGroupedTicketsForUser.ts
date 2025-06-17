"use server";

import { authOptions } from "@/auth";
import { GroupedData, GroupingType, Ticket } from "@/models";
import { getServerSession } from "next-auth";
import { appUserAttributes, castTicketDocumentToDetails, priorityAttributes, projectBaseAttributes, statusAttributes } from '@/lib/utils'
import { ITicketDetails, ITicketDocument } from "@/models/Ticket";
import { IStatus } from "@/models/Status";
import { IPriority } from "@/models/Priority";

export async function getTicketsGrouped(groupBy: GroupingType | null, projectId: string) {
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

    return tickets.reduce((acc: { [key: string]: GroupedData<ITicketDetails, IStatus | IPriority> }, ticket) => {
        let key = 'none';
        let value = {} as IStatus | IPriority;
        if (groupBy === 'status') {
            key = ticket.status.statusId;
            value = ticket.status;
        }
        if (groupBy === 'priority') {
            key = ticket.priority.priorityId;
            value = ticket.priority;
        }

        if (!acc[key]) {
            acc[key] = {
                data: [ticket],
                groupId: key,
                groupEntity: value,
                groupType: groupBy ? groupBy : 'none'
            };
        } else {
            acc[key].data.push(ticket);
        }
        return acc;
    }, {});
}