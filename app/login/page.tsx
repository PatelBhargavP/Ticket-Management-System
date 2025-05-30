import React from 'react'
import SigniWithGoogle from '@components/sign-in-with-google'
import { ModeToggle } from '@/components/mode-toggle'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function Login(props: {
  searchParams: { callbackUrl: string | undefined }
}) {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className='flex flex-col justify-around'>
      {/* <form method='post' action='/api/auth/callback/credentials'>
        <label htmlFor="email">
          Email
          <input name="email" id="email" />
        </label>
        <label htmlFor="password">
          Password
          <input name="password" id="password" />
        </label>
        <input type="submit" value="Sign In" />
      </form> */}
      <SigniWithGoogle></SigniWithGoogle>
      <Button>
        <Link href="/">Back to home</Link>
      </Button>
      </div>
    </div>
  )
}
