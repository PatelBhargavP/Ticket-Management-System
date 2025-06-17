import { ITicketDetails } from '@/models/Ticket'
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { UserAvatarGroup } from './user-avatar-group';
import IconColorBadge from './icon-color-badge';
import { GroupingType } from '@/models';

interface IKanbanBoardCardProps {
    ticket: ITicketDetails;
    groupType: GroupingType;
    onTicketEdit: (ticket: ITicketDetails) => void;
}

export default function KanbanBoardCard({ ticket, groupType, onTicketEdit }: IKanbanBoardCardProps) {
    const handleCardClick = (ticket: ITicketDetails) => {
        onTicketEdit(ticket);
    }
    return (
        <Card onClick={() => handleCardClick(ticket)} key={ticket.ticketId} className="shadow-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-base">{ticket.name}</CardTitle>
            </CardHeader>
            <CardContent className="text-xs flex justify-between items-center text-muted-foreground">
                <UserAvatarGroup users={ticket.assignee} />
                <div className="inline-flex justify-between">
                    {groupType === 'priority'
                        ? <IconColorBadge entity={ticket.status} />
                        : <IconColorBadge entity={ticket.priority} />
                    }
                </div>
            </CardContent>
        </Card>
    )
}
