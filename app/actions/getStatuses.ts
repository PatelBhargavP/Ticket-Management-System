"use server";

import dbConnect from "@/lib/db";
import { castStatusDocumentToDetails } from "@/lib/utils";
import { Status } from "@/models";
import { IStatusDocument } from "@/models/Status";

export async function getStatuses() {
  try {
    await dbConnect();
    const statuses = await (await Status.find().lean<IStatusDocument[]>());
    return statuses.map(status => castStatusDocumentToDetails(status));
  } catch (error) {
    console.error('Error fetching status list:', error);
    throw Error('Failed to process fetch status list request');
  }
}
