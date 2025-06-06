import { ProjectTicketProvider } from "@/app/context/ProjectTicketContext";
import { projectByIdentifierCache } from "@/lib/project-by-identifier";
import { ReactNode } from "react";

export default async function ProjectLayout({
  children,
  params
}: {
  children: ReactNode;
  params: Promise<{ identifier: string }>;
}) {

  const { identifier } = await params
  
  const project = await projectByIdentifierCache(identifier)();

  return (
    <>
    <ProjectTicketProvider
      initialTicket={null}
      initialProject={project}
      initialProjectUsers={project.members}
    >
      {children}
    </ProjectTicketProvider>
    </>
  );
}