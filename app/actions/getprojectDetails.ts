'use server'

import dbConnect from "@/lib/db";
import { appUserAttributes, castProjectDocumentToDetails } from "@/lib/utils";
import { Project } from "@/models";
import { IProjectDocument } from "@/models/Project";
import { FilterQuery } from "mongoose";

export async function getProjectDetails(filter: FilterQuery<IProjectDocument>) {
    try {
        await dbConnect();
        const project = await Project.findOne(filter)
            .populate('memberIds', appUserAttributes).lean<IProjectDocument>();

        if (!project) {
            throw Error('Project not found');
        }
        return castProjectDocumentToDetails(project);

    } catch (error) {
        console.error('Error fetching user:', error);
        throw Error('Failed to process get request');
    }
}