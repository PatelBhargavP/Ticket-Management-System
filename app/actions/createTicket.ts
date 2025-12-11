"use server";

import { authOptions } from "@/auth";
import dbConnect from "@/lib/db";
import { appUserAttributes, castTicketDocumentToDetails, priorityAttributes, projectBaseAttributes, statusAttributes } from "@/lib/utils";
import { Priority, Status } from "@/models";
import { ITicketDocument, Ticket } from "@/models/Ticket";
import { ITransaction, Transaction, ITransactionField, ITransactionValues } from "@/models/Transaction";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";


export async function createTicket(projectId: string, ticket: Partial<ITicketDocument>) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session?.userId) {
            throw new Error('User must be authenticated to create tickets');
        }

        if (!ticket.name) {
            throw new Error('Cannot create ticket without name');
        }
        if (!ticket.statusId) {
            const defaultStatus = await Status.findOne({ isDefault: true }).lean();
            ticket.statusId = defaultStatus?.id;
        }
        if (!ticket.priorityId) {
            const defaultPriority = await Priority.findOne({ isDefault: true }).lean();
            ticket.priorityId = defaultPriority?.id;
        }

        const newTicket = await Ticket.create({ ...ticket, projectId, updatedById: session.userId, createdById: session.userId });
        const newTicketPopulated = await Ticket.findOne({ ticketId: newTicket.ticketId })
            .populate('assigneeIds', appUserAttributes)
            .populate('projectId', projectBaseAttributes)
            .populate('statusId', statusAttributes)
            .populate('updatedById', appUserAttributes)
            .populate('createdById', appUserAttributes)
            .populate('priorityId', priorityAttributes)
            .lean<ITicketDocument>();
        
        if (!newTicketPopulated) {
            throw new Error("Something went wrong fetching newly created ticket");
        }
        
        const details = castTicketDocumentToDetails(newTicketPopulated);

        // Create transaction record for audit trail
        const transaction: ITransaction = {
            transactionId: '',
            transactionType: 'create',
            entityType: 'Ticket',
            userId: session.userId,
            entityId: details.ticketId,
            fields: {} as ITransactionField<Partial<ITransactionValues>>
        }
        await Transaction.create(transaction);

        // Revalidate paths only if project identifier is available
        if (details.project?.identifier) {
            revalidatePath(`/projects/${details.project.identifier}/list`);
            revalidatePath(`/projects/${details.project.identifier}/board`);
        }

        return details;
    } catch (error) {
        console.error('Error creating ticket:', error);
        if (error instanceof Error) {
            throw new Error(`Failed to process create ticket request: ${error.message}`);
        }
        throw new Error('Failed to process create ticket request');
    }
}