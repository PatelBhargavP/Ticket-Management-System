'use server'

import dbConnect from "@/lib/db";
import { castUserDocumentToDetails } from "@/lib/utils";
import { AppUser, IAppUser, IAppUserDocument } from "@/models/User";
import { FilterQuery } from "mongoose";

export async function upsertUser(params: Partial<IAppUser>) {
  try {
    await dbConnect();
    if (!params.email && !params.userId) {
      return null
    }
    const filter: FilterQuery<IAppUser> = {};
    if (params.userId) {
      filter.userId = params.userId;
    }
    if (params.email) {
      filter.email = params.email;
    }
    const existingUser = await AppUser.findOne(filter);

    if (!existingUser) {
      throw Error('Cannot find user');
    } else {
      await AppUser.findOneAndUpdate(filter, params, {
        new: true
      });
    }
    return castUserDocumentToDetails(await AppUser.findOne(filter).lean() as IAppUserDocument);
  } catch (error) {
    console.error('Error upserting user:', error);
    throw Error('Failed to process upsert users request');
  }
}