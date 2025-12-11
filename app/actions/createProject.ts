'use server'

import { authOptions } from "@/auth";
import dbConnect from "@/lib/db";
import { castProjectDocumentToDetails, appUserAttributes } from "@/lib/utils";
import { IProjectDocument, Project } from "@/models/Project";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

export async function createProject(data: Partial<IProjectDocument>) {
    try {
        const session = await getServerSession(authOptions);
        await dbConnect();

        if (!session?.userId) {
            throw new Error('User must be authenticated to create projects');
        }

        if (!data.name) {
            throw new Error('Cannot create project without name');
        }

        if (session.userId) {
            data['memberIds'] = [session.userId];
        }

        const project = await Project.create({ ...data, updatedById: session.userId, createdById: session.userId });
        const populatedProject = await Project.findOne({ _id: project._id })
            .populate('memberIds', appUserAttributes)
            .populate('updatedById', appUserAttributes)
            .populate('createdById', appUserAttributes)
            .lean<IProjectDocument>();

        if (!populatedProject) {
            throw new Error('Failed to fetch newly created project');
        }

        const createdProject = castProjectDocumentToDetails(populatedProject);
        revalidatePath('/projects');
        
        return createdProject;
    } catch (error) {
        console.error('Error processing create project request:', error);
        if (error instanceof Error) {
            throw new Error(`Failed to process create project request: ${error.message}`);
        }
        throw new Error('Failed to process create project request');
    }
}
