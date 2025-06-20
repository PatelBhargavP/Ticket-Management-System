import { Skeleton } from "@/components/ui/skeleton";

export function GroupedTransactionsSkeleton() {
    return (
        <div className="space-y-6 overflow-hidden max-h-[calc(100vh-140px)]">
            {[...Array(4)].map((_, i) => (
                <div
                    key={i}
                    className="flex flex-col space-y-2 border-b pb-4 border-muted/30"
                >
                    {/* User Row */}
                    <div className="flex items-center space-x-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <span className="flex justify-between w-full">
                            <Skeleton className="h-4 w-30" />
                            <Skeleton className="h-4 w-60" />
                        </span>
                    </div>

                    {/* Fields Changed */}
                    <div className="flex flex-wrap items-center gap-3 pl-10">
                        <div className="flex items-center gap-2 justify-between w-1/3">
                            <Skeleton className="h-6 w-14 rounded-full" />
                            <span className="text-muted-foreground">➜</span>
                            <Skeleton className="h-6 w-14 rounded-full" />
                        </div>

                        {/* Optional: Assignee */}
                        {i === 3 && (
                            <div className="flex items-center gap-2 w-full">
                                <Skeleton className="h-6 w-20 rounded-md" />
                            </div>
                        )}
                    </div>

                    {/* Timestamp */}
                    <div className="pl-10 text-xs text-muted-foreground">
                        <Skeleton className="h-4 w-100" />
                    </div>
                </div>
            ))}
            <div className="p-10 text-xs text-muted-foreground border-b-2">
                <Skeleton className="h-4 w-full" />
            </div>
            <div className="p-10 text-xs text-muted-foreground border-b-2">
                <Skeleton className="h-4 w-full" />
            </div>
        </div>
    );
}
