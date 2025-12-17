import { IProjectDetails } from '@/models/Project';
import { NextRequest, NextResponse } from 'next/server';
import { getProjectDetails } from '@/app/actions/getprojectDetails';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ identifier: string }> }
) {
    const paramsVal = await params;
    const identifier = paramsVal.identifier;

    if (!identifier) {
        return NextResponse.json({ message: 'Project identifier is required' }, { status: 400 });
    }


    try {

        const projectRes = await getProjectDetails({ identifier: identifier });
        return NextResponse.json(projectRes, { status: 200 });

    } catch (error) {
        console.error('Error fetching user:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

