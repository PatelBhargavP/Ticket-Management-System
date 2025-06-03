import { authOptions } from "@/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login')
  } else [
    redirect('/projects')
  ]

  return (
    <main>
      <h1>Welcome to the app</h1>
      <p>Please log in to continue.</p>
    </main>
  );
}
