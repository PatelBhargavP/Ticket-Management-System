"use server";

import { authOptions } from "@/auth";
import dbConnect from "@/lib/db";
import { castTicketDocumentToDetails, appUserAttributes, projectBaseAttributes, statusAttributes, priorityAttributes, diffObjects, differenceForTicket } from "../../lib/utils";
import { ITicketDocument, Ticket } from "@/models/Ticket";
import { ITransaction, Transaction } from "@/models/Transaction";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { object } from "zod";


export async function updateTicket(ticketId: string, projectId: string, payload: Partial<ITicketDocument>) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        const currrentVal = await Ticket.findOne({ ticketId })
            .populate('assigneeIds', appUserAttributes)
            .populate('projectId', projectBaseAttributes)
            .populate('statusId', statusAttributes)
            .populate('priorityId', priorityAttributes)
            .lean<ITicketDocument>();

        if (!currrentVal) {
            throw Error(`Ticket with id: "${ticketId}" does not exists`);
        }

        await Ticket.updateOne({ ticketId, projectId }, { $set: { ...payload, updatedById: session?.userId, createdById: session?.userId } });
        const updatedDocument = await Ticket.findOne({ ticketId })
            .populate('assigneeIds', appUserAttributes)
            .populate('projectId', projectBaseAttributes)
            .populate('statusId', statusAttributes)
            .populate('priorityId', priorityAttributes)
            .populate('updatedById', appUserAttributes)
            .populate('createdById', appUserAttributes)
            .lean<ITicketDocument>();

        const details = castTicketDocumentToDetails(updatedDocument as ITicketDocument);

        const transaction: ITransaction = {
            transactionId: '',
            transactionType: 'update',
            entityType: 'Ticket',
            userId: session?.userId || "",
            entityId: details.ticketId,
            fields: {}
        }
        const diff = differenceForTicket(currrentVal, updatedDocument as ITicketDocument);
        console.log('from server FN', diff)
        if (Object.keys(diff).length > 0) {
            transaction.fields = diff;
            const transactionDoc = await Transaction.create(transaction);
        }

        revalidatePath(`/projects/${details.project.identifier}/list`);
        revalidatePath(`/projects/${details.project.identifier}/board`);
        return details;
    } catch (error) {
        console.error('Error updating ticket:', error);
        throw Error('Failed to process update ticket request');
    }
}