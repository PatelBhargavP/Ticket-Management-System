"use server";

import { authOptions } from "@/auth";
import dbConnect from "@/lib/db";
import { appUserAttributes, castTicketDocumentToDetails, priorityAttributes, projectBaseAttributes, statusAttributes } from "@/lib/utils";
import { Priority, Status } from "@/models";
import { ITicketDocument, Ticket } from "@/models/Ticket";
import { ITransaction, ITransactionBase, Transaction } from "@/models/Transaction";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";


export async function createTicket(projectId: string, ticket: Partial<ITicketDocument>) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!ticket.name) {
            throw Error('Cannot create ticket without name');
        }
        if (!ticket.statusId) {
            ticket.statusId = (await Status.findOne({ isDefault: true }))?.id;
        }
        if (!ticket.priorityId) {
            ticket.priorityId = (await Priority.findOne({ isDefault: true }))?.id;
        }

        const newTicket = await Ticket.create({ ...ticket, projectId, updatedById: session?.userId, createdById: session?.userId });
        const newTicketPopulated = await Ticket.findOne({ ticketId: newTicket.ticketId })
            .populate('assigneeIds', appUserAttributes)
            .populate('projectId', projectBaseAttributes)
            .populate('statusId', statusAttributes)
            .populate('updatedById', appUserAttributes)
            .populate('createdById', appUserAttributes)
            .populate('priorityId', priorityAttributes).lean<ITicketDocument>();
        if (!newTicketPopulated) {
            throw Error("Something went wrong fetching newely created ticket")
        }
        const details = castTicketDocumentToDetails(newTicketPopulated);

        const transaction: ITransaction = {
            transactionId: '',
            transactionType: 'create',
            entityType: 'Ticket',
            userId: session?.userId || "",
            entityId: details.ticketId,
            fields: []
        }
        const transactionDoc = await Transaction.create(transaction);
        revalidatePath(`/projects/${details.project.identifier}/list`);
        revalidatePath(`/projects/${details.project.identifier}/board`);
        return details;
    } catch (error) {
        console.error('Error creating ticket:', error);
        throw Error('Failed to process create ticket request');
    }
}