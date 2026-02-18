/**
 * Live Session Page - Wizard Intervention Console
 * Will be implemented in Story 3.2 & 3.3.
 */
export default function LiveSessionPage({
  params: _params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div>
      <h1 className="text-2xl font-semibold">Live Session</h1>
      <p className="mt-2 text-muted-foreground">
        Wizard intervention console will appear here.
      </p>
    </div>
  );
}
