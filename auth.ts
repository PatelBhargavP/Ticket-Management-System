import "next-auth";
import "next-auth/jwt";
import NextAuth, { AuthOptions, DefaultSession } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { Provider } from 'next-auth/providers';
import { IAppUser } from './models/User';
import { getUserDetails } from "./app/actions/getUserDetails";
import { createUser } from "./app/actions/createUser";
import { upsertUser } from "./app/actions/updateUser";
import { ensureMetadata } from "./lib/metadata";


const providers: Provider[] = [
  // Credentials({
  //   credentials: {
  //     email: { label: "Email", type: "text" },
  //     password: { label: "Password", type: "password" }
  //   },
  //   authorize(c) {
  //     console.log('credentials: ', c)
  //     if (c?.password !== "password") return null
  //     return {
  //       id: "test",
  //       name: "Test User",
  //       email: "test@example.com",
  //     }
  //   },
  // }),
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

export const authOptions: AuthOptions = {
  providers,
  pages: {
    signIn: "/login",
  },
  session: {
    maxAge: 15 * 60, // 10 mins,
    strategy: 'jwt'
  },
  callbacks: {
    // async redirect(params: { url: string }) {
    //   const { url } = params

    //   // url is just a path, e.g.: /videos/pets
    //   if (!url.startsWith('http')) return url

    //   // If we have a callback use only its relative path
    //   const callbackUrl = new URL(url).searchParams.get('callbackUrl')
    //   if (!callbackUrl) return url
    //   console.log('callback URL: ', callbackUrl, url)
    //   return new URL(callbackUrl as string).pathname;
    // },
    async jwt({ token, user }) {
      // console.log('JWT Call back:', user)
      if (user) {
        // Add custom properties from the user object to the token
        token.userId = user.id;
        // ... other custom properties ...
      }
      return token;
    },
    async signIn({ user, account, profile }) {
      // we need to save user here

      let userDetails = await getUserDetails({email: user.email });
      if (!userDetails) {
        userDetails = await createUser(user);
      } else if(user?.image && userDetails.image !== user.image) {
        await upsertUser({userId: userDetails.userId, image: user?.image})
      }
      if (userDetails) {
        user.id = userDetails?.userId;
      }
      // console.log('user post signin: ', user, ", and in DB: ", userDetails)
      return !!userDetails;
    },
    async session({ session, token, user }) {
      if (token?.userId) {
        session.userId = token.userId;
        session.user.userId = token.userId;
      };
      // console.log("Session call back, ", 'session: ', session)

      return session;
    },
  }
};
export const handlers = NextAuth(authOptions);

declare module "next-auth" {
  interface User extends IAppUser {
    id: string
    // ... other custom properties ...
  }
  interface AdapterUser extends IAppUser {
    // id: ObjectId
    // ... other custom properties ...
  }

  interface Session {
    userId: string;
    user: IAppUser & DefaultSession["user"];
  }

  interface SignIn {
    user: IAppUser & DefaultSession["user"];
  }
}


declare module "next-auth/jwt" {
  interface JWT {
    userId: string
    // ... other custom properties ...
  }
}