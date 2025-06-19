import { getServerSession } from 'next-auth';
import { Separator } from "@/components/ui/separator"
import { headers } from 'next/headers';
import { ProfileDropdown } from './profile-dropdown';
import { authOptions } from '@/auth';
import { AvatarImage } from './ui/avatar';
import AppName from './app-name';

export async function Navbar() {
    const session = await getServerSession(authOptions);
    const headerList = await headers();
    const pathname = headerList.get("x-current-path");
    const isLoginPage = pathname?.includes("/login")
    let buttons = <></>;
    if (session) {
        buttons = <><ProfileDropdown name={session.user.name || undefined} email={session.user.email} avatarUrl={session.user.image}></ProfileDropdown></>
    } else {
        return <></>
    }
    return (
        <>
            <div className="px-2 flex justify-between items-center">
                <div className='max-sm:max-w-[150px] min-h-[64px] flex items-center'>
                    <AppName />
                </div>
                <div className='inline-flex content-center'>
                    {buttons}
                </div>
            </div>
            <Separator className="mb-4" />
        </>
    );
}