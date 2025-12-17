'use server'

import dbConnect from "@/lib/db";
import { appUserAttributes, castTransactionDocumentToDetails } from "@/lib/utils";
import { ITransactionDocument, Transaction } from "@/models/Transaction";
// Import models to ensure they're registered before populate operations
import { Ticket, Project } from "@/models";

export async function getTransactions(entityId: string) {
    try {
        await dbConnect();
        const transactions = await Transaction.find({ entityId: entityId })
            .populate({
                path: 'entityId',
                transform: (doc, id) => {
                    if (doc) {
                        return {
                            name: doc.name,
                            id
                        };
                    } else {
                        return null; // Exclude if no document is found
                    }
                },
            })
            .populate('userId', appUserAttributes)
            .sort({ createdAt: -1 })
            .lean<ITransactionDocument[]>();

        const transactionDetails = transactions.map(tr => castTransactionDocumentToDetails(tr));
        return transactionDetails;

    } catch (error) {
        console.error(`Error fetching transactions for entity ${entityId}:`, error);
        throw Error('Failed to process get request');
    }
}