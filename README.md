This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

# 🎫 Ticket Management System

A full-featured ticket management system built using **Next.js (App Router)**, **TypeScript**, **MongoDB** with **Mongoose**, and **NextAuth** for authentication. The application supports project-based ticket organization with modern UI components powered by **shadcn/ui** and **Tailwind CSS**.

## 📁 Project Structure

/  
├── app/  
│ ├── layout.tsx  
│ ├── not-found.tsx  
│ ├── context/  
│ │ ├── ProjectTicketContext.tsx // for sharing data among UI components in client side at project level  
│ │ ├── ShareAppContext.tsx // for sharing data among UI components in client side at app level like statuses priorities etc  
│ ├── login/  
│ │ ├── page.tsx  
│ ├── projects/  
│ │ ├── page.tsx  
│ │ ├── [identifier]/  
│ │ │ ├── layout.tsx  
│ │ │ ├── list/  
│ │ │ │ ├── page.tsx  
│ │ │ └── board/  
│ │ │ │ ├── page.tsx  
├── lib/ # temp data, utility function, DB connection utils  
│ ├── utils.ts # Helper functions  
├── models/ # Mongoose models  
├── middleware.ts #For auth check and route protection  
├── components/ # UI components  
└── ...

---

## 🚀 Features

- 🔐 Google Authentication via NextAuth
- 🧠 TypeScript for strict type safety
- 🧱 MongoDB + Mongoose for flexible schema-based storage
- 🎨 Beautiful UI with Tailwind CSS + shadcn/ui components
- 📦 NPM-based dependency management
- 📂 Project-based ticket organization with list and board views

---

## 🧪 Technologies

| Tech             | Description                            |
|------------------|----------------------------------------|
| Next.js (Pages)  | Core React framework with routing      |
| MongoDB          | NoSQL document store                   |
| Mongoose         | ODM for MongoDB                        |
| NextAuth.js      | Authentication (Google)                |
| TypeScript       | Static typing                          |
| Tailwind CSS     | Utility-first CSS framework            |
| shadcn/ui        | Accessible, headless UI components     |

---

## 🧰 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/PatelBhargavP/Ticket-Management-System.git
cd Ticket-Management-System
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up `.env.local`

```bash
MONGODB_URI=<your-mongodb-uri>
NEXTAUTH_SECRET=<your-secret>
GOOGLE_CLIENT_ID=<your-client-id>
GOOGLE_CLIENT_SECRET=<your-client-secret>
```

### 4. Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `...files`. The page auto-updates as you edit the file.

## ✅ Pages & Routes

- /login - Login via Google
- /projects - List all projects
- /projects/[`project_identifier`]/list - List view of project tickets
- /projects/[`project_identifier`]/board - Kanban board view

## ⚠️ Things to Consider in Next.js

### 🧠 1. Server vs Client Context & Cache Segregation

- The general consensus is we use client components where we need to capture browser events and serve components for performing async operations like data fetch.
- Never pass non-serializable values (e.g., DB models, class instances) from server to client.
- Context providers are a good approach to share data in client components eliminating the need to pass down everything by props. Ref:[Context providers](https://nextjs.org/docs/app/getting-started/server-and-client-components#context-providers)
- Use SWR or React Query on the client side for data fetching.
- Use Next.js’ server actions (or API routes) for cache-safe, isolated server logic.
- Define and tag caches clearly (revalidateTag, cache, etc.).
- To cache server data by tag with some unique identifier, you can parameterize the `unstable_cache` function as below. So the project details are cached using its unique identifier.

```typescript
//lib/project-by-identifier.ts
import { getProjectDetails } from "@/app/actions/getprojectDetails";
import { unstable_cache } from "next/cache";

export const projectByIdentifierCache = (uniqueIdentifier: string) => unstable_cache(
    async () => {
        return getProjectDetails({ identifier: uniqueIdentifier });
    },
    [`projectIdentifier:${uniqueIdentifier}`],
    { tags: ['projectByIdentifier', `projectIdentifier:${uniqueIdentifier}`] }
);
```

### 🔧 2. Creating Server Functions

- Organize server functions in /lib/actions/ or similar.
- Keep each server function in its own file with `"use server"` directive.
- Always wrap server-side logic in try/catch.
- Use server-only utility when applicable (e.g., in app/ dir or with edge/runtime).

```typescript
// lib/actions/project.ts
'use server'

import { Project } from '@/lib/project';

export async function getProjectBySlug(slug: string) {
  return await Project.findOne({ slug });
}
```

### 🔁 3. Data Fetching Strategies

- We prefer to use `use` with `Suspense` if we have a segment of the page that relies on async data. This helps improve first paint time.
- Use `use` or `useEffect` on client-side fetching only if SSR is not required
- For mutation-based operations (e.g., creating/updating tickets), prefer server actions or if we need to expose the logic to other microservices API routes are "recommended".
- For mutation based operations use `revalidatePath` and `revalidateTag` to invalidate server cache, and in the client component you can use `router.refresh()` for client rerender. But we might need to handle nested client components refresh independently during render of parent component.

### 🔒 4. Authentication & Session Handling

- Use getSession or useSession from next-auth/react.
- Use middleware to check for the authentication for pages configured in `config` object.
- We are using `getServerSession` with `authOptions` to get access to user details in server components or functions.

### 💅 5. UI Responsiveness and Accessibility

- Use Tailwind’s utility classes for responsiveness.
- Prefer shadcn/ui components for accessibility-compliant UI patterns (dialogs, modals, lists, etc.).

## 📦 Dependencies

```json
{
  "next": "15.x",
  "mongoose": "^8.x",
  "next-auth": "^4.x",
  "tailwindcss": "^3.x",
  "shadcn/ui": "latest",
  "typescript": "^5.x"
}
```


## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

