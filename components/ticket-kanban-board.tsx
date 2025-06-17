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
import KanbanBoardColumn from "./kanban-board-column";

type Props = {
    groupedTicketsPromise: Promise<{ [key: string]: GroupedData<ITicketDetails, IStatus | IPriority> }>;
    onTicketEdit: (ticket: ITicketDetails) => void;
};

export default function TicketKanbanBoard({ groupedTicketsPromise, onTicketEdit }: Props) {
    const groupedTickets = use(groupedTicketsPromise);
    const groupKeys = Object.keys(groupedTickets);

    if (!groupKeys.length) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className='flex flex-col justify-around'>
                    No tickets created yet!
                </div>
            </div>
        )
    }
    return (
        <div className="w-full overflow-x-auto">
            <div className="flex gap-4 min-w-full px-2 pb-2">
                {groupKeys.map((groupKey) => <KanbanBoardColumn group={groupedTickets[groupKey]} onTicketEdit={onTicketEdit}/>)}
            </div>
        </div>
    );
}
