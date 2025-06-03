import dbConnect from '@/lib/db';
import { Project } from '@//models';
import { IProjectDetails, IProjectMember } from '@/models/Project';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ identifier: string }> }
) {
    const res = NextResponse<IProjectDetails | { message: string }>;
    console.log('identifier API: ', req.body)
    const paramsVal = await params;


    const identifier = paramsVal.identifier;
    console.log('identifier API 2: ', paramsVal)

    if (!identifier) {
        return res.json({ message: 'Project identifier is required' }, { status: 400 });
    }


    try {
        // console.log("Props of array: ", Object.keys({} as IProjectMember) as (keyof IProjectMember)[]);
        await dbConnect();
        const project = await Project.findOne({ identifier: identifier })
            .populate('memberIds', ["id", "fullname", "firstname", "lastname"]).lean();

        if (!project) {
            return res.json({ message: 'Project not found' }, { status: 400 });
        }
        const projectRes: IProjectDetails = {
            projectId: project.id,
            name: project.name,
            createdAt: project.createdAt,
            updatedAt: project.updatedAt,
            members: project.memberIds as unknown as IProjectMember[]
        }
        console.log(project, projectRes)
        return res.json(projectRes, { status: 200 });

    } catch (error) {
        console.error('Error fetching user:', error);
        return res.json({ message: 'Internal server error' }, { status: 500 });
    }
}

