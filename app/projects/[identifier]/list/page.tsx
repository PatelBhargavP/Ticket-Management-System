import { getPaginatedProjectTickets } from "@/app/actions/getPaginatedProjectTickets";
import ProjectTicketLayout from "@/components/project-ticket-layout";
import TicketList from "@/components/ticket-list";
import { projectByIdentifierCache } from "@/lib/project-by-identifier";
import { Suspense } from "react";

export default async function TicketListPage({params}: {params: Promise<{ identifier: string }>}) {
  const FallbackTemplate = (
    <>
      <p className="text-center"> Loading projects tickets...! </p>
    </>
  )
  const projectIdentifier = (await params).identifier;
  const projectDetails = await projectByIdentifierCache(projectIdentifier)();
  const projectTicketist = getPaginatedProjectTickets(projectDetails.projectId, {});

  return (
    <>
      <Suspense fallback={FallbackTemplate}>
        <ProjectTicketLayout ticketData={projectTicketist} contentType="list"></ProjectTicketLayout>
      </Suspense>
    </>
  );
}

export async function generateMetadata({ params }: {params: Promise<{ identifier: string }>}) {
  const projectIdentifier = (await params).identifier;
  const projectDetails = await projectByIdentifierCache(projectIdentifier)();

  return {
    title: `List - ${projectDetails.name}`,
    description: `This page lists the tickets of Project: ${projectDetails.name}. Tickets assigned to all users is listed here.`,
  };
}