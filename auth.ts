import NextAuth, { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { Provider } from 'next-auth/providers';

 
const providers: Provider[] = [
  Credentials({
    credentials: {
      email: { label: "Email", type: "text" },
      password: { label: "Password", type: "password" }
    },
    authorize(c) {
      console.log('credentials: ', c)
      if (c?.password !== "password") return null
      return {
        id: "test",
        name: "Test User",
        email: "test@example.com",
      }
    },
  }),
  GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  }),
]
 
export const providerMap = providers
  .map((provider) => {
      return { id: provider.id, name: provider.name }
    
  })
  .filter((provider) => provider.id !== "credentials");

const authOptions: AuthOptions = {
  providers,
  pages: {
    signIn: "/login",
  },
  session: {
    maxAge: 10*60, // 10 mins,
    strategy: 'jwt' 
  },
  callbacks: {
    async signIn({account, profile}) {
        // we need to save user here
        // console.log('account: ', account, 'profile : ', profile )
        return true;
    },
    async session({ session, token }) {
      // if (token?.accessToken) session.user. = token.accessToken
        console.log('session: ', session, 'token : ', token )

      return session
    },
  }
};
export const handlers = NextAuth(authOptions);
