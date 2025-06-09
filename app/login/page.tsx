import React from 'react'
import SigniWithGoogle from '@components/sign-in-with-google'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function Login({ searchParams }: { searchParams: Promise<{ callbackUrl: string }>} ) {
  const { callbackUrl } = await searchParams;
  return (
    <div className="flex items-center justify-center">
      <div className='flex flex-col justify-around'>
      {/* <form method='post' action='/api/auth/callback/credentials'>
        <label htmlFor="email">
          Email
          <input name="email" id="email" />w
        </label>
        <label htmlFor="password">
          Password
          <input name="password" id="password" />
        </label>
        <input type="submit" value="Sign In" />
      </form> */}
      <SigniWithGoogle callbackUrl={callbackUrl ? callbackUrl : '/'}></SigniWithGoogle>
      {/* <Button>
        <Link href="/">Back to home</Link>
      </Button> */}
      </div>
    </div>
  )
}


export async function generateMetadata() {

  return {
    title: `Login - Ticket Menagement System`,
    description: `Login using your infocusp email.`,
  };
}
