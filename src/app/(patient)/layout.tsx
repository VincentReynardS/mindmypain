/**
 * Patient Layout - Mobile-First Container & Navigation
 * This layout wraps all patient-facing routes (journal, scribe).
 * Mobile-optimized with bottom nav and "Calm" aesthetic.
 */
export default function PatientLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-calm-surface">
      <main className="mx-auto max-w-lg px-4 pb-20 pt-6">{children}</main>
    </div>
  );
}
