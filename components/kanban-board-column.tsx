"use client";

import { GroupedData, GroupingType } from '@/models'
import { IPriority } from '@/models/Priority'
import { IStatus } from '@/models/Status'
import { ITicketDetails } from '@/models/Ticket'
import React from 'react'
import IconColorBadge from './icon-color-badge'
import { ScrollArea, ScrollBar } from './ui/scroll-area'
import KanbanBoardCard from './kanban-board-card';
import { CSS } from "@dnd-kit/utilities";
import { SortableContext, useSortable } from '@dnd-kit/sortable'
import { cva } from 'class-variance-authority'
import { Button } from './ui/button'
import { GripVertical } from 'lucide-react'
import { useDndContext } from '@dnd-kit/core';
import { Card, CardHeader, CardTitle } from './ui/card';
import { IBoardColum } from './ticket-kanban-board';

interface IKanbanBoardColumnProps {
    column: IBoardColum<IStatus | IPriority>;
    groupType: GroupingType;
    tickets: ITicketDetails[];
    onTicketEdit: (ticket: ITicketDetails) => void;
    isOverlay?: boolean
}


export type ColumnType = "Column";

export interface ColumnDragData {
    type: ColumnType;
    columnId: string;
    column: IBoardColum<IStatus | IPriority>;
}

export default function KanbanBoardColumn({
    column,
    groupType,
    tickets,
    onTicketEdit,
    isOverlay
}: IKanbanBoardColumnProps) {

    const {
        setNodeRef,
        active,
        attributes,
        listeners,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: column.id,
        data: {
            type: "Column",
            columnId: column.id,
            column: column
        } satisfies ColumnDragData,
        attributes: {
            roleDescription: `Column: ${column.name}`,
        },
    });

    const style = {
        transition,
        transform: CSS.Translate.toString(transform),
    };

    const variants = cva(
        // "m-1 w-[300px] bg-muted/40 rounded-xl shadow-sm p-2",
        "w-[300px] max-w-full bg-primary-foreground snap-center rounded-sm my-1",
        {
            variants: {
                dragging: {
                    default: "border border-transparent",
                    over: "ring-1 opacity-30",
                    overlay: "ring-1 ring-primary",
                },
            },
        }
    );

    return (
        <div
            key={column.id}
            ref={setNodeRef}
            style={style}
            className={variants({
                dragging: isOverlay ? "overlay" : isDragging ? "over" : undefined,
            })}
        >
            <h2 className="text-md font-semibold p-2 flex justify-between">
                <IconColorBadge entity={column} />
                <Button
                    variant={"ghost"}
                    {...attributes}
                    {...listeners}
                    className=" p-1 text-primary/50 -ml-2 h-auto cursor-grab relative"
                >
                    <span className="sr-only">{`Move column: ${column.name}`}</span>
                    <GripVertical />
                </Button>
            </h2>

            <ScrollArea className="h-[calc(100vh-310px)] px-1">
                <div className="flex flex-col pt-1 gap-2">
                    <SortableContext items={tickets.map((ticket) => ticket.ticketId)}>
                        {/* {active?.data.current?.ticket?.ticketId !== undefined
                            && active?.data?.current?.columnId !== group.groupId
                            && over?.data?.current?.columnId === group.groupId
                            &&
                            <Card key={active?.data.current?.ticket?.ticketId} className='shadow-sm opacity-30'>
                                <CardHeader>
                                    <CardTitle className="text-base items-center flex justify-between leading-none">
                                        {active?.data.current?.ticket?.name}
                                    </CardTitle>
                                </CardHeader>
                            </Card>
                            // <KanbanBoardCard key={`card_${active.data.current.ticket.ticketId}`} ticket={active.data.current.ticket} onTicketEdit={onTicketEdit} groupType={group.groupType} />
                        } */}
                        {
                            tickets.map((ticket) => {
                                return <KanbanBoardCard
                                    key={`card_${ticket.ticketId}`}
                                    ticket={ticket}
                                    onTicketEdit={onTicketEdit}
                                    groupType={groupType} />;
                            })
                        }
                    </SortableContext>
                </div>
            </ScrollArea>
        </div>
    )
}


export function BoardContainer({ children }: { children: React.ReactNode }) {
    const dndContext = useDndContext();

    const variations = cva("px-2 md:px-0 flex lg:justify-center pb-4", {
        variants: {
            dragging: {
                default: "snap-x snap-mandatory",
                active: "snap-none",
            },
        },
    });

    return (
        <ScrollArea
            className={variations({
                dragging: dndContext.active ? "active" : "default",
            })}
        >
            <div className="flex gap-4 items-center flex-row justify-center">
                {children}
            </div>
            <ScrollBar orientation="horizontal" />
        </ScrollArea>
    );
}
