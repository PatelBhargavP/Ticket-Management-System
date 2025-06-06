import { getServerSession } from 'next-auth';
import Link from 'next/link';
import SignOut from './sign-out';
import { Separator } from "@/components/ui/separator"
import { Button } from './ui/button';
import { headers } from 'next/headers';
import { ProfileDropdown } from './profile-dropdown';
import { authOptions } from '@/auth';

export async function Navbar() {
    const session = await getServerSession(authOptions);
    const headerList = await headers();
    const pathname = headerList.get("x-current-path");
    const isLoginPage = pathname?.includes("/login")
    let buttons = <></>;
    if (session) {
        buttons = <><ProfileDropdown name={session.user.name || undefined} email={session.user.email} avatarUrl={session.user.image}></ProfileDropdown></>
    }
    return (
        <>
            <div className="p-2 flex justify-between items-center">
                <div>
                    <h3 className='text-xl'>Ticket management system</h3>
                </div>
                <div className='inline-flex content-center'>
                    {buttons}
                </div>
            </div>
            <Separator className="mb-4" />
        </>
    );
}