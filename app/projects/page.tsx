import ProjectList from '@/components/project-list';
import TableSkeleton from '@/components/table-skeleton'
import React, { Suspense } from 'react'
import { getAppUsers } from '../actions/getAppUsers'
import { getUserProjects } from '../actions/getUserProjects'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'

export default async function Projects() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return <div>User not logged in.</div>
  }
  const projectsPromise = getUserProjects(session?.userId);
  const usersPromise = getAppUsers();

  return (
    <>
      <div className="px-2">
        <Suspense fallback={<TableSkeleton rows={10} />}>
          <ProjectList {...{ projectsPromise, usersPromise }}></ProjectList>
        </Suspense>
      </div>
    </>
  )
}

export async function generateMetadata() {

  return {
    title: `Projects list - Ticket Menagement System`,
    description: `This page lists all the Project`,
  };
}