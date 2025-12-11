"use server"

import dbConnect from "@/lib/db";
import { castUserDocumentToDetails } from "@/lib/utils";
import { AppUser, IAppUser, IAppUserDocument } from "@/models/User";
import { QueryFilter } from "mongoose";

export async function getUserDetails(filter: QueryFilter<IAppUser>) {
  try {

    await dbConnect();
    const user = await AppUser.findOne(filter).lean<IAppUserDocument>();

    if (!user) {
      return null;
    }
    return castUserDocumentToDetails(user);
  } catch (error) {
    console.error('Error getting user:', error);
    throw Error('Failed to process get user request');
  }
}