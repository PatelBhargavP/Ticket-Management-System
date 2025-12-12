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
import { Monitor, Moon, Sun, Key } from 'lucide-react'
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
    const { theme, setTheme } = useTheme();

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
                    <span className='truncate max-sm:max-w-[120px]' title={name}>{name}</span>
                </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 mt-2 mr-2">
                {/* <DropdownMenuItem onClick={onProfile ?? (() => router.push('/profile'))}>
                    Profile
                </DropdownMenuItem> */}

                <DropdownMenuGroup>
                    {mounted &&
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger className='cursor-pointer' hideChevron={true}>
                                Set theme
                                <DropdownMenuShortcut>
                                    <Button variant="ghost" size="icon">{
                                        theme === 'system'
                                        ?
                                            <Monitor className="h-[1.2rem] w-[1.2rem]" />
                                        :
                                        <>
                                            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                                            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                                        </>}
                                        <span className="sr-only">Toggle theme</span>
                                    </Button>
                                </DropdownMenuShortcut>
                            </DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                                <DropdownMenuSubContent >
                                    <DropdownMenuItem className='cursor-pointer flex justify-between' onClick={() => setTheme("light")}>
                                        Light
                                        <Sun className="h-[1.2rem] w-[1.2rem]" />
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className='cursor-pointer flex justify-between' onClick={() => setTheme("dark")}>
                                        Dark
                                        <Moon className="h-[1.2rem] w-[1.2rem]" />
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className='cursor-pointer flex justify-between' onClick={() => setTheme("system")}>
                                        System
                                        <Monitor className="h-[1.2rem] w-[1.2rem]" />
                                    </DropdownMenuItem>
                                </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                        </DropdownMenuSub>
                    }
                </DropdownMenuGroup>

                <DropdownMenuItem
                    onClick={() => router.push('/api-keys')}
                    className="cursor-pointer"
                >
                    <Key className="mr-2 h-4 w-4" />
                    API Keys
                </DropdownMenuItem>

                <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="cursor-pointer text-red-600 focus:text-red-600"
                >
                    Sign out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
