"use server";

import { AppUser } from "@/models";
import { IAppUserDocument } from "@/models/User";
import { User } from "next-auth";
import { castUserDocumentToDetails, converUserToAppUser } from "@/lib/utils";
import dbConnect from "@/lib/db";


export async function createUser(user: User) {
    try {
        await dbConnect();
        const payload = converUserToAppUser(user);

        if (!payload.email) {
            throw Error('Cannot create user without email');
        }

        await AppUser.create(payload);
        return castUserDocumentToDetails(await AppUser.findOne({ email: payload.email }).lean() as IAppUserDocument);
    } catch (error) {
        console.error('Error creating user:', error);
        throw Error('Failed to process create users request');
    }
}