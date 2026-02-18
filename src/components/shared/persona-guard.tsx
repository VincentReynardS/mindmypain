"use client";

/**
 * PersonaGuard - Client component that redirects to "/" if no persona is selected.
 *
 * Wrap patient-facing routes with this guard to ensure users always
 * select a persona before accessing the app.
 *
 * Uses atomic selector to prevent unnecessary re-renders.
 * Waits for Zustand hydration before making redirect decision to
 * prevent flash of empty content during SSR → client transition.
 *
 * @see architecture.md - Authentication & Security (Decision 2)
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/lib/stores/user-store";

export function PersonaGuard({ children }: { children: React.ReactNode }) {
  const isSelected = useUserStore((s) => s.isSelected);
  const router = useRouter();
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    // Wait for Zustand persist to finish rehydrating from sessionStorage
    const unsub = useUserStore.persist.onFinishHydration(() => {
      setHasHydrated(true);
    });

    // If already hydrated (e.g. navigating between client pages), set immediately
    if (useUserStore.persist.hasHydrated()) {
      setHasHydrated(true);
    }

    return unsub;
  }, []);

  useEffect(() => {
    if (hasHydrated && !isSelected) {
      router.replace("/");
    }
  }, [isSelected, hasHydrated, router]);

  // Show loading spinner while Zustand hydrates from sessionStorage
  if (!hasHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-calm-surface">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-calm-blue border-t-transparent" />
      </div>
    );
  }

  if (!isSelected) {
    return null;
  }

  return <>{children}</>;
}
