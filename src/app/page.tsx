// Landing route — immediately sends the user to the dashboard.
// Auth checks happen in middleware, so unauthenticated users get bounced to /login.

import { redirect } from "next/navigation";

export default function Home() {
  redirect("/dashboard");
}
