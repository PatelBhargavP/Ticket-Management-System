"use server";

import dbConnect from "@/lib/db";
import { castUserDocumentToDetails } from "@/lib/utils";
import { AppUser } from "@/models";
import { IAppUserDocument } from "@/models/User";

export async function getAppUsers() {
  try {
    await dbConnect();
    const users = await AppUser.find().lean();
    return users.map(user => castUserDocumentToDetails(user as IAppUserDocument));
  } catch (error) {
    console.error('Error fetching users list:', error);
    throw Error('Failed to process fetch users list request');
  }
}