import { redirect } from "next/navigation";

/**
 * Patient Home - Redirects to journal view
 * The journal is the primary patient experience.
 */
export default function PatientHome() {
  redirect("/journal");
}
