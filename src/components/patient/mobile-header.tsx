"use client";

/**
 * MobileHeader - Branded header for patient mobile-first layout.
 *
 * Displays "MINDmyPAIN" branding and the selected persona's name/avatar.
 * Uses atomic Zustand selectors to read persona state.
 * Styled with "Calm" tokens for accessible, soothing aesthetic.
 *
 * @see architecture.md - Frontend Architecture
 * @see ux-design-specification.md - "Calm Confidence" principle
 */

import { useUserStore } from "@/lib/stores/user-store";
import { User } from "lucide-react";

export function MobileHeader() {
  const personaName = useUserStore((s) => s.personaName);

  return (
    <header
      className="sticky top-0 z-30 border-b border-border/60 bg-calm-surface-raised/95 backdrop-blur-sm"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
        {/* Branding -- uses span, not h1, to avoid duplicate headings with page content */}
        <span className="text-lg font-bold tracking-tight text-calm-text">
          MINDmyPAIN
        </span>

        {/* Persona indicator (decorative, non-interactive) */}
        {personaName && (
          <div className="flex items-center gap-2" aria-label={`Logged in as ${personaName}`}>
            <span className="text-sm font-medium text-calm-text-muted">
              {personaName}
            </span>
            <div
              className="flex h-11 w-11 items-center justify-center rounded-full bg-calm-blue-soft text-calm-blue"
              aria-hidden="true"
            >
              <User className="h-5 w-5" />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
