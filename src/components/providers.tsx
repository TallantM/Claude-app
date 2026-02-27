"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";

/**
 * Wraps the app in the global providers needed by every page:
 *
 * - **SessionProvider** — NextAuth session context for auth state
 * - **ThemeProvider** — dark/light/system theme via `next-themes` (class strategy)
 * - **TooltipProvider** — shared Radix tooltip context with zero delay so tooltips feel instant
 *
 * Note: devIndicators is disabled in next.config.ts to prevent the Next.js dev
 * toolbar from injecting a stray role="alert" element into the light DOM, which
 * would conflict with E2E tests that locate app-level alerts via [role="alert"].
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <TooltipProvider delayDuration={0}>
          {children}
        </TooltipProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
