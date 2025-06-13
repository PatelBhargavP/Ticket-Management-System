'use client'
import { IAppUser } from "@/models/User";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

interface IUserAvatarProps {
    user: IAppUser;
    hideImage?: boolean;
    className?: string;
    avatarClass?: string;
    textClass?: string;
}

export default function UserAvatar({
    user,
    hideImage,
    className,
    avatarClass,
    textClass
}: IUserAvatarProps) {
    return (
        <span className={'inline-flex wm justify-start items-center ' + (className || '')}>
            {!hideImage
                && <Avatar className={"size-10 mr-2 " + (avatarClass || '')}>
                    <AvatarImage src={user.image} alt={user.fullname} referrerPolicy={'no-referrer'} />
                    <AvatarFallback>{
                        (user.firstname && user.firstname[0]) + (user.lastname && user.lastname[0])
                    }</AvatarFallback>
                </Avatar>
            }
            <span className={"max-w-[200px] break- truncate " +(textClass || '')} title={user.fullname}>{user.fullname}</span>
        </span>
    )
}