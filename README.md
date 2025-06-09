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
│ │ ├── [project_identifier]//
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

### 3. Set up .env.local

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

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
