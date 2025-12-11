import { getUserProjects } from "@/app/actions/getUserProjects";
import dbConnect from "@/lib/db";
import tokenParser from "@/lib/token-parser";
import { okaResponseStatus } from "@/lib/utils";
import { Project, IProjectDocument} from "@/models/Project";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {

    // Parse for the user id
    const token = await tokenParser(request);
    if (token.errorRes) {
        return token.errorRes;
    }
    await dbConnect();

    try {
        const data = await request.json();
        console.log("create/update project request", data)
        if (data.id) {
            const project = await Project.findById(data.id).lean<IProjectDocument>();
            if (!project) {
                return NextResponse.json({ error: 'Could not find project' }, { status: 404 });
            } else {
                const resData = await Project.findOneAndUpdate({ projectId: project.id }, data, {
                    new: true
                }).lean<IProjectDocument>();
                return NextResponse.json(resData, okaResponseStatus)
            }

        } else if (!data.name) {
            return NextResponse.json({ error: 'Cannot create project without name' }, { status: 400 });
        } else {
            data['memberIds'] = [token.jwt?.userId];
            const createdProject = await Project.create(data);
            // Project.create returns a Document, access _id property directly
            const projectId = (createdProject as any)._id;
            const populatedProject = await Project.findById(projectId).lean<IProjectDocument>();
            if (!populatedProject) {
                return NextResponse.json({ error: 'Failed to fetch created project' }, { status: 500 });
            }
            return NextResponse.json(populatedProject, okaResponseStatus)
        }

    } catch (error) {
        console.error('Error processing request:', error);
        return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
    }
}


export async function GET(request: NextRequest) {

    // Parse for the user id
    const token = await tokenParser(request);
    if (token.errorRes) {
        return token.errorRes;
    }

    try {
        const data = (await getUserProjects(token.jwt?.userId || ''));
        return NextResponse.json(data, okaResponseStatus)

    } catch (error) {
        console.error('Error processing request:', error);
        return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
    }
}