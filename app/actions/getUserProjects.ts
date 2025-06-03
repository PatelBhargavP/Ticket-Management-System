"use server";

import { Project } from "@/models";
import { IProjectDetails, IProjectDocument, IProjectMember } from "@/models/Project";
import { FilterQuery } from "mongoose";
import dbConnect from "@/lib/db";
import { projectMembersAttribute } from "@/lib/utils";

export async function getUserProjects(userId: string) {
    try {
        await dbConnect();
        const filters = {} as FilterQuery<IProjectDocument>;
        if (userId) {
            filters.memberIds = { $in: [userId] }
        }
        const projects = await Project.find(filters).populate('memberIds', projectMembersAttribute).lean();
        return projects.map(project => ({
            projectId: project.projectId,
            name: project.name,
            identifier: project.identifier,
            createdAt: project.createdAt,
            updatedAt: project.updatedAt,
            members: project.memberIds as IProjectMember[]
        } as IProjectDetails));
    }
    catch (error) {
        console.error('Error fetching user project list:', error);
        throw Error('Failed to process fetch project list request');
    }
}