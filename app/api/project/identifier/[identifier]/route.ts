import { getProjectDetails } from '@/app/actions/getprojectDetails';
import tokenParser from '@/lib/token-parser';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ identifier: string }> }
) {
    // Authenticate — was previously unauthenticated (security gap G3)
    const token = await tokenParser(req);
    if (token.errorRes) {
        return token.errorRes;
    }

    const paramsVal = await params;
    const identifier = paramsVal.identifier;

    if (!identifier) {
        return NextResponse.json({ message: 'Project identifier is required' }, { status: 400 });
    }

    try {
        const projectRes = await getProjectDetails({ identifier: identifier });
        return NextResponse.json(projectRes, { status: 200 });
    } catch (error) {
        console.error('Error fetching project by identifier:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
