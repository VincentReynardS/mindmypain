"use client";

/**
 * Patient Layout - Mobile-First Container & Navigation with Persona Guard.
 * This layout wraps all patient-facing routes (journal, scribe).
 * Mobile-optimized with sticky header and "Calm" aesthetic.
 * PersonaGuard redirects to "/" if no persona is selected.
 *
 * @see architecture.md - Route Groups: (patient) for mobile-first view
 * @see ux-design-specification.md - "Calm Confidence" principle
 */

import { PersonaGuard } from "@/components/shared/persona-guard";
import { MobileHeader } from "@/components/patient/mobile-header";

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PersonaGuard>
      <div className="min-h-screen bg-calm-surface">
        <MobileHeader />
        <main className="mx-auto max-w-lg px-4 pb-20 pt-6">{children}</main>
      </div>
    </PersonaGuard>
  );
}
