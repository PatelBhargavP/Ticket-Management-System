'use server'

import dbConnect from "@/lib/db";
import { IProjectDocument, Project } from "@/models/Project";
import { revalidatePath, revalidateTag } from "next/cache";
import { castProjectDocumentToDetails, appUserAttributes } from "@/lib/utils";

export async function updateProject(projectId: string, data: Partial<IProjectDocument>) {
    try {
        await dbConnect();
        let project: IProjectDocument | null;
        if (!projectId) {
            throw Error('Cannot find project without id');
        }
        project = await Project.findById(projectId);
        if (!project) {
            throw Error('Could not find project with ID ' + projectId);
        } else {
            const payload: Partial<IProjectDocument> = {};
            if (data.name) {
                payload.name = data.name
            }
            if (data.memberIds) {
                payload.memberIds = data.memberIds
            }
            await Project.updateOne({ _id: projectId }, { $set: payload });
            const p = await Project.findOne({ _id: projectId }).populate('memberIds', appUserAttributes).lean<IProjectDocument>();
            if(!p) {
                return castProjectDocumentToDetails(project);
            }
            const updatedProject = castProjectDocumentToDetails(p);
            revalidateTag(`projectIdentifier:${updatedProject.identifier}`);
            revalidatePath('/projects');
            return updatedProject;
        }
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to update project: ${error.message}`)
        } else {
            throw new Error('Unknown error occurred during project update')
        }
    }
}