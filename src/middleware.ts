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
    "/pipelines/:path*",
    "/repos/:path*",
    "/team/:path*",
    "/notifications/:path*",
    "/reports/:path*",
  ],
};
