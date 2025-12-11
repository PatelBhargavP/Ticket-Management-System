'use server'

import dbConnect from "@/lib/db";
import { IProjectDocument, Project } from "@/models/Project";
import { revalidatePath, revalidateTag } from "next/cache";
import { castProjectDocumentToDetails, appUserAttributes } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

export async function updateProject(projectId: string, data: Partial<IProjectDocument>) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session?.userId) {
            throw new Error('User must be authenticated to update projects');
        }

        if (!projectId) {
            throw new Error('Cannot find project without id');
        }

        const project = await Project.findById(projectId);
        if (!project) {
            throw new Error('Could not find project with ID ' + projectId);
        }

        const payload: Partial<IProjectDocument> = {};
        if (data.name) {
            payload.name = data.name;
        }
        if (data.memberIds) {
            payload.memberIds = data.memberIds;
        }

        await Project.updateOne({ id: projectId }, { $set: { ...payload, updatedById: session.userId } });
        
        const updatedProjectDoc = await Project.findOne({ id: projectId })
            .populate('memberIds', appUserAttributes)
            .populate('updatedById', appUserAttributes)
            .populate('createdById', appUserAttributes)
            .lean<IProjectDocument>();

        if (!updatedProjectDoc) {
            throw new Error('Failed to fetch updated project');
        }

        const updatedProject = castProjectDocumentToDetails(updatedProjectDoc);

        // Revalidate paths only if identifier is available
        if (updatedProject.identifier) {
            revalidateTag(`projectIdentifier:${updatedProject.identifier}`, 'max');
        }
        revalidatePath('/projects');

        return updatedProject;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to update project: ${error.message}`);
        }
        throw new Error('Unknown error occurred during project update');
    }
}