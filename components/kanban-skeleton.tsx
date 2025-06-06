'use client'

import { Skeleton } from "./ui/skeleton"

export default function KanbanSkeleton() {
    return (
        <div className="flex gap-4 overflow-x-auto">
            {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-[300px] space-y-2">
                    <Skeleton className="h-10" />
                    <Skeleton className="h-[calc(100vh-284px)]" />
                </div>
            ))}
        </div>
    )
}
