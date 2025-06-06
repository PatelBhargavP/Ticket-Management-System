'use client'

import { IPriority } from '@/models/Priority';
import { IStatus } from '@/models/Status';
import React, { createContext, useContext, useState } from 'react'

export interface SharedAppContextType {
    statuses: IStatus[];
    setStatuses: (statuses: IStatus[]) => void;
    getStatuses: Promise<IStatus[]>;
    priorities: IPriority[];
    setPriorities: (priorities: IPriority[]) => void;
    getPriorities: Promise<IPriority[]>;
}

const SharedAppContext = createContext<SharedAppContextType | undefined>(undefined);

export const SharedAppProvider = (
    {
        children,
        getStatusesPromise,
        getPrioritiesPromise
    }: {
        children: React.ReactNode;
        getStatusesPromise: Promise<IStatus[]>;
        getPrioritiesPromise: Promise<IPriority[]>;
    }
) => {
    const [statuses, setStatuses] = useState([] as IStatus[]);
    const [priorities, setPriorities] = useState([] as IPriority[]);

    return (
        <SharedAppContext.Provider
            value={{
                statuses,
                setStatuses,
                getStatuses: getStatusesPromise,
                priorities,
                setPriorities,
                getPriorities: getPrioritiesPromise
            }}
        >
            {children}
        </SharedAppContext.Provider>
    )
}

export const useSharedApp = () => {
    const context = useContext(SharedAppContext)
    if (!context) throw new Error('useProject must be used within a SharedAppProvider')
    return context
}
