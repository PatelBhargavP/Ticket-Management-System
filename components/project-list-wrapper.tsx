import { authOptions } from '@/auth';
import { getServerSession } from 'next-auth';
import React from 'react'
import ProjectList from './project-list';
import { getUserProjects } from '@/app/actions/getUserProjects';
import { getAppUsers } from '@/app/actions/getAppUsers';

export default async function ProjectListWrapper() {

    const session = await getServerSession(authOptions);
    if (!session) {
        return <div>User not logged in.</div>
    }
    const projects = await getUserProjects(session?.userId);
    const users = await getAppUsers();
    return (
        <ProjectList {...{ projects, users }}></ProjectList>
    )
}
