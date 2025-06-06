"use client";

import { use } from "react";
import { ITicketDetails } from "@/models/Ticket";
import { PaginatedData } from "@/models";
import { Button } from "./ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { useProjectTicket } from "@/app/context/ProjectTicketContext";

export default function TicketList(
    { ticketData, onTicketEdit }:{ ticketData: Promise<PaginatedData<ITicketDetails>>, onTicketEdit: (ticket: ITicketDetails) => void}
) {
    const ticketListData = use(ticketData);

    const handleRowClick = (ticket: ITicketDetails) => {
        onTicketEdit(ticket);
    } 

    return (
        <>
        {/* <Button onClick={onTicketAdd}>Add ticket</Button> */}
        total_tickets - {ticketListData.totalRecords}
        <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
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
                            className="cursor-pointer hover:bg-muted"
                        >
                            <TableCell>{item.name}</TableCell>
                            <TableCell>{item.status.name}</TableCell>
                            <TableCell>{item.priority.name}</TableCell>
                            <TableCell>{item.assignee.length} member{item.assignee.length > 1 ? 's' : ''}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

        </>
    )
} 