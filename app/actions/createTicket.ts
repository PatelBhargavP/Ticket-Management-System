"use server";

import dbConnect from "@/lib/db";
import { appUserAttributes, castTicketDocumentToDetails, priorityAttributes, projectBaseAttributes, statusAttributes } from "@/lib/utils";
import { Priority, Status } from "@/models";
import { ITicketDocument, Ticket } from "@/models/Ticket";
import { revalidatePath } from "next/cache";


export async function createTicket(projectId: string, ticket: Partial<ITicketDocument>) {
    try {
        await dbConnect();

        if (!ticket.name) {
            throw Error('Cannot create ticket without name');
        }
        if (!ticket.statusId) {
            ticket.statusId = (await Status.findOne({ isDefault: true }))?.id;
        }
        if (!ticket.priorityId) {
            ticket.priorityId = (await Priority.findOne({ isDefault: true }))?.id;
        }

        console.log({ ...ticket, projectId })
        const newTicket = await Ticket.create({ ...ticket, projectId });
        const newTicketPopulated = await Ticket.findOne({ ticketId: newTicket.ticketId })
                    .populate('assigneeIds', appUserAttributes)
                    .populate('projectId', projectBaseAttributes)
                    .populate('statusId', statusAttributes)
                    .populate('priorityId', priorityAttributes).lean<ITicketDocument>();
        if(!newTicketPopulated) {
            throw Error("Something went wron fetching newely created ticket")
        }
        const details = castTicketDocumentToDetails(newTicketPopulated);
        revalidatePath(`/projects/${details.project.identifier}/list`);
        revalidatePath(`/projects/${details.project.identifier}/board`);
        return details;
    } catch (error) {
        console.error('Error creating ticket:', error);
        throw Error('Failed to process create ticket request');
    }
}