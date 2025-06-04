import type { Metadata } from "next";
import "./globals.css";
import { ThemeProviderWrapper } from "@/components/theme-provider-wrapper";
import React from "react";
import { Navbar } from "@/components/navbar";

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
        <Navbar />
          <div className="px-2">
            {children}
          </div>
        </ThemeProviderWrapper>
      </body>
    </html>
  );
}
