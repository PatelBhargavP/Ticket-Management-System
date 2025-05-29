import { getServerSession } from "next-auth";
import SignOut from "./components/sign-out";
import Link from "next/link";

export default async function Home() {
  const session = await getServerSession();
  if(session) {
    
  }
  
  return (
  <main>
    <h1>Hello wordl</h1>
    <p>
      {JSON.stringify(session) }
    </p>
    {(session) ? <SignOut></SignOut> : <Link href="/login">Login</Link>}
  </main>

  );
}
