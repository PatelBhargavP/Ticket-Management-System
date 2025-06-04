import AddProjectButton from '@/components/add-project-button'
import ProjectListWrapper from '@/components/project-list-wrapper'
import React, { Suspense } from 'react'

export default function Projects() {
  const FallbackTemplate = (
    <>
      <div className='flex justify-end'><AddProjectButton /></div>
      <p className="text-center"> Loading projects...! </p>
    </>
  )
  return (
      <>
        <div className="px-2">
          <Suspense fallback={FallbackTemplate}>
            <ProjectListWrapper />
          </Suspense>
        </div>
      </>
  )
}
