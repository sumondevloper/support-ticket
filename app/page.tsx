import { redirect } from "next/navigation";

export default function HomePage() {
  // Redirect to /tickets because the Tickets List is the primary page of the application.
  // The homepage itself has no meaningful content, so redirecting ensures users immediately
  // land on the functional dashboard where they can view, search, and manage tickets.
  redirect("/tickets");
}
