import { CircleHelp, List, Circle, Ban, CheckCircle, Eye, Loader, Minus, ArrowUp, ArrowDown, AlertTriangle, LucideProps } from 'lucide-react';
import React, { JSX , ForwardRefExoticComponent} from 'react';

export default function DynamicIcon({ iconName , ...props}: { iconName?: string; } & Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>) {
    if (!iconName) {
        return (<CircleHelp />);
    }
    const dynamicIcons: {[name: string]: JSX.Element } = {
        CircleHelp: <CircleHelp />,
        List: <List />,
        Circle: <Circle />,
        Ban: <Ban />,
        CheckCircle: <CheckCircle />,
        Eye: <Eye />,
        Loader: <Loader />,
        Minus: <Minus />,
        ArrowUp: <ArrowUp />,
        ArrowDown: <ArrowDown />,
        AlertTriangle: <AlertTriangle />
    }
    const IconComponent = dynamicIcons[iconName];
    if (!IconComponent) {
        return (<CircleHelp />);
    }
    return IconComponent;
}
