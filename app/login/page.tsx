import React from 'react'
import SigniWithGoogle from '@components/sign-in-with-google'
import AppName from '@/components/app-name';

export default async function Login({ searchParams }: { searchParams: Promise<{ callbackUrl: string }> }) {
  const { callbackUrl } = await searchParams;
  return (
    <div className="min-h-screen md:grid md:grid-cols-2 max-md:flex max-md:flex-col">
      {/* Left Side - Branding */}
      <div className="bg-muted flex flex-col justify-center items-center text-center max-md:max-h-60 max-md:py-6">
        <AppName />
        <p className="text-lg mt-4 text-muted-foreground max-w-md">
          Simplify projects. Track tickets. Stay on board.
        </p>
      </div>

      {/* Right Side - Sign In */}
      <div className="flex flex-col justify-center items-center max-md:flex-1 space-y-6">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-semibold text-center">Sign in to continue</h2>
        </div>
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
      </div>
    </div>
  )
}


export async function generateMetadata() {

  return {
    title: `Login - TicketFlow`,
    description: `Login using your infocusp email.`,
  };
}
