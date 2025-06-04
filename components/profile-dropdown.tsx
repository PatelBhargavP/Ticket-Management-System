'use client'

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuPortal,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Button } from './ui/button'
import { Moon, Sun } from 'lucide-react'
import { signOut } from 'next-auth/react'

interface ProfileDropdownProps {
    name?: string
    email: string
    avatarUrl?: string
}

export function ProfileDropdown({
    name,
    email,
    avatarUrl
}: ProfileDropdownProps) {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const { setTheme } = useTheme();

    useEffect(() => {
        console.log(name, avatarUrl, email)
        setMounted(true);
    }, []);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <span className='hover:bg-accent hover:text-accent-foreground inline-flex justify-between items-center p-2 rounded-md'>
                    <Avatar className="mr-0.5">
                        <AvatarImage src={avatarUrl} alt={name} referrerPolicy={'no-referrer'} />
                        <AvatarFallback>{name?.split(" ").map(segment => (segment && segment[0])).join('')}</AvatarFallback>
                    </Avatar>
                    {name}
                </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 mt-2 mr-2">
                {/* <DropdownMenuItem onClick={onProfile ?? (() => router.push('/profile'))}>
                    Profile
                </DropdownMenuItem> */}

                <DropdownMenuGroup>
                    {mounted &&
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger hideChevron={true}>
                                Set theme
                                <DropdownMenuShortcut>
                                    <Button variant="ghost" size="icon">
                                        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                                        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                                        <span className="sr-only">Toggle theme</span>
                                    </Button>
                                </DropdownMenuShortcut>
                            </DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                                <DropdownMenuSubContent >
                                    <DropdownMenuItem onClick={() => setTheme("light")}>
                                        Light
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setTheme("dark")}>
                                        Dark
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setTheme("system")}>
                                        System
                                    </DropdownMenuItem>
                                </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                        </DropdownMenuSub>
                    }
                </DropdownMenuGroup>

                <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="text-red-600 focus:text-red-600"
                >
                    Sign out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
