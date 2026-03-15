import { redirect } from "next/navigation";

/**
 * Patient root - redirects to /home.
 */
export default function PatientHome() {
  redirect("/home");
}
