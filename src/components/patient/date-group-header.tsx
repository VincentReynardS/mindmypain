"use client";

/**
 * DateGroupHeader - Sticky date header for journal entry groups.
 *
 * Displays friendly date labels (Today, Yesterday, or formatted date).
 * Uses Calm muted text and semi-transparent background for scroll readability.
 *
 * @see 2-2-daily-list-view.md - Task 4
 */

interface DateGroupHeaderProps {
  label: string;
}

export function DateGroupHeader({ label }: DateGroupHeaderProps) {
  return (
    <div
      className="sticky top-0 z-10 bg-calm-surface/90 py-2 backdrop-blur-sm"
    >
      <h2 className="text-sm font-medium text-calm-text-muted">{label}</h2>
    </div>
  );
}
