import type { Metadata } from "next";
import "./globals.css";
import { ThemeProviderWrapper } from "@/components/theme-provider-wrapper";
import React from "react";
import { Navbar } from "@/components/navbar";
import { ModeToggle } from "@/components/mode-toggle";

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
        <Navbar />
        <ThemeProviderWrapper
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <div className="fixed bottom-4 right-4 z-50">
            <ModeToggle></ModeToggle>
          </div>
        </ThemeProviderWrapper>
      </body>
    </html>
  );
}
