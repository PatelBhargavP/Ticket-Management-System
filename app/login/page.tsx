import React from 'react'
import SigniWithGoogle from '@components/sign-in-with-google'
import { providerMap } from '@/auth'
import { redirect } from 'next/navigation'
import { signIn } from 'next-auth/react';

export default function Login(props: {
  searchParams: { callbackUrl: string | undefined }
}) {
  return (
    <>
    <div className="flex flex-col gap-2">
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
    </div>
    </>
  )
}
