"use client";

/**
 * MobileHeader - Branded header for patient mobile-first layout.
 *
 * Displays "MINDmyPAIN" branding and the selected persona's name/avatar.
 * Clicking the avatar opens a dropdown with Archive and Sign Out options.
 *
 * @see architecture.md - Frontend Architecture
 * @see ux-design-specification.md - "Calm Confidence" principle
 */

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUserStore } from "@/lib/stores/user-store";
import { User, UserCog, Archive, LogOut } from "lucide-react";

export function MobileHeader() {
  const personaName = useUserStore((s) => s.personaName);
  const personaIconBg = useUserStore((s) => s.personaIconBg || "bg-calm-blue-soft");
  const personaIconText = useUserStore((s) => s.personaIconText || "text-calm-blue");
  const clearPersona = useUserStore((s) => s.clearPersona);
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  function handleSignOut() {
    clearPersona();
    router.push("/");
  }

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

        {/* Persona indicator with dropdown */}
        {personaName && (
          <div className="relative flex items-center gap-2" ref={dropdownRef}>
            <span className="text-sm font-medium text-calm-text-muted">
              {personaName}
            </span>
            <button
              type="button"
              onClick={() => setIsOpen((prev) => !prev)}
              className={`flex h-11 w-11 items-center justify-center rounded-full ${personaIconBg} ${personaIconText} transition-colors duration-300`}
              aria-expanded={isOpen}
              aria-haspopup="true"
              aria-label="User menu"
            >
              <User className="h-5 w-5" />
            </button>

            {/* Dropdown menu */}
            <div
              className={`absolute right-0 top-full mt-2 z-40 min-w-[160px] rounded-lg border border-calm-border bg-calm-surface-raised shadow-lg transition-all duration-300 ${
                isOpen
                  ? "opacity-100 translate-y-0 pointer-events-auto"
                  : "opacity-0 -translate-y-1 pointer-events-none"
              }`}
              role="menu"
            >
              <Link
                href="/profile/my-detail"
                className="flex items-center gap-3 px-4 py-3 text-sm text-calm-text hover:bg-calm-surface transition-colors duration-300 rounded-t-lg"
                style={{ minHeight: "44px" }}
                role="menuitem"
                onClick={() => setIsOpen(false)}
              >
                <UserCog className="h-4 w-4" />
                My Detail
              </Link>
              <Link
                href="/journal/archive"
                className="flex items-center gap-3 px-4 py-3 text-sm text-calm-text hover:bg-calm-surface transition-colors duration-300"
                style={{ minHeight: "44px" }}
                role="menuitem"
                onClick={() => setIsOpen(false)}
              >
                <Archive className="h-4 w-4" />
                Archive
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="flex w-full items-center gap-3 px-4 py-3 text-sm text-calm-text hover:bg-calm-surface transition-colors duration-300 border-t border-calm-border/40 rounded-b-lg"
                style={{ minHeight: "44px" }}
                role="menuitem"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
