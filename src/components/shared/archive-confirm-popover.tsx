"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Archive } from "lucide-react";

interface ArchiveConfirmPopoverProps {
  onArchive: () => Promise<void>;
  disabled?: boolean;
}

export function ArchiveConfirmPopover({ onArchive, disabled }: ArchiveConfirmPopoverProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const dismiss = useCallback(() => setShowConfirm(false), []);

  useEffect(() => {
    if (!showConfirm) return;

    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        dismiss();
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") dismiss();
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showConfirm, dismiss]);

  const handleArchive = async () => {
    try {
      await onArchive();
    } catch {
      // Fail silently
    } finally {
      setShowConfirm(false);
    }
  };

  return (
    <div ref={popoverRef} className="relative">
      <button
        onClick={() => setShowConfirm(true)}
        className="rounded-md p-2 text-calm-text-muted hover:text-calm-text hover:bg-calm-surface transition-colors"
        style={{ minHeight: "44px", minWidth: "44px" }}
        title="Archive"
        disabled={disabled}
        aria-expanded={showConfirm}
        aria-haspopup="true"
      >
        <Archive className="h-4 w-4" />
      </button>

      <div
        role="dialog"
        aria-label="Confirm archive"
        className={`absolute top-full mt-1 right-0 z-50 flex items-center gap-1 rounded-lg border border-calm-border bg-calm-surface-raised px-3 py-2 shadow-lg transition-opacity ${
          showConfirm ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        style={{ transitionDuration: "300ms" }}
      >
        <span className="whitespace-nowrap text-xs text-calm-text-muted">Archive?</span>
        <button
          onClick={handleArchive}
          disabled={disabled}
          className="rounded px-2 py-1 text-xs font-medium text-calm-text hover:bg-calm-surface"
          style={{ minHeight: "44px" }}
        >
          Yes
        </button>
        <button
          onClick={dismiss}
          className="rounded px-2 py-1 text-xs font-medium text-calm-text-muted hover:bg-calm-surface"
          style={{ minHeight: "44px" }}
        >
          No
        </button>
      </div>
    </div>
  );
}
