"use server";

import dbConnect from "@/lib/db";
import { castPriorityDocumentToDetails } from "@/lib/utils";
import { IPriorityDocument, Priority } from "@/models/Priority";

export async function getPriorities() {
  try {
    await dbConnect();
    const priorities = await Priority.find().lean<IPriorityDocument[]>().exec();
    return priorities.map(priority => castPriorityDocumentToDetails(priority));
  } catch (error) {
    console.error('Error fetching priority list:', error);
    throw Error('Failed to process fetch priority list request');
  }
}