// Route protection — redirects unauthenticated users to /login.
// Uses NextAuth's built-in withAuth middleware; no custom logic needed.

export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/projects/:path*",
    "/issues/:path*",
    "/settings/:path*",
  ],
};
