/**
 * Date Helpers - Utility functions for grouping journal entries by date
 *
 * Uses native Intl.DateTimeFormat for formatting (no external date libraries).
 *
 * @see 2-2-daily-list-view.md - Task 2
 */

import type { JournalEntry } from "@/types/database";

/**
 * Returns a friendly date label for a given date string.
 * - "Today" for today's date
 * - "Yesterday" for yesterday's date
 * - Formatted date (e.g., "February 17") for older dates
 */
export function getDateLabel(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();

  // Normalize to start of day in local timezone
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const diffMs = today.getTime() - target.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";

  // For same year, omit year; for different year, include it
  const options: Intl.DateTimeFormatOptions =
    date.getFullYear() === now.getFullYear()
      ? { month: "long", day: "numeric" }
      : { month: "long", day: "numeric", year: "numeric" };

  return new Intl.DateTimeFormat("en-AU", options).format(date);
}

/**
 * Formats a timestamp to HH:mm format (24-hour).
 */
export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-AU", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

/**
 * Truncates content to a specified max length with ellipsis.
 */
export function truncateContent(content: string, maxLength: number = 80): string {
  if (content.length <= maxLength) return content;
  return content.slice(0, maxLength).trimEnd() + "...";
}

/**
 * Groups journal entries by date label.
 * Returns an array of [label, entries[]] tuples preserving chronological order (newest first).
 */
export function groupEntriesByDate(
  entries: JournalEntry[]
): Array<[string, JournalEntry[]]> {
  const groups = new Map<string, JournalEntry[]>();

  for (const entry of entries) {
    const label = getDateLabel(entry.created_at);
    const existing = groups.get(label);
    if (existing) {
      existing.push(entry);
    } else {
      groups.set(label, [entry]);
    }
  }

  return Array.from(groups.entries());
}
