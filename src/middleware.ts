// Route protection — redirects unauthenticated users to /login.
// Must live in src/ because the project uses the src/ directory layout.
// withAuth explicitly sets the sign-in page so we land on /login, not
// the default NextAuth /api/auth/signin route.

import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/projects/:path*",
    "/issues/:path*",
    "/settings/:path*",
  ],
};
