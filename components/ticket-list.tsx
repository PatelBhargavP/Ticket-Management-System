"use client";

import { use } from "react";
import { ITicketDetails } from "@/models/Ticket";
import { PaginatedData } from "@/models";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { UserAvatarGroup } from "./user-avatar-group";
import IconColorBadge from "./icon-color-badge";
import { ScrollArea } from "./ui/scroll-area";

export default function TicketList(
    { ticketData, onTicketEdit }: { ticketData: Promise<PaginatedData<ITicketDetails>>, onTicketEdit: (ticket: ITicketDetails) => void }
) {
    const ticketListData = use(ticketData);

    const handleRowClick = (ticket: ITicketDetails) => {
        onTicketEdit(ticket);
    }

    if (!ticketListData.totalRecords) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className='flex flex-col justify-around'>
                    No tickets created yet!
                </div>
            </div>
        )
    }

    return (
        <ScrollArea className="max-h-[calc(100vh-225px)] overflow-auto">
            <Table>
                <TableHeader className="bg-muted text-muted-foreground uppercase text-xs font-extralight tracking-wide">
                    <TableRow className="[&>th]:px-4 [&>th]:py-2 [&>th]:text-left">
                        <TableHead className="max-w-[150px] sm:max-w-[450px] xl:max-w-[650px]">Title</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead className="hidden sm:table-cell">Assignee</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {ticketListData.data.map((item) => (
                        <TableRow
                            key={item.ticketId}
                            onClick={() => handleRowClick(item)}
                            className="cursor-pointer hover:bg-muted [&>td]:px-4"
                        >
                            <TableCell className="max-w-[150px] sm:max-w-[450px] xl:max-w-[650px] truncate" title={item.name}>{item.name}</TableCell>
                            <TableCell>
                                <IconColorBadge entity={item.status} />
                            </TableCell>
                            <TableCell>
                                <IconColorBadge entity={item.priority} />
                            </TableCell>
                            <TableCell className="p-0 hidden sm:table-cell">
                                <UserAvatarGroup users={item.assignee} />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

        </ScrollArea>
    )
} 