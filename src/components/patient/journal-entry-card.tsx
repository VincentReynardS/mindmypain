"use client";

/**
 * JournalEntryCard - Renders a single journal entry in the daily list.
 *
 * Displays timestamp, content snippet, and entry_type badge.
 * Uses Calm design tokens for consistent visual language.
 *
 * @see 2-2-daily-list-view.md - Task 3
 */

import { type JournalEntry, type JournalEntryType } from "@/types/database";
import { formatTime, truncateContent } from "@/lib/utils/date-helpers";

const TYPE_BADGE_CONFIG: Record<
  JournalEntryType,
  { label: string; className: string } | null
> = {
  raw_text: null,
  agendas: {
    label: "Agenda",
    className: "bg-calm-purple-soft text-calm-purple",
  },
  clinical_summary: {
    label: "Summary",
    className: "bg-calm-green-soft text-calm-green",
  },
  insight_card: {
    label: "Insight",
    className: "bg-calm-blue-soft text-calm-blue",
  },
};

interface JournalEntryCardProps {
  entry: JournalEntry;
}

export function JournalEntryCard({ entry }: JournalEntryCardProps) {
  const badge = TYPE_BADGE_CONFIG[entry.entry_type];

  return (
    <div
      className="min-h-[2.75rem] rounded-lg bg-calm-surface-raised px-4 py-3 transition-colors"
      style={{ transitionDuration: "var(--transition-duration-calm)" }}
      role="article"
      aria-label={`Journal entry from ${formatTime(entry.created_at)}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm text-calm-text">
            {truncateContent(entry.content)}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {badge && (
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${badge.className}`}
            >
              {badge.label}
            </span>
          )}
        </div>
      </div>

      <p className="mt-1 text-xs text-calm-text-muted">
        {formatTime(entry.created_at)}
      </p>
    </div>
  );
}
