"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import { Suspense, use, useState } from "react";
import { ITicketDetails } from "@/models/Ticket";
import TicketForm from "./ticket-form";
import { useProjectTicket } from "@/app/context/ProjectTicketContext";
import { useSharedApp } from "@/app/context/SharedAppContext";
import Link from "next/link";
import { prefetchStatusAndPriority } from "@/lib/prefetch-data";
import { GroupedData, PaginatedData } from "@/models";
import { Button } from "./ui/button";
import { IAppUser } from "@/models/User";
import TicketList from "./ticket-list";
import TableSkeleton from "./table-skeleton";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "./ui/breadcrumb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { IStatus } from "@/models/Status";
import { IPriority } from "@/models/Priority";
import TicketKanbanBoard from "./ticket-kanban-board";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import KanbanSkeleton from "./kanban-skeleton";
import GroupedTransactions from "./grouped-transactions";
import { ScrollArea } from "./ui/scroll-area";

export default function ProjectTicketLayout(
    {
        ticketData,
        ticketBoardData,
        getProjectKanbanColumnOrder,
        contentType
    }: {
        ticketData?: Promise<PaginatedData<ITicketDetails>>;
        ticketBoardData?: Promise<ITicketDetails[]>;
        getProjectKanbanColumnOrder?: Promise<string[]>;
        contentType: 'list' | 'board';
    }
) {
    const { ticket, setTicket, project } = useProjectTicket();
    prefetchStatusAndPriority();
    const { statuses, priorities } = useSharedApp();
    const [openSheet, setOpenSheet] = useState(false);
    const [isFormDirty, setIsFormDirty] = useState(false);
    const [showPrompt, setShowPrompt] = useState(false);
    const newTicketObj = {
        name: "",
        description: "",
        project,
        status: statuses.find(s => s.isDefault) || statuses[0],
        priority: priorities.find(s => s.isDefault) || priorities[0],
        assignee: [] as IAppUser[],
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: {} as IAppUser,
        updatedBy: {} as IAppUser,
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
            // if (isFormDirty) {
            //     setShowPrompt(true);
            //     return;
            // } else {
            setTicket(null);
            // }
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
                        <Link href={`/projects/${project.identifier}/list`} >
                            <TabsTrigger className="cursor-pointer" value="list">
                                List
                            </TabsTrigger>
                        </Link>
                        <Link href={`/projects/${project.identifier}/board`} >
                            <TabsTrigger className="cursor-pointer" value="board">
                                Board
                            </TabsTrigger>
                        </Link>
                    </TabsList>
                </Tabs>
            </div>
            <div className="flex pb-3 w-full justify-end">
                <Button onClick={onTicketAdd}>Add ticket</Button>
            </div>
            <Suspense fallback={ticketData ? <TableSkeleton rows={10} /> : <KanbanSkeleton />}>
                {
                    ticketData
                        ? <TicketList ticketData={ticketData} onTicketEdit={onTicketEdit} />
                        : ticketBoardData && getProjectKanbanColumnOrder
                            ? <TicketKanbanBoard getUerProjectTickets={ticketBoardData} getProjectKanbanColumnOrder={getProjectKanbanColumnOrder} onTicketEdit={onTicketEdit} />
                            : <p>Error</p>
                }

            </Suspense>
            <Sheet open={openSheet} onOpenChange={openSheetHandler}>
                <SheetContent className="w-full sm:w-[600px] sm:max-w-[600px] xl:w-[900px] xl:max-w-[900px]">
                    <SheetHeader>
                        <SheetTitle>{ticket?.ticketId ? 'Edit' : 'Create'} Ticket</SheetTitle>
                    </SheetHeader>

                    {ticket &&

                        <div className="px-3">
                            <Tabs defaultValue="details">

                                <TabsList>
                                    <TabsTrigger value="details">Details</TabsTrigger>
                                    {ticket.ticketId && <TabsTrigger value="activity">Activity History</TabsTrigger>}
                                </TabsList>
                                <ScrollArea className='max-h-[calc(100vh-115px)] overflow-auto'>
                                    <TabsContent className="p-2" value="details">
                                        <TicketForm
                                            onDirtyChange={(dirty) => setIsFormDirty(dirty)} onSubmitSuccess={() => {
                                                setIsFormDirty(false);
                                                openSheetHandler(false);
                                            }} />
                                    </TabsContent>

                                    <TabsContent className="p-2 " value="activity">
                                        <GroupedTransactions />
                                    </TabsContent>
                                </ScrollArea>

                            </Tabs>
                        </div>
                    }
                </SheetContent>
            </Sheet>


            <AlertDialog open={showPrompt} onOpenChange={setShowPrompt}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
                        <AlertDialogDescription>
                            You have unsaved changes. Are you sure you want to discard them?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setShowPrompt(false)}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={() => {
                            setIsFormDirty(false);
                            setOpenSheet(false);
                        }}>
                            Discard Changes
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
} 