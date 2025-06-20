import { getKanbanColumnOrder } from "@/app/actions/getKanbanColumnOrder";
import { getUserProjectTickets } from "@/app/actions/getUserProjectTickets";
import { authOptions } from "@/auth";
import KanbanSkeleton from "@/components/kanban-skeleton";
import ProjectTicketLayout from "@/components/project-ticket-layout";
import { projectByIdentifierCache } from "@/lib/project-by-identifier";
import { getServerSession } from "next-auth";
import { Suspense } from "react";

export default async function TicketBoardPage({params}: {params: Promise<{ identifier: string }>}) {
  const FallbackTemplate = (
    <>
      <p className="text-center"> Loading projects tickets...! </p>
    </>
  )
  const projectIdentifier = (await params).identifier;
  const projectDetails = await projectByIdentifierCache(projectIdentifier)();
  const projectTicketist = getUserProjectTickets(projectDetails.projectId);
  const getProjectKanbanColumnOrder = getKanbanColumnOrder(projectDetails.projectId, 'status');

  return (
    <>
      <Suspense fallback={<KanbanSkeleton />}>
        <ProjectTicketLayout ticketBoardData={projectTicketist} getProjectKanbanColumnOrder={getProjectKanbanColumnOrder} contentType="board"></ProjectTicketLayout>
      </Suspense>
    </>
  );
}


export async function generateMetadata({ params }: {params: Promise<{ identifier: string }>}) {
  const session = await getServerSession(authOptions);
  const projectIdentifier = (await params).identifier;
  const projectDetails = await projectByIdentifierCache(projectIdentifier)();

  return {
    title: `Board - ${projectDetails.name}`,
    description: `This page shows the tickets of Project: ${projectDetails.name}. Tickets assigned to ${session?.user.name} is shown here grouped by status.`,
  };
}