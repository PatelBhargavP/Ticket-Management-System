"use server";

import dbConnect from "@/lib/db";
import { castTicketDocumentToDetails, appUserAttributes, projectBaseAttributes, statusAttributes, priorityAttributes } from "@/lib/utils";
import { ITicketDocument, Ticket } from "@/models/Ticket";
import { revalidatePath } from "next/cache";


export async function updateTicket(ticketId: string, projectId: string, payload: Partial<ITicketDocument>) {
    try {
        await dbConnect();

        const currrentVal = await Ticket.findOne({ ticketId }).lean();

        if (!currrentVal) {
            throw Error(`Ticket with id: "${ticketId}" does not exists`);
        }

        await Ticket.updateOne({ ticketId, projectId }, { $set: payload });
        const updatedDocument = await Ticket.findOne({ ticketId })
            .populate('assigneeIds', appUserAttributes)
            .populate('projectId', projectBaseAttributes)
            .populate('statusId', statusAttributes)
            .populate('priorityId', priorityAttributes)
            .lean<ITicketDocument>();

        const details = castTicketDocumentToDetails(updatedDocument as ITicketDocument);
        revalidatePath(`/projects/${details.project.identifier}/list`);
        return details;
    } catch (error) {
        console.error('Error updating ticket:', error);
        throw Error('Failed to process update ticket request');
    }
}