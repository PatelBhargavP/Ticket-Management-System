import React from 'react'
import { Badge } from './ui/badge'
import { IStatus } from '@/models/Status'
import DynamicIcon from './dynamic-icon'
import { IPriority } from '@/models/Priority'
import { cn } from '@/lib/utils'

interface IconBadgeProps {
    entity: IStatus | IPriority;
    badgeClass?: string;
    textClass?: string;
}
export default function IconColorBadge({ entity, badgeClass, textClass }: IconBadgeProps ) {
    return (

        <Badge
            variant="secondary"
            className={"text-sm" + (badgeClass || '')} 
            style={{
                color: entity.color,
                backgroundColor: `${entity.color}20`, // add 20 for ~12% opacity
            }}
        >
            <DynamicIcon iconName={entity.icon} />
            <span className={textClass || ''}>{entity.name}</span>
        </Badge>
    )
}
