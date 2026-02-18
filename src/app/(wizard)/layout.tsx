/**
 * Wizard Layout - Desktop-First Researcher Dashboard Shell
 * This layout wraps all researcher-facing routes (dashboard, live-session).
 * Desktop-optimized with sidebar navigation.
 */
export default function WizardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <main className="p-6">{children}</main>
    </div>
  );
}
