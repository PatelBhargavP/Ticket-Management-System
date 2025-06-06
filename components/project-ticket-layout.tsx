"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import { Suspense, use, useState } from "react";
import { ITicketDetails } from "@/models/Ticket";
import TicketForm from "./ticket-form";
import { useProjectTicket } from "@/app/context/ProjectTicketContext";
import { useSharedApp } from "@/app/context/SharedAppContext";
import Link from "next/link";
import { prefetchStatusAndPriority } from "@/lib/prefetch-data";
import { PaginatedData } from "@/models";
import { Button } from "./ui/button";
import { IAppUser } from "@/models/User";
import TicketList from "./ticket-list";
import TableSkeleton from "./table-skeleton";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "./ui/breadcrumb";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";

export default function ProjectTicketLayout(
    { ticketData, contentType }: { ticketData: Promise<PaginatedData<ITicketDetails>>; contentType: 'list' | 'board'; }
) {
    const { ticket, setTicket, project, projectUsers } = useProjectTicket();
    prefetchStatusAndPriority();
    const { statuses, priorities } = useSharedApp();
    const [openSheet, setOpenSheet] = useState(false);
    const newTicketObj = {
        name: "",
        description: "",
        project,
        status: statuses.find(s => s.isDefault) || statuses[0],
        priority: priorities.find(s => s.isDefault) || priorities[0],
        assignee: [] as IAppUser[],
        createdAt: new Date(),
        updatedAt: new Date(),
        ticketId: ''
    } as ITicketDetails;

    const onTicketAdd = () => {
        setTicket(newTicketObj);
        setOpenSheet(true);
    }

    const onTicketEdit = (ticket: ITicketDetails) => {
        setTicket(ticket);
        setOpenSheet(true);
    }

    const openSheetHandler = (state: boolean) => {
        if (!state) {
            setTicket(null);
        }
        setOpenSheet(state);
    }

    return (
        <>
            <div className="pt-3">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link href="/projects">Projects</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            {`${project.name} : ${project.identifier}`}
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>{contentType.toUpperCase()}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>
            <div className="flex py-3 w-full justify-around items-center">
                <Tabs defaultValue={contentType}>
                    <TabsList>
                        <TabsTrigger value="list">
                            <Link href={`/projects/${project.identifier}/list`} >List</Link>
                        </TabsTrigger>
                        <TabsTrigger value="board">
                            <Link href={`/projects/${project.identifier}/board`} >Board</Link>
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>
            <div className="flex pb-3 w-full justify-end">
                <Button onClick={onTicketAdd}>Add ticket</Button>
            </div>
            <Suspense fallback={<TableSkeleton rows={10} />}>
                <TicketList ticketData={ticketData} onTicketEdit={onTicketEdit} />
            </Suspense>
            <Sheet open={openSheet} onOpenChange={openSheetHandler}>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>{ticket?.ticketId ? 'Edit' : 'Create'} Ticket</SheetTitle>
                    </SheetHeader>

                    {ticket ? <TicketForm setOpenSheet={setOpenSheet} /> : ''}
                </SheetContent>
            </Sheet>
        </>
    )
} 