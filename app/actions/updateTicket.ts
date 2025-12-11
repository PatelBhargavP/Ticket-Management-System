"use server";

import { authOptions } from "@/auth";
import dbConnect from "@/lib/db";
import { castTicketDocumentToDetails, appUserAttributes, projectBaseAttributes, statusAttributes, priorityAttributes, differenceForTicket } from "../../lib/utils";
import { ITicketDocument, Ticket } from "@/models/Ticket";
import { ITransaction, Transaction } from "@/models/Transaction";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";


export async function updateTicket(ticketId: string, projectId: string, payload: Partial<ITicketDocument>) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session?.userId) {
            throw new Error('User must be authenticated to update tickets');
        }

        const currrentVal = await Ticket.findOne({ ticketId })
            .populate('assigneeIds', appUserAttributes)
            .populate('projectId', projectBaseAttributes)
            .populate('statusId', statusAttributes)
            .populate('priorityId', priorityAttributes)
            .lean<ITicketDocument>();

        if (!currrentVal) {
            throw new Error(`Ticket with id: "${ticketId}" does not exist`);
        }

        await Ticket.updateOne({ ticketId, projectId }, { $set: { ...payload, updatedById: session.userId } });
        const updatedDocument = await Ticket.findOne({ ticketId })
            .populate('assigneeIds', appUserAttributes)
            .populate('projectId', projectBaseAttributes)
            .populate('statusId', statusAttributes)
            .populate('priorityId', priorityAttributes)
            .populate('updatedById', appUserAttributes)
            .populate('createdById', appUserAttributes)
            .lean<ITicketDocument>();

        if (!updatedDocument) {
            throw new Error(`Failed to fetch updated ticket with id: "${ticketId}"`);
        }

        const details = castTicketDocumentToDetails(updatedDocument);

        // Create transaction record for audit trail
        const transaction: ITransaction = {
            transactionId: '',
            transactionType: 'update',
            entityType: 'Ticket',
            userId: session.userId,
            entityId: details.ticketId,
            fields: {}
        }
        const diff = differenceForTicket(currrentVal, updatedDocument);
        if (Object.keys(diff).length > 0) {
            transaction.fields = diff;
            await Transaction.create(transaction);
        }

        // Revalidate paths only if project identifier is available
        if (details.project?.identifier) {
            revalidatePath(`/projects/${details.project.identifier}/list`);
            revalidatePath(`/projects/${details.project.identifier}/board`);
        }

        return details;
    } catch (error) {
        console.error('Error updating ticket:', error);
        if (error instanceof Error) {
            throw new Error(`Failed to process update ticket request: ${error.message}`);
        }
        throw new Error('Failed to process update ticket request');
    }
}