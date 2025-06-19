"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils"; // Optional if using ShadCN's cn

export default function ContentWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const heightClass = !pathname.includes("/login")
    ? "max-h-[calc(100vh-85px)]"
    : "min-h-screen";

  return <div className={cn("px-2 overflow-auto ", heightClass)}>{children}</div>;
}
