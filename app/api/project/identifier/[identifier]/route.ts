import { IProjectDetails } from '@/models/Project';
import { NextRequest, NextResponse } from 'next/server';
import { getProjectDetails } from '@/app/actions/getprojectDetails';

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

        const projectRes = await getProjectDetails({ identifier: identifier });
        return res.json(projectRes, { status: 200 });

    } catch (error) {
        console.error('Error fetching user:', error);
        return res.json({ message: 'Internal server error' }, { status: 500 });
    }
}

