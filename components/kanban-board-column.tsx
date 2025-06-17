"use client";

import { GroupedData } from '@/models'
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

interface IKanbanBoardColumnProps {
    group: GroupedData<ITicketDetails, IStatus | IPriority>;
    onTicketEdit: (ticket: ITicketDetails) => void;
    isOverlay: boolean
}


export type ColumnType = "Column";

export interface ColumnDragData {
    type: ColumnType;
    columnId: string;
    column: IStatus | IPriority;
}

export default function KanbanBoardColumn({ group, onTicketEdit, isOverlay }: IKanbanBoardColumnProps) {

    const {
        setNodeRef,
        active,
        over,
        attributes,
        listeners,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: group.groupId,
        data: {
            type: "Column",
            columnId: group.groupId,
            column: group.groupEntity
        } satisfies ColumnDragData,
        attributes: {
            roleDescription: `Column: ${group.groupEntity.name}`,
        },
    });

    const style = {
        transition,
        transform: CSS.Translate.toString(transform),
    };

    const variants = cva(
        // "m-1 w-[300px] bg-muted/40 rounded-xl shadow-sm p-2",
        "w-[300px] max-w-full bg-primary-foreground snap-center rounded-lg my-1",
        {
            variants: {
                dragging: {
                    default: "border-1 border-transparent",
                    over: "ring-1 opacity-30",
                    overlay: "ring-1 ring-primary",
                },
            },
        }
    );

    return (
        <div
            key={group.groupId}
            ref={setNodeRef}
            style={style}
            className={variants({
                dragging: isOverlay ? "overlay" : isDragging ? "over" : undefined,
            })}
        >
            <h2 className="text-md font-semibold px-2 py-1 flex justify-between">
                <IconColorBadge entity={group.groupEntity} />
                <span>Active Type, {active?.data.current?.type}</span>
                <Button
                    variant={"ghost"}
                    {...attributes}
                    {...listeners}
                    className=" p-1 text-primary/50 -ml-2 h-auto cursor-grab relative"
                >
                    <span className="sr-only">{`Move column: ${group.groupEntity.name}`}</span>
                    <GripVertical />
                </Button>
            </h2>

            <ScrollArea className="h-[calc(100vh-305px)] px-1">
                <div className="flex flex-col gap-2">
                    <SortableContext items={group.data.map((ticket) => ticket.ticketId)}>
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
                            group.data.map((ticket) => {
                                return <KanbanBoardCard
                                key={`card_${ticket.ticketId}`}
                                ticket={ticket}
                                onTicketEdit={onTicketEdit}
                                groupType={group.groupType} />;
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
