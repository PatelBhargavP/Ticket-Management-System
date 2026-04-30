'use server'

import { authOptions } from "@/auth";
import dbConnect from "@/lib/db";
import { castProjectDocumentToDetails, appUserAttributes } from "@/lib/utils";
import { IProjectDocument, Project } from "@/models/Project";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

/**
 * Create a new project.
 *
 * @param data        - Project fields (name is required).
 * @param callerUserId - Optional userId pre-extracted from an API-key Bearer
 *                       token by the calling route handler.  When provided it
 *                       takes precedence over the NextAuth session so that MCP
 *                       / programmatic callers (which have no session cookie)
 *                       can still create projects.
 */
export async function createProject(
    data: Partial<IProjectDocument>,
    callerUserId?: string,
) {
    try {
        await dbConnect();

        // Resolve userId: prefer an explicitly-supplied value (API-key auth),
        // then fall back to the NextAuth session (browser auth).
        let effectiveUserId = callerUserId;
        if (!effectiveUserId) {
            const session = await getServerSession(authOptions);
            effectiveUserId = session?.userId;
        }

        if (!effectiveUserId) {
            throw new Error('User must be authenticated to create projects');
        }

        if (!data.name) {
            throw new Error('Cannot create project without name');
        }

        data['memberIds'] = [effectiveUserId];

        const project = await Project.create({ ...data, updatedById: effectiveUserId, createdById: effectiveUserId });
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
