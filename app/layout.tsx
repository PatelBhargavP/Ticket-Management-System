import type { Metadata } from "next";
import "./globals.css";
import { ThemeProviderWrapper } from "@/components/theme-provider-wrapper";
import React from "react";
import { Navbar } from "@/components/navbar";
import { SharedAppProvider } from "@/app/context/SharedAppContext";
import { getStatuses } from "./actions/getStatuses";
import { getPriorities } from "./actions/getPriorities";
import ContentWrapper from "@/components/content-wrapper";

export const metadata: Metadata = {
  title: "TicketFlow",
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
            <ContentWrapper>
              {children}
            </ContentWrapper>
          </SharedAppProvider>
        </ThemeProviderWrapper>
      </body>
    </html>
  );
}
