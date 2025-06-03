"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProviderWrapper({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props} defaultTheme={props.defaultTheme || "system"}>
    {children}
  </NextThemesProvider>
}
