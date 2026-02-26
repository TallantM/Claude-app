"use client";

import { useLayoutEffect } from "react";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";

/**
 * Next.js 15 App Router injects the route announcer inside a **Shadow DOM**:
 *
 *   <next-route-announcer style="position:absolute">
 *     #shadow-root
 *       <div id="__next-route-announcer__" role="alert" aria-live="assertive">
 *
 * Because the element lives in shadow DOM, document.getElementById and a
 * MutationObserver with subtree:true cannot reach it.  Next.js also sets the
 * role via the IDL property (el.role = "alert"), NOT via setAttribute, so an
 * Element.prototype.setAttribute override is equally ineffective.
 *
 * Fix: override the `role` IDL setter on Element.prototype for the lifetime
 * of the page.  In getAnnouncerNode() the element's id is assigned BEFORE its
 * role, so when the setter fires this.id is already "__next-route-announcer__"
 * and we can silently swallow the call.  The element retains aria-live so
 * screen readers still receive route announcements via the live region.
 */
function RouteAnnouncerRoleFix() {
  useLayoutEffect(() => {
    // Find the prototype that owns the `role` accessor (Element or HTMLElement).
    let targetProto: typeof Element.prototype | null = null;
    let roleDescriptor: PropertyDescriptor | undefined;
    for (const proto of [Element.prototype, HTMLElement.prototype]) {
      roleDescriptor = Object.getOwnPropertyDescriptor(proto, "role");
      if (roleDescriptor?.set) {
        targetProto = proto;
        break;
      }
    }
    if (!targetProto || !roleDescriptor?.set) return;

    const origSetter = roleDescriptor.set;
    Object.defineProperty(targetProto, "role", {
      ...roleDescriptor,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      set(this: Element, value: any) {
        // Block role="alert" (or any role) on the route announcer element.
        // The element keeps aria-live="assertive" for screen-reader announcements.
        if (this.id === "__next-route-announcer__") return;
        origSetter.call(this, value);
      },
    });

    return () => {
      // Restore the original descriptor on unmount.
      if (targetProto && roleDescriptor) {
        Object.defineProperty(targetProto, "role", roleDescriptor);
      }
    };
  }, []);

  return null;
}

/**
 * Wraps the app in the global providers needed by every page:
 *
 * - **SessionProvider** — NextAuth session context for auth state
 * - **ThemeProvider** — dark/light/system theme via `next-themes` (class strategy)
 * - **TooltipProvider** — shared Radix tooltip context with zero delay so tooltips feel instant
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <TooltipProvider delayDuration={0}>
          <RouteAnnouncerRoleFix />
          {children}
        </TooltipProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
