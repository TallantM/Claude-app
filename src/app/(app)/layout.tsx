"use client";

import { AppLayout } from "@/components/layout/app-layout";

/** Wraps all authenticated (app) routes in the sidebar + header shell. */
export default function Layout({ children }: { children: React.ReactNode }) {
  return <AppLayout>{children}</AppLayout>;
}
