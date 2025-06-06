import React from 'react'
import { Badge } from './ui/badge'
import { IStatus } from '@/models/Status'
import DynamicIcon from './dynamic-icon'
import { IPriority } from '@/models/Priority'
import { cn } from '@/lib/utils'

export default function IconColorBadge({ entity }: { entity: IStatus | IPriority }) {
    return (

        <Badge
            variant="secondary"
            className="text-sm"
            style={{
                color: entity.color,
                backgroundColor: `${entity.color}20`, // add 20 for ~12% opacity
            }}
        >
            <DynamicIcon iconName={entity.icon} />
            {entity.name}
        </Badge>
    )
}
