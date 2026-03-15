/**
 * Date Helpers - Utility functions for grouping journal entries by date
 *
 * Uses native Intl.DateTimeFormat for formatting (no external date libraries).
 *
 * @see 2-2-daily-list-view.md - Task 2
 */

import type { JournalEntry } from "@/types/database";

const AUSTRALIA_TIME_ZONE = "Australia/Melbourne";
const DDMMYYYY_PATTERN = /^\d{2}-\d{2}-\d{4}$/;
const YYYYMMDD_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function toDDMMYYYY(day: string, month: string, year: string): string {
  return `${day.padStart(2, "0")}-${month.padStart(2, "0")}-${year}`;
}

function formatDateInTimeZone(date: Date, timeZone: string = AUSTRALIA_TIME_ZONE): string {
  const parts = new Intl.DateTimeFormat("en-AU", {
    timeZone,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).formatToParts(date);

  const day = parts.find((part) => part.type === "day")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const year = parts.find((part) => part.type === "year")?.value;

  if (!day || !month || !year) {
    throw new Error("Unable to format date parts");
  }

  return toDDMMYYYY(day, month, year);
}

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
  
  const dayName = new Intl.DateTimeFormat("en-AU", { weekday: "long" }).format(date);

  if (diffDays === 0) return `${dayName}, Today`;
  if (diffDays === 1) return `${dayName}, Yesterday`;

  // For same year, omit year; for different year, include it
  const options: Intl.DateTimeFormatOptions =
    date.getFullYear() === now.getFullYear()
      ? { weekday: "long", month: "long", day: "numeric" }
      : { weekday: "long", month: "long", day: "numeric", year: "numeric" };

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
 * Ensures a date string is displayed in dd-mm-yyyy format.
 * - If already dd-mm-yyyy, returns as-is.
 * - If parseable (e.g. YYYY-MM-DD, ISO), reformats to dd-mm-yyyy.
 * - Otherwise returns the original string (graceful degradation for legacy data).
 */
export function formatDateDDMMYYYY(value: string): string {
  if (!value) return value;
  if (DDMMYYYY_PATTERN.test(value)) return value;
  if (YYYYMMDD_PATTERN.test(value)) {
    const [year, month, day] = value.split("-");
    return toDDMMYYYY(day, month, year);
  }

  const parsed = new Date(value);
  if (!isNaN(parsed.getTime())) {
    return formatDateInTimeZone(parsed);
  }
  return value;
}

export function normalizeOptionalDateDDMMYYYY(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  const normalized = formatDateDDMMYYYY(trimmed);
  return DDMMYYYY_PATTERN.test(normalized) ? normalized : null;
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
