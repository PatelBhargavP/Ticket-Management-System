import { GroupedData } from '@/models'
import { IPriority } from '@/models/Priority'
import { IStatus } from '@/models/Status'
import { ITicketDetails } from '@/models/Ticket'
import React from 'react'
import IconColorBadge from './icon-color-badge'
import { ScrollArea } from './ui/scroll-area'
import KanbanBoardCard from './kanban-board-card'

interface IKanbanBoardColumnProps {
    group: GroupedData<ITicketDetails, IStatus | IPriority>;
    onTicketEdit: (ticket: ITicketDetails) => void;
}

export default function KanbanBoardColumn({ group, onTicketEdit }: IKanbanBoardColumnProps) {
    
    return (
        <div key={group.groupEntity.name} className="flex-shrink-0 w-[300px] bg-muted/40 rounded-xl shadow-sm p-2">
            <h2 className="text-md font-semibold px-2 py-1">
                <IconColorBadge entity={group.groupEntity} />
            </h2>

            <ScrollArea className="h-[70vh] px-1">
                <div className="flex flex-col gap-2">
                    {group.data.map((ticket) => <KanbanBoardCard ticket={ticket} onTicketEdit={onTicketEdit} groupType={group.groupType}/> )}
                </div>
            </ScrollArea>
        </div>
    )
}
