import { getServerSession } from 'next-auth';
import Link from 'next/link';
import SignOut from './sign-out';
import { Separator } from "@/components/ui/separator"
import { Button } from './ui/button';
import { headers } from 'next/headers';

export async function Navbar() {
    const session = await getServerSession();
    const headerList = await headers();
    const pathname = headerList.get("x-current-path");
    const isLoginPage = pathname?.includes("/login")
    let buttons = <Button><Link href="/login">Login</Link></Button>;
    if (session) {
        buttons = <><SignOut></SignOut></>
    }
    if (!session && isLoginPage) {
        buttons = <a></a>;
    }
    return (
        <>
            <div className="p-4 flex justify-between">
                <div>
                    <h3 className='text-xl'>{session?.user?.name ? `Welcome ${session?.user?.name} to Ticket management system` : "Ticket management system"}</h3>
                </div>
                <div className='inline-flex content-center'>
                    {buttons}
                </div>
            </div>
            <Separator className="mb-4" />
        </>
    );
}