import { Badge } from './ui/badge'
import { IStatus } from '@/models/Status'
import DynamicIcon from './dynamic-icon'
import { IPriority } from '@/models/Priority'

interface IconBadgeProps {
    entity: IStatus | IPriority | null | undefined;
    badgeClass?: string;
    textClass?: string;
}
export default function IconColorBadge({ entity, badgeClass, textClass }: IconBadgeProps ) {
    if (!entity) {
        return (
            <Badge variant="secondary" className={"text-sm" + (badgeClass || '')}>
                <span className={textClass || ''}>—</span>
            </Badge>
        )
    }

    return (
        <Badge
            variant="secondary"
            className={"text-sm" + (badgeClass || '')}
            style={{
                color: entity.color || undefined,
                backgroundColor: entity.color ? `${entity.color}20` : undefined, // add 20 for ~12% opacity
            }}
        >
            <DynamicIcon iconName={entity.icon} />
            <span className={textClass || ''}>{entity.name}</span>
        </Badge>
    )
}
