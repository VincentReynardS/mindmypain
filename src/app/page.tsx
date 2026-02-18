import { PersonaSelector } from "@/components/patient/persona-selector";

/**
 * Root Home - Persona selection landing page.
 * Users select Sarah or Michael to enter the workshop scenario.
 * No auth required (FR_AP1).
 */
export default function Home() {
  return <PersonaSelector />;
}
