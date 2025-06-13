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
        if (!data.name) {
            throw Error('Cannot create project without name');
        } else {
            if (session?.userId) {
                data['memberIds'] = [session.userId];
            }
            const project = await Project.create({ ...data, updatedById: session?.userId, createdById: session?.userId });
            const p = await Project.findOne({ _id: project.id })
                .populate('memberIds', appUserAttributes)
                .populate('updatedById', appUserAttributes)
                .populate('createdById', appUserAttributes)
                .lean() as IProjectDocument;
            if (!p) {
                return project;
            }
            const createdProject = castProjectDocumentToDetails(p);
            revalidatePath('/projects');
            return createdProject
        }

    } catch (error) {
        console.error('Error processing create project request:', error);
        throw Error('Failed to process create project request');
    }
}
