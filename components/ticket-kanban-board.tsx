"use client";

import { GroupedData } from "@/models";
import { ITicketDetails } from "@/models/Ticket";
import { IStatus } from "@/models/Status";
import { IPriority } from "@/models/Priority";
import { use, useEffect, useRef, useState } from "react";
import KanbanBoardColumn, { BoardContainer } from "./kanban-board-column";
import {
    Announcements,
    DndContext,
    DragEndEvent,
    DragOverEvent,
    DragOverlay,
    DragStartEvent,
    KeyboardSensor,
    MouseSensor,
    TouchSensor,
    UniqueIdentifier,
    useSensor,
    useSensors
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { hasDraggableData } from "@/lib/drag.utils";
import { useSharedApp } from "@/app/context/SharedAppContext";
import { createPortal } from "react-dom";
import KanbanBoardCard from "./kanban-board-card";
import IconColorBadge from "./icon-color-badge";

type Props = {
    groupedTicketsPromise: Promise<{ [key: string]: GroupedData<ITicketDetails, IStatus | IPriority> }>;
    onTicketEdit: (ticket: ITicketDetails) => void;
};

export default function TicketKanbanBoard({ groupedTicketsPromise, onTicketEdit }: Props) {
    const groupedTickets = use(groupedTicketsPromise);
    const groupKeys = Object.keys(groupedTickets);
    const { statuses, priorities } = useSharedApp();

    const pickedUpTicketColumn = useRef<string | null>(null);
    const [activeColumnId, setActiveColumnID] = useState<string | null>(null);
    const [activeTicket, setActiveTicket] = useState<ITicketDetails | null>(null);
    const [mounted, setMounted] = useState<boolean>(false);
    useEffect(() => setMounted(true), [])


    const sensors = useSensors(
        useSensor(MouseSensor),
        useSensor(TouchSensor),
        // useSensor(KeyboardSensor, {
        //     coordinateGetter: coordinateGetter,
        // })
    );

    if (!groupKeys.length) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className='flex flex-col justify-around'>
                    No tickets created yet!
                </div>
            </div>
        )
    }
    const [columns, setColumns] = useState<GroupedData<ITicketDetails, IStatus | IPriority>[]>(groupKeys.map((groupKey) => groupedTickets[groupKey]));

    function getDraggingTicketData(ticketId: UniqueIdentifier, columnId: string) {
        const column = columns.find((col) => col.groupId === columnId);
        const ticketPosition = column?.data.findIndex((ticket) => ticket.ticketId === ticketId) || -1;
        const ticketsInColumn = column?.data || [];
        return {
            ticketsInColumn,
            ticketPosition,
            column,
        };
    }

    const announcements: Announcements = {
        onDragStart({ active }) {
            if (!hasDraggableData(active)) return;
            if (active.data.current?.type === "Column") {
                const startColumnIdx = columns.findIndex((col) => col.groupId === active.id);
                const startColumn = columns[startColumnIdx];
                return `Picked up Column ${startColumn?.groupEntity.name} at position: ${startColumnIdx + 1
                    } of ${columns.length}`;
            } else if (active.data.current?.type === "Ticket") {
                pickedUpTicketColumn.current = active.data.current.columnId;
                const { ticketsInColumn, ticketPosition, column } = getDraggingTicketData(
                    active.id,
                    pickedUpTicketColumn.current || ''
                );
                return `Picked up Ticket ${active.data.current.name} at position: ${ticketPosition + 1}
                of ${ticketsInColumn.length} in column ${column?.groupEntity.name}`;
            }
        },
        onDragOver({ active, over }) {
            if (!hasDraggableData(active) || !hasDraggableData(over)) return;

            if (
                active.data.current?.type === "Column" &&
                over.data.current?.type === "Column"
            ) {
                const overColumnIdx = columns.findIndex((col) => col.groupId === over.id);
                return `Column ${active.data.current.column.name} was moved over ${over.data.current.column.name
                    } at position ${overColumnIdx + 1} of ${columns.length}`;
            } else if (
                active.data.current?.type === "Ticket" &&
                over.data.current?.type === "Ticket"
            ) {
                const { ticketsInColumn, ticketPosition, column } = getDraggingTicketData(
                    over.id,
                    over.data.current.columnId
                );
                if (over.data.current.columnId !== pickedUpTicketColumn.current) {
                    return `Ticket ${active.data.current.ticket.name} was moved over column ${column?.groupEntity.name}
                    in position ${ticketPosition + 1} of ${ticketsInColumn.length}`;
                }
                return `Ticket was moved over position ${ticketPosition + 1} of ${ticketsInColumn.length
                    } in column ${column?.groupEntity.name}`;
            }
        },
        onDragEnd({ active, over }) {
            if (!hasDraggableData(active) || !hasDraggableData(over)) {
                pickedUpTicketColumn.current = null;
                return;
            }
            if (
                active.data.current?.type === "Column" &&
                over.data.current?.type === "Column"
            ) {
                const overColumnPosition = columns.findIndex((col) => col.groupId === over.id);

                return `Column ${active.data.current.column.name} was dropped into position
                ${overColumnPosition + 1} of ${columns.length}`;
            } else if (
                active.data.current?.type === "Ticket" &&
                over.data.current?.type === "Ticket"
            ) {
                const { ticketsInColumn, ticketPosition, column } = getDraggingTicketData(
                    over.id,
                    over.data.current.columnId
                );
                if (over.data.current.columnId !== pickedUpTicketColumn.current) {
                    return `Ticket was dropped into column ${column?.groupEntity.name} in position
                    ${ticketPosition + 1} of ${ticketsInColumn.length}`;
                }
                return `Ticket was dropped into position ${ticketPosition + 1} of ${ticketsInColumn.length}
                in column ${column?.groupEntity.name}`;
            }
            pickedUpTicketColumn.current = null;
        },
        onDragCancel({ active }) {
            pickedUpTicketColumn.current = null;
            if (!hasDraggableData(active)) return;
            return `Dragging ${active.data.current?.type} cancelled.`;
        },
    };

    const activeColElm = () => {
        if (!activeColumnId) return undefined;
        const col = columns.find(col => col.groupId === activeColumnId);
        if (activeColumnId && col !== undefined) {
            // return <div className="w-[300px] flex justify-end">
            //     <IconColorBadge entity={col.groupEntity}/>
            // </div>;

            return <KanbanBoardColumn key={`column_${activeColumnId}`} group={col} onTicketEdit={onTicketEdit} isOverlay />;
        }
    }


    return (
        <DndContext
            accessibility={{
                announcements,
            }}
            sensors={sensors}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDragOver={onDragOver}
        >
            <div className="w-full overflow-x-auto">
                <div className="flex">
                    <BoardContainer>
                        <SortableContext items={columns.map(col => col.groupId)}>
                            {columns.map((group) => <KanbanBoardColumn key={`column_${group.groupId}`} group={group} onTicketEdit={onTicketEdit} isOverlay />)}
                        </SortableContext>
                    </BoardContainer>
                </div>
            </div>


            {mounted && "document" in window &&
                createPortal(
                    <DragOverlay>
                        {activeColElm()}
                        {activeTicket && <KanbanBoardCard
                            key={`card_${activeTicket.ticketId}`}
                            ticket={activeTicket}
                            onTicketEdit={onTicketEdit}
                            groupType={columns[0].groupType} />}
                    </DragOverlay>,
                    document.body
                )
            }
        </DndContext>
    );


    function onDragStart(event: DragStartEvent) {
        if (!hasDraggableData(event.active)) return;
        const data = event.active.data.current;
        if (data?.type === "Column") {
            setActiveColumnID(data.columnId);
            return;
        }

        if (data?.type === "Ticket") {
            setActiveTicket(data.ticket);
            return;
        }
    }

    function onDragEnd(event: DragEndEvent) {
        setActiveColumnID(null);
        setActiveTicket(null);

        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (!hasDraggableData(active)) return;

        const activeData = active.data.current;

        if (activeId === overId) return;

        const isActiveAColumn = activeData?.type === "Column";
        if (!isActiveAColumn) return;

        setColumns((columns) => {
            const activeColumnIndex = columns.findIndex((col) => col.groupId === activeId);

            const overColumnIndex = columns.findIndex((col) => col.groupId === overId);

            return arrayMove(columns, activeColumnIndex, overColumnIndex);
        });
    }

    function onDragOver(event: DragOverEvent) {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        if (!hasDraggableData(active) || !hasDraggableData(over)) return;

        const activeData = active.data.current;
        const overData = over.data.current;

        const isActiveATicket = activeData?.type === "Ticket";
        const isOverATicket = overData?.type === "Ticket";

        if (!isActiveATicket || !overData) return;


        // if(activeData.columnId !== overData.columnId) {
        //     groupedTickets[activeData.columnId].data = groupedTickets[activeData.columnId].data.filter(ticket => ticket.ticketId !== activeData.ticket.ticketId);
        //     groupedTickets[overData.columnId].data.unshift(activeData.ticket);
        // } else {
        //     const tickets = groupedTickets[activeData.columnId].data;
        //     const activeIndex = tickets.findIndex((t) => t.ticketId === activeId);
        //     const overIndex = tickets.findIndex((t) => t.ticketId === overId);
        //     groupedTickets[activeData.columnId].data = arrayMove(tickets, activeIndex, overIndex)
        // }
        // setColumns(groupKeys.map((groupKey) => groupedTickets[groupKey]));
    // Im dropping a Task over another Task
    // if (isActiveATicket && isOverATicket) {
    //         const tickets = groupedTickets[activeData.columnId].data;
    //         const activeIndex = tickets.findIndex((t) => t.ticketId === activeId);
    //         const overIndex = tickets.findIndex((t) => t.ticketId === overId);
    //         groupedTickets[activeData.columnId].data = arrayMove(tickets, activeIndex, overIndex)
        
    //   setTasks((tasks) => {
    //     const activeIndex = tasks.findIndex((t) => t.id === activeId);
    //     const overIndex = tasks.findIndex((t) => t.id === overId);
    //     const activeTask = tasks[activeIndex];
    //     const overTask = tasks[overIndex];
    //     if (
    //       activeTask &&
    //       overTask &&
    //       activeTask.columnId !== overTask.columnId
    //     ) {
    //       activeTask.columnId = overTask.columnId;
    //       return arrayMove(tasks, activeIndex, overIndex - 1);
    //     }

    //     return arrayMove(tasks, activeIndex, overIndex);
    //   });
    // }

    // const isOverAColumn = overData?.type === "Column";

    // Im dropping a Task over a column
    // if (isActiveATask && isOverAColumn) {
    //   setTasks((tasks) => {
    //     const activeIndex = tasks.findIndex((t) => t.id === activeId);
    //     const activeTask = tasks[activeIndex];
    //     if (activeTask) {
    //       activeTask.columnId = overId as ColumnId;
    //       return arrayMove(tasks, activeIndex, activeIndex);
    //     }
    //     return tasks;
    //   });
    // }
    }
}
