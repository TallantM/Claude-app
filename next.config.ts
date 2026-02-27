// Next.js configuration — enables strict mode, allows OAuth avatar domains,
// and sets baseline security headers on every response.

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Disable the dev toolbar so it doesn't inject an empty role="alert" element
  // into every page — that empty element causes strict-mode violations in E2E tests
  // that use page.locator('[role="alert"]') expecting exactly one match.
  devIndicators: false,
  images: {
    // Allow avatar images from GitHub and Google OAuth providers
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-XSS-Protection", value: "1; mode=block" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      ],
    },
  ],
};

export default nextConfig;
