"use client";

/**
 * Patient Layout - Mobile-First Container & Navigation with Persona Guard.
 * This layout wraps all patient-facing routes (journal, scribe).
 * Mobile-optimized with bottom nav and "Calm" aesthetic.
 * PersonaGuard redirects to "/" if no persona is selected.
 */

import { PersonaGuard } from "@/components/shared/persona-guard";

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PersonaGuard>
      <div className="min-h-screen bg-calm-surface">
        <main className="mx-auto max-w-lg px-4 pb-20 pt-6">{children}</main>
      </div>
    </PersonaGuard>
  );
}
