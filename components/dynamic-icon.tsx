import {
    AlertTriangle,
    ArrowDown,
    ArrowUp,
    Ban,
    CheckCircle,
    Circle,
    CircleHelp,
    Eye,
    List,
    Loader,
    Minus,
    type LucideIcon,
    type LucideProps,
} from 'lucide-react';
import React from 'react';

export default function DynamicIcon({ iconName , ...props}: { iconName?: string; } & Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>) {
    if (!iconName) {
        return (<CircleHelp {...props} />);
    }
    const dynamicIcons: Record<string, LucideIcon> = {
        CircleHelp,
        List,
        Circle,
        Ban,
        CheckCircle,
        Eye,
        Loader,
        Minus,
        ArrowUp,
        ArrowDown,
        AlertTriangle,
    }
    const IconComponent = dynamicIcons[iconName];
    if (!IconComponent) {
        return (<CircleHelp {...props} />);
    }
    return <IconComponent {...props} />;
}
