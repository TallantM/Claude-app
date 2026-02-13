"use client";

import { useSidebarStore } from "@/store";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { cn } from "@/lib/utils";

/**
 * Top-level shell for authenticated pages: sidebar + header + scrollable content area.
 * The main content shifts left/right when the sidebar is toggled.
 */
export function AppLayout({ children }: { children: React.ReactNode }) {
  const { isOpen } = useSidebarStore();

  return (
    <div className="min-h-screen bg-background">
      {/* ─── Sidebar ─── */}
      <Sidebar />

      {/* ─── Main Column (header + page content) ─── */}
      <div
        className={cn(
          "flex flex-col transition-all duration-300",
          isOpen ? "md:pl-64" : "md:pl-16",
          "pl-0" // Mobile: sidebar overlays instead of pushing content
        )}
      >
        <Header />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
