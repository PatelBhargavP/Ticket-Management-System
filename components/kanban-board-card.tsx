"use client";

import { ITicketDetails } from '@/models/Ticket'
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { UserAvatarGroup } from './user-avatar-group';
import IconColorBadge from './icon-color-badge';
import { GroupingType } from '@/models';
import { CSS } from "@dnd-kit/utilities";
import { SortableContext, useSortable } from '@dnd-kit/sortable'
import { cva } from 'class-variance-authority'
import { Button } from './ui/button'
import { GripVertical } from 'lucide-react'

interface IKanbanBoardCardProps {
    ticket: ITicketDetails;
    groupType: GroupingType;
    onTicketEdit: (ticket: ITicketDetails) => void;
    isOverlay?: boolean;
}


export type TicketType = "Ticket";

export interface TicketDragData {
    type: TicketType;
    columnId: string;
    ticket: ITicketDetails;
}

export default function KanbanBoardCard({ ticket, groupType, onTicketEdit, isOverlay }: IKanbanBoardCardProps) {
    const handleCardClick = (ticket: ITicketDetails) => {
        onTicketEdit(ticket);
    }

    const {
        setNodeRef,
        attributes,
        listeners,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: ticket.ticketId,
        
        data: {
            type: "Ticket",
            columnId: groupType === 'priority' ? ticket.priority.priorityId : ticket.status.statusId,
            ticket,
        } satisfies TicketDragData,
        attributes: {
            roleDescription: "Ticket",
        },
        
    });

    const style = {
        transition,
        transform: CSS.Translate.toString(transform),
    };

    const variants = cva("shadow-sm", {
        variants: {
            dragging: {
                over: "ring-2 opacity-30",
                overlay: "ring-2 ring-primary",
            },
        },
    });
    return (
        <Card
            key={ticket.ticketId}
            ref={setNodeRef}
            style={style}
            className={variants({
                dragging: isOverlay ? "overlay" : isDragging ? "over" : undefined,
            })}
        >
            <CardHeader className="pr-0">
                <CardTitle className="text-base items-center flex justify-between leading-none">
                    <span>{ticket.name}</span>
                    <Button
                        variant={"ghost"}
                        {...attributes}
                        {...listeners}
                        className="p-1 text-secondary-foreground/50 -ml-2 h-auto cursor-grab"
                    >
                        <span className="sr-only">Move task</span>
                        <GripVertical />
                    </Button>
                </CardTitle>
            </CardHeader>
            <CardContent
                onClick={() => handleCardClick(ticket)}
                className="text-xs flex justify-between items-center text-muted-foreground cursor-pointer"
            >
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
