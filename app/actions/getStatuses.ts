"use server";

import dbConnect from "@/lib/db";
import { castStatusDocumentToDetails } from "@/lib/utils";
import { AppUser, Status } from "@/models";
import { IStatusDocument } from "@/models/Status";
import { IAppUserDocument } from "@/models/User";

export async function getStatuses() {
  try {
    await dbConnect();
    const statuses = await Status.find().lean<IStatusDocument[]>().exec();
    return statuses.map(status => castStatusDocumentToDetails(status));
  } catch (error) {
    console.error('Error fetching status list:', error);
    throw Error('Failed to process fetch status list request');
  }
}