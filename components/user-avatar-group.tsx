"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { IAppUser } from "@/models/User";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";
import UserAvatar from "./user-avatar";

export function UserAvatarGroup({ users, maxVisible }: { users: IAppUser[], maxVisible?: number }) {
    if (!maxVisible) {
        maxVisible = 3;
    }
    const visibleUsers = users.slice(0, maxVisible);
    const remaining = users.length - maxVisible;

    return (
        <HoverCard>
            <HoverCardTrigger asChild>
                <div className="flex -space-x-3">
                    {visibleUsers.map((user, index) => (
                        <Avatar
                            key={index}
                            className="size-10 border-2 border-background z-10"
                            style={{ zIndex: maxVisible - index }}
                        >
                            <AvatarImage src={user.image} alt={user.fullname} />
                            <AvatarFallback>{
                                (user.firstname && user.firstname[0]) + (user.lastname && user.lastname[0])
                            }</AvatarFallback>
                        </Avatar>
                    ))}
                    {remaining > 0 && (
                        <div
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground border-2 border-background"
                            style={{ zIndex: 0 }}
                        >
                            +{remaining}
                        </div>
                    )}
                </div>
            </HoverCardTrigger>
            <HoverCardContent >
                {
                    users.map(user => <p key={user.userId}><UserAvatar key={user.userId} user={user}></UserAvatar></p>)
                }
            </HoverCardContent>
        </HoverCard>
    );
}
