import { getServerSession } from 'next-auth';
import Link from 'next/link';
import SignOut from './sign-out';
import { ModeToggle } from './mode-toggle';
import { Separator } from "@/components/ui/separator"
import { usePathname } from 'next/navigation';
import { Button } from './ui/button';

export async function Navbar() {
    const session = await getServerSession();
    const pathname = '';
    return (
        <>
            <div className="p-4 flex justify-between">
                <div>
                    <h3 className='text-xl'>{session?.user?.name ? `Welcome ${session?.user?.name} to Ticket management system` : "Ticket management system"}</h3>
                </div>
                <div className='inline-flex content-center'>
                    {(session) ? <SignOut></SignOut> : !pathname?.includes('login') ? <Button><Link href="/login">Login</Link></Button> : ''}
                    <ModeToggle></ModeToggle>
                </div>
            </div>
            <Separator className="mb-4" />
        </>
    );
}