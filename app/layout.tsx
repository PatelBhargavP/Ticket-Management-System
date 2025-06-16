import type { Metadata } from "next";
import "./globals.css";
import { ThemeProviderWrapper } from "@/components/theme-provider-wrapper";
import React from "react";
import { Navbar } from "@/components/navbar";
import { SharedAppProvider } from "@/app/context/SharedAppContext";
import { getStatuses } from "./actions/getStatuses";
import { getPriorities } from "./actions/getPriorities";

export const metadata: Metadata = {
  title: "Ticket management system",
  description: "For managing internal projects",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html suppressHydrationWarning>
      <body>
        <ThemeProviderWrapper
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <SharedAppProvider getStatusesPromise={getStatuses()} getPrioritiesPromise={getPriorities()}>
            <Navbar />
            <div className="px-2 overflow-auto max-h-[calc(100vh-85px)]">
              {children}
            </div>
          </SharedAppProvider>
        </ThemeProviderWrapper>
      </body>
    </html>
  );
}
