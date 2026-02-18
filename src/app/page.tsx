import { redirect } from "next/navigation";

/**
 * Root Home - Redirects to the patient journal view.
 * The journal is the primary patient experience.
 */
export default function Home() {
  redirect("/journal");
}
