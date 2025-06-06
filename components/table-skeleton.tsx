'use client';

import { Skeleton } from '@/components/ui/skeleton';

export default function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="w-full rounded-xl border p-4 shadow-sm">
      <div className="mb-4 flex justify-between">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-6 w-24" />
      </div>

      <div className="grid grid-cols-5 gap-4 border-b py-2 font-medium text-muted-foreground">
        <div><Skeleton className="h-4 w-24" /></div>
        <div><Skeleton className="h-4 w-20" /></div>
        <div><Skeleton className="h-4 w-28" /></div>
        <div><Skeleton className="h-4 w-16" /></div>
        <div><Skeleton className="h-4 w-20" /></div>
      </div>

      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="grid grid-cols-5 items-center gap-4 border-b py-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  );
}
