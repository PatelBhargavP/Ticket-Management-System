"use server";

import { Project } from "@/models";
import { IProjectDetails, IProjectDocument } from "@/models/Project";
import { QueryFilter } from "mongoose";
import dbConnect from "@/lib/db";
import { appUserAttributes, castProjectDocumentToDetails } from "@/lib/utils";
import { IAppUser } from "@/models/User";

export async function getUserProjects(userId: string) {
    try {
        await dbConnect();
        const filters = {} as QueryFilter<IProjectDocument>;
        if (userId) {
            filters.memberIds = { $in: [userId] }
        }

        const projects = await Project.find(filters)
            .populate('memberIds', appUserAttributes)
            .populate('updatedById', appUserAttributes)
            .populate('createdById', appUserAttributes)
            .lean<IProjectDocument[]>();
        return projects.map(project => castProjectDocumentToDetails(project));
    }
    catch (error) {
        console.error('Error fetching user project list:', error);
        throw Error('Failed to process fetch project list request');
    }
}