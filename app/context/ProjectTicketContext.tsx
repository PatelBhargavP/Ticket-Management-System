'use client'

import { IProjectDetails } from '@/models/Project';
import { ITicketDetails } from '@/models/Ticket'
import { IAppUser } from '@/models/User';
import React, { createContext, useContext, useState } from 'react'

export interface ProjectTicketContextType {
    ticket: ITicketDetails | null;
    setTicket: (selectedTicket: ITicketDetails | null) => void;
    project: IProjectDetails;
    setProject: (project: IProjectDetails) => void;
    projectUsers: IAppUser[];
    setProjectUsers: (users: IAppUser[]) => void;
}

const ProjectTicketContext = createContext<ProjectTicketContextType | undefined>(undefined);

export const ProjectTicketProvider = (
    {
        children,
        initialTicket,
        initialProject,
        initialProjectUsers
    }: {
        children: React.ReactNode;
        initialTicket?: ITicketDetails | null;
        initialProject: IProjectDetails;
        initialProjectUsers: IAppUser[]
    }
) => {
    const [ticket, setTicket] = useState(initialTicket || null);
    const [project, setProject] = useState(initialProject);
    const [projectUsers, setProjectUsers] = useState(initialProjectUsers);

    return (
        <ProjectTicketContext.Provider
            value={{
                ticket,
                setTicket,
                project,
                setProject,
                projectUsers,
                setProjectUsers
            }}
        >
            {children}
        </ProjectTicketContext.Provider>
    )
}

export const useProjectTicket = () => {
    const context = useContext(ProjectTicketContext)
    if (!context) throw new Error('useProject must be used within a ProjectTicketProvider')
    return context
}
