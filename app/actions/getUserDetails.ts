"use server"

import dbConnect from "@/lib/db";
import { castUserDocumentToDetails } from "@/lib/utils";
import { AppUser, IAppUser } from "@/models/User";
import { FilterQuery } from "mongoose";

export async function getUserDetails(filter: FilterQuery<IAppUser>) {
  try {

    await dbConnect();
    const user = await AppUser.findOne(filter);

    if (!user) {
      return null;
    }
    const a = castUserDocumentToDetails(user)

    const userDetails: IAppUser = {
      userId: user.id,
      email: user.email,
      fullname: user.fullname,
      firstname: user.firstname,
      lastname: user.lastname,
      image: user.image,
    }
    return userDetails;
  } catch (error) {
    console.error('Error getting user:', error);
    throw Error('Failed to process get user request');
  }
}