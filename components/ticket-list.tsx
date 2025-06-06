"use client";

import { use } from "react";
import { ITicketDetails } from "@/models/Ticket";
import { PaginatedData } from "@/models";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { UserAvatarGroup } from "./user-avatar-group";
import IconColorBadge from "./icon-color-badge";

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
        <>
            <Table>
                <TableHeader className="bg-muted text-muted-foreground uppercase text-xs font-extralight tracking-wide">
                    <TableRow className="[&>th]:px-4 [&>th]:py-2 [&>th]:text-left">
                        <TableHead>Title</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Assignee</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {ticketListData.data.map((item) => (
                        <TableRow
                            key={item.ticketId}
                            onClick={() => handleRowClick(item)}
                            className="cursor-pointer hover:bg-muted [&>td]:px-4"
                        >
                            <TableCell>{item.name}</TableCell>
                            <TableCell>
                                <IconColorBadge entity={item.status}/>
                            </TableCell>
                            <TableCell>
                                <IconColorBadge entity={item.priority}/>
                            </TableCell>
                            <TableCell>
                                <UserAvatarGroup users={item.assignee} />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

        </>
    )
} 