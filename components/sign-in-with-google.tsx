'use client';
import { signIn } from 'next-auth/react';
import { Button } from './ui/button';

export default function SigniWithGoogle({callbackUrl} : { callbackUrl: string }) {
  return (
    <Button className='mb-3' onClick={() => signIn('google', { callbackUrl })}>Sign in with Google</Button>
  );
}