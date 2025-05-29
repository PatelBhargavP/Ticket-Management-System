   
   'use client';
   import { signIn } from 'next-auth/react';

   export default function SigniWithGoogle() {
     return (
       <div>
         <button onClick={() => signIn('google', { callbackUrl: '/'})}>Sign in with Google</button>
       </div>
     );
   }