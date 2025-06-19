import { Avatar, AvatarImage } from '@radix-ui/react-avatar'
import React from 'react'

export default function AppName() {
    return (
        <h1 className="text-4xl font-bold flex justify-between items-center">
            <Avatar><AvatarImage className='size-11 mr-1 rounded-2xl' src="/avatars/TF.jpg" alt="TicketFlow Icon" /></Avatar>
            TicketFlow
        </h1>
    )
}
