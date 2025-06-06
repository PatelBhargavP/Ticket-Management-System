'use client'
import { IAppUser } from "@/models/User";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export default function UserAvatar({
    user,
    className
}: {
    user: IAppUser;
    className?: string;
}) {
    return (
        <span className={(className || '') + 'inline-flex justify-between items-center'}>
            <Avatar className="size-10 mr-2">
                <AvatarImage src={user.image} alt={user.fullname} referrerPolicy={'no-referrer'} />
                <AvatarFallback>{
                    (user.firstname && user.firstname[0]) + (user.lastname && user.lastname[0])
                }</AvatarFallback>
            </Avatar>
            {user.fullname}
        </span>
    )
}