// Root layout — sets up HTML document, global CSS, and context providers.

import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "SDLC Hub - Software Development Lifecycle Management",
  description: "A centralized platform for managing the entire software development lifecycle",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // suppressHydrationWarning avoids mismatch from next-themes injecting the class attr
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
