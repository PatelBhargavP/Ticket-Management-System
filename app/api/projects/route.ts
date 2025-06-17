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
        let project: IProjectDocument | null;
        const data = await request.json();
        console.log("create/update project request", data)
        if (data.id) {
            project = await Project.findById(data.id);
            if (!project) {
                return NextResponse.json({ error: 'Could not find project' }, { status: 404 });
            } else {
                const resData = await Project.findOneAndUpdate({ projectId: project.id }, data, {
                    new: true
                })
                project = await Project.findById(project._id);
                return NextResponse.json(resData, okaResponseStatus)
            }

        } else if (!data.name) {
            return NextResponse.json({ error: 'Cannot create project without name' }, { status: 400 });
        } else {
            data['memberIds'] = [token.jwt?.userId];
            project = await Project.create(data);
            project = await Project.findById(project._id);
            return NextResponse.json(project, okaResponseStatus)
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