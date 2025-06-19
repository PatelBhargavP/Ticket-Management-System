'use client';
import { signIn } from 'next-auth/react';
import { Button } from './ui/button';
import { Globe } from 'lucide-react';
import { Avatar } from '@radix-ui/react-avatar';
import { AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function SigniWithGoogle({callbackUrl} : { callbackUrl: string }) {
  return (
            <Button
              variant="outline"
              className="w-60 flex gap-2"
              onClick={() => signIn('google', { callbackUrl })}
            >
              <Avatar className={"size-6 mr-2"}>
                <AvatarImage src='/avatars/google.svg' alt="google" referrerPolicy={'no-referrer'} />
                <AvatarFallback>G</AvatarFallback>
              </Avatar>
              Sign in with Google
            </Button>
  );
}