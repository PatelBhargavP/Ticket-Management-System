'use server'

import dbConnect from "@/lib/db";
import { projectMembersAttribute } from "@/lib/utils";
import { Project } from "@/models";
import { IProjectDetails, IProjectDocument, IProjectMember } from "@/models/Project";
import { FilterQuery } from "mongoose";

export async function getProjectDetails(filter: FilterQuery<IProjectDocument>) {
    try {
        await dbConnect();
        const project = await Project.findOne(filter)
            .populate('memberIds', projectMembersAttribute).lean();

        if (!project) {
            throw Error('Project not found');
        }
        const projectDetails: IProjectDetails = {
            projectId: project.id,
            name: project.name,
            createdAt: project.createdAt,
            updatedAt: project.updatedAt,
            identifier: project.identifier,
            members: project.memberIds as unknown as IProjectMember[]
        }
        return projectDetails;

    } catch (error) {
        console.error('Error fetching user:', error);
        throw Error('Failed to process get request');
    }
}