"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GroupedData } from "@/models";
import { ITicketDetails } from "@/models/Ticket";
import { IStatus } from "@/models/Status";
import { IPriority } from "@/models/Priority";
import { use } from "react";
import IconColorBadge from "./icon-color-badge";
import { UserAvatarGroup } from "./user-avatar-group";

type Props = {
    groupedTicketsPromise: Promise<{ [key: string]: GroupedData<ITicketDetails, IStatus | IPriority> }>;
    onTicketEdit: (ticket: ITicketDetails) => void;
};

export default function TicketKanbanBoard({ groupedTicketsPromise, onTicketEdit }: Props) {
    const groupedTickets = use(groupedTicketsPromise);
    const groupKeys = Object.keys(groupedTickets);
    const handleCardClick = (ticket: ITicketDetails) => {
        onTicketEdit(ticket);
    }
    return (
        <div className="w-full overflow-x-auto">
            <div className="flex gap-4 min-w-full px-2 pb-2">
                {groupKeys.map((groupKey) => (
                    <div key={groupKey} className="flex-shrink-0 w-[300px] bg-muted/40 rounded-xl shadow-sm p-2">
                        <h2 className="text-md font-semibold px-2 py-1">
                            <IconColorBadge entity={groupedTickets[groupKey].groupEntity} />
                        </h2>

                        <ScrollArea className="h-[70vh] px-1">
                            <div className="flex flex-col gap-2">
                                {groupedTickets[groupKey].data.map((ticket) => (
                                    <Card onClick={() => handleCardClick(ticket)} key={ticket.ticketId} className="shadow-sm">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-base">{ticket.name}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="text-xs flex justify-between items-center text-muted-foreground">
                                            <UserAvatarGroup users={ticket.assignee} />
                                            <div className="inline-flex justify-between">
                                                {groupedTickets[groupKey].groupType === 'priority'
                                                    ? <IconColorBadge entity={ticket.status} />
                                                    : <IconColorBadge entity={ticket.priority} />
                                                }
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                ))}
            </div>
        </div>
    );
}
