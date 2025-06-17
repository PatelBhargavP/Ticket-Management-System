import { TicketDragData } from "@/components/kanban-board-card";
import { ColumnDragData } from "@/components/kanban-board-column";
import { ITicketDetails } from "@/models/Ticket";
import { Active, DataRef, Over } from "@dnd-kit/core";

type DraggableData = ColumnDragData | TicketDragData;

export function hasDraggableData<T extends Active | Over>(
    entry: T | null | undefined
): entry is T & {
    data: DataRef<DraggableData>;
} {
    if (!entry) {
        return false;
    }

    const data = entry.data.current;

    if (data?.type === "Column" || data?.type === "Ticket") {
        return true;
    }

    return false;
}