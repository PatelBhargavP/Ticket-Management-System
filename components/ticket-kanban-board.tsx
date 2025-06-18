"use client";

import { GroupedData, GroupingType } from "@/models";
import { ITicketDetails, ITicketDocument } from "@/models/Ticket";
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
import { useProjectTicket } from "@/app/context/ProjectTicketContext";
import { updateTicket } from "@/app/actions/updateTicket";
import { useRouter } from "next/navigation";
import { coordinateGetter } from "@/lib/multipleContainersKeyboardPreset";
import { setKanbanColumnOrder } from "@/app/actions/setKanbanColumnOrder";

export type IBoardColum<T> = T & {
    id: string;
};

type Props = {
    getUerProjectTickets: Promise<ITicketDetails[]>;
    getProjectKanbanColumnOrder: Promise<string[]>;
    onTicketEdit: (ticket: ITicketDetails) => void;
};

export default function TicketKanbanBoard({ getUerProjectTickets, getProjectKanbanColumnOrder, onTicketEdit }: Props) {
    const userProjectTicketsList = use(getUerProjectTickets);
    const columnOrder = use(getProjectKanbanColumnOrder);
    const router = useRouter();
    const { project } = useProjectTicket();
    const { statuses, priorities } = useSharedApp();

    const pickedUpTicketColumn = useRef<string | null>(null);
    const [activeColumnId, setActiveColumnID] = useState<string | null>(null);
    const [activeTicket, setActiveTicket] = useState<ITicketDetails | null>(null);
    const [mounted, setMounted] = useState<boolean>(false);
    const [tickets, setTickets] = useState<ITicketDetails[]>(structuredClone(userProjectTicketsList));
    useEffect(() => setMounted(true), [])


    const sensors = useSensors(
        useSensor(MouseSensor),
        useSensor(TouchSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: coordinateGetter,
        })
    );

    if (!tickets.length) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className='flex flex-col justify-around'>
                    No tickets created yet!
                </div>
            </div>
        )
    }
    const groupType: GroupingType = 'status';
    const [columns, setColumns] = useState<IBoardColum<IStatus | IPriority>[]>([]);
    function initializeColumns() {
        let cols: IBoardColum<IStatus | IPriority>[] = [];
        switch (groupType) {
            case 'status': cols = statuses.map(s => ({ ...s, id: s.statusId })); break;
            case 'priority': cols = statuses.map(s => ({ ...s, id: s.statusId })); break;
        }
        if (columnOrder.length) {
            const tracker: { [kaet: string]: boolean } = {}
            const newOrder: IBoardColum<IStatus | IPriority>[] = [];
            const addedColumns = []
            columnOrder.forEach(id => {
                if (tracker[id]) {
                    return;
                }
                const col = cols.find(c => c.id === id);
                if (!col) {
                    tracker[id] = true;
                } else {
                    newOrder.push(col);
                }
            });
            if (newOrder.length < cols.length) {
                //  new column is added
                cols = newOrder.concat(cols.filter(c => !columnOrder.includes(c.id)));
            } else {
                cols = newOrder
            }
        }
        setColumns(cols);
    }
    useEffect(initializeColumns, [statuses, priorities, columnOrder]);

    function ticketFilter(columnId: string, ticket: ITicketDetails, groupType: GroupingType) {
        const currentId = groupType === 'status' ? ticket.status.statusId : groupType === 'priority' ? ticket.priority.priorityId : ticket.ticketId;
        return currentId === columnId;
    }

    // function getDraggingTicketData(ticketId: UniqueIdentifier, columnId: string) {
    //     const column = columns.find((col) => col.id === columnId);
    //     const ticketPosition = tickets?.findIndex((ticket) => ticket.ticketId === ticketId) || -1;
    //     const ticketsInColumn = getColumnTickets(column?.id || '');
    //     return {
    //         ticketsInColumn,
    //         ticketPosition,
    //         column,
    //     };
    // }

    // const announcements: Announcements = {
    //     onDragStart({ active }) {
    //         if (!hasDraggableData(active)) return;
    //         if (active.data.current?.type === "Column") {
    //             const startColumnIdx = columns.findIndex((col) => col.id === active.id);
    //             const startColumn = columns[startColumnIdx];
    //             return `Picked up Column ${startColumn?.name} at position: ${startColumnIdx + 1
    //                 } of ${columns.length}`;
    //         } else if (active.data.current?.type === "Ticket") {
    //             pickedUpTicketColumn.current = active.data.current.columnId;
    //             const { ticketsInColumn, ticketPosition, column } = getDraggingTicketData(
    //                 active.id,
    //                 pickedUpTicketColumn.current || ''
    //             );
    //             return `Picked up Ticket ${active.data.current.name} at position: ${ticketPosition + 1}
    //             of ${ticketsInColumn.length} in column ${column?.name}`;
    //         }
    //     },
    //     onDragOver({ active, over }) {
    //         if (!hasDraggableData(active) || !hasDraggableData(over)) return;

    //         if (
    //             active.data.current?.type === "Column" &&
    //             over.data.current?.type === "Column"
    //         ) {
    //             const overColumnIdx = columns.findIndex((col) => col.id === over.id);
    //             return `Column ${active.data.current.column.name} was moved over ${over.data.current.column.name
    //                 } at position ${overColumnIdx + 1} of ${columns.length}`;
    //         } else if (
    //             active.data.current?.type === "Ticket" &&
    //             over.data.current?.type === "Ticket"
    //         ) {
    //             const { ticketsInColumn, ticketPosition, column } = getDraggingTicketData(
    //                 over.id,
    //                 over.data.current.columnId
    //             );
    //             if (over.data.current.columnId !== pickedUpTicketColumn.current) {
    //                 return `Ticket ${active.data.current.ticket.name} was moved over column ${column?.name}
    //                 in position ${ticketPosition + 1} of ${ticketsInColumn.length}`;
    //             }
    //             return `Ticket was moved over position ${ticketPosition + 1} of ${ticketsInColumn.length
    //                 } in column ${column?.name}`;
    //         }
    //     },
    //     onDragEnd({ active, over }) {
    //         if (!hasDraggableData(active) || !hasDraggableData(over)) {
    //             pickedUpTicketColumn.current = null;
    //             return;
    //         }
    //         if (
    //             active.data.current?.type === "Column" &&
    //             over.data.current?.type === "Column"
    //         ) {
    //             const overColumnPosition = columns.findIndex((col) => col.id === over.id);

    //             return `Column ${active.data.current.column.name} was dropped into position
    //             ${overColumnPosition + 1} of ${columns.length}`;
    //         } else if (
    //             active.data.current?.type === "Ticket" &&
    //             over.data.current?.type === "Ticket"
    //         ) {
    //             const { ticketsInColumn, ticketPosition, column } = getDraggingTicketData(
    //                 over.id,
    //                 over.data.current.columnId
    //             );
    //             if (over.data.current.columnId !== pickedUpTicketColumn.current) {
    //                 return `Ticket was dropped into column ${column?.name} in position
    //                 ${ticketPosition + 1} of ${ticketsInColumn.length}`;
    //             }
    //             return `Ticket was dropped into position ${ticketPosition + 1} of ${ticketsInColumn.length}
    //             in column ${column?.name}`;
    //         }
    //         pickedUpTicketColumn.current = null;
    //     },
    //     onDragCancel({ active }) {
    //         pickedUpTicketColumn.current = null;
    //         if (!hasDraggableData(active)) return;
    //         return `Dragging ${active.data.current?.type} cancelled.`;
    //     },
    // };

    const activeColElm = () => {
        if (!activeColumnId) return undefined;
        const col = columns.find(col => col.id === activeColumnId);
        if (activeColumnId && col !== undefined) {

            return <KanbanBoardColumn
                key={`column_${activeColumnId}`}
                column={col}
                groupType={groupType}
                tickets={tickets.filter(t => ticketFilter(col.id, t, groupType))}
                onTicketEdit={onTicketEdit}
                isOverlay
            />;
        }
    }


    return (
        <DndContext
            sensors={sensors}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDragOver={onDragOver}
        >
            <div className="w-full overflow-x-auto">
                <div className="flex">
                    <BoardContainer>
                        <SortableContext items={columns.map(col => col.id)}>
                            {columns.map((col) => <KanbanBoardColumn
                                key={`column_${col.id}`}
                                column={col}
                                groupType={groupType}
                                tickets={tickets.filter(t => ticketFilter(col.id, t, groupType))}
                                onTicketEdit={onTicketEdit}
                            />)}
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
                            groupType={groupType}
                            isOverlay />}
                    </DragOverlay>,
                    document.body
                )
            }
        </DndContext>
    );

    async function updateTicketApi(ticket: ITicketDetails) {
        const oldTicket = userProjectTicketsList.find(t => t.ticketId == ticket.ticketId);
        const payload: Partial<ITicketDocument> = {
            ticketId: ticket.ticketId,
            statusId: ticket.status.statusId,
            priorityId: ticket.priority.priorityId
        }
        if (oldTicket?.status.statusId !== ticket.status.statusId || oldTicket?.priority.priorityId !== ticket.priority.priorityId) {
            try {
                await updateTicket(ticket.ticketId, project.projectId, payload);
                router.refresh();
            } catch {
                // reset the updated value;
                setTickets((currentVal => currentVal.map(t => t.ticketId === oldTicket?.ticketId ? structuredClone(oldTicket) : t)));
            }
        }
    }
    async function updateCoulumnOrder() {
        try {
            await setKanbanColumnOrder(project.projectId, groupType, columns.map(c => c.id), project.identifier);
            router.refresh();
        } catch {

        }
    }

    function updateTicketBasedOnGroupType(ticket: ITicketDetails, col: IBoardColum<IStatus | IPriority>) {
        switch (groupType) {
            case 'status': {
                ticket.status = col as IStatus;
                break;
            }
            case 'priority': {
                ticket.priority = col as IPriority;
                break;
            }
        }
    }


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

    async function onDragEnd(event: DragEndEvent) {
        setActiveColumnID(null);
        setActiveTicket(null);

        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (!hasDraggableData(active)) return;

        const activeData = active.data.current;
        const isActiveTicket = activeData?.type === "Ticket";
        if (isActiveTicket) {
            await updateTicketApi(activeData.ticket);
        }

        if (activeId === overId) return;

        const isActiveAColumn = activeData?.type === "Column";
        if (!isActiveAColumn) return;

        setColumns((columns) => {
            const activeColumnIndex = columns.findIndex((col) => col.id === activeId);

            const overColumnIndex = columns.findIndex((col) => col.id === overId);

            return arrayMove(columns, activeColumnIndex, overColumnIndex);
        });
        await updateCoulumnOrder();

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

        if (!isActiveATicket || !overData || activeData.columnId === overData.columnId) return; // not having this keep rerendering scroll area

        // Im dropping a Task over another Task
        if (isActiveATicket && isOverATicket) {
            setTickets((curentTickets) => {
                const activeIndex = curentTickets.findIndex((t) => t.ticketId === activeId);
                const overIndex = curentTickets.findIndex((t) => t.ticketId === overId);
                const activeTask = curentTickets[activeIndex];
                const overTask = curentTickets[overIndex];
                const col = columns.find((c) => c.id === overData.columnId);
                if (activeTask && overTask && activeData.columnId !== overData.columnId && col) {
                    updateTicketBasedOnGroupType(activeTask, col);
                    return arrayMove(curentTickets, activeIndex, overIndex - 1);
                }

                return arrayMove(curentTickets, activeIndex, overIndex);
            });
        }


        const isOverAColumn = overData?.type === "Column";

        // Im dropping a Task over a column
        if (isActiveATicket && isOverAColumn) {
            setTickets((tickets) => {
                const activeIndex = tickets.findIndex((t) => t.ticketId === activeId);
                const activeTask = tickets[activeIndex];
                const col = columns.find((c) => c.id === over.id);
                if (activeTask && col) {
                    updateTicketBasedOnGroupType(activeTask, col);
                    return arrayMove(tickets, activeIndex, activeIndex);
                }
                if (activeTask && groupType === 'status' && col) {
                    activeTask.status = col as IStatus;
                    return arrayMove(tickets, activeIndex, activeIndex);
                }
                if (activeTask && groupType === 'priority' && col) {
                    activeTask.priority = col as IPriority;
                    return arrayMove(tickets, activeIndex, activeIndex);
                }
                return tickets;
            });
        }
    }
}
