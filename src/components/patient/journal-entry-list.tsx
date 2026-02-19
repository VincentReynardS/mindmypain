"use client";

/**
 * JournalEntryList - Composes date-grouped journal entries.
 *
 * Reads from useJournalStore, groups via groupEntriesByDate,
 * and renders DateGroupHeader + JournalEntryCard per group.
 * Shows loading skeleton or empty state as appropriate.
 *
 * @see 2-2-daily-list-view.md - Task 5
 */

import { useJournalStore } from "@/lib/stores/journal-store";
import { groupEntriesByDate } from "@/lib/utils/date-helpers";
import { DateGroupHeader } from "./date-group-header";
import { JournalEntryCard } from "./journal-entry-card";

import { useUserStore } from "@/lib/stores/user-store";

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-label="Loading entries">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="animate-pulse rounded-lg bg-calm-surface-raised px-4 py-3"
        >
          <div className="mb-2 h-4 w-3/4 rounded bg-muted" />
          <div className="h-3 w-1/4 rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="py-8 text-center" role="status">
      <p className="text-sm text-calm-text-muted">
        No entries yet. Start by recording or typing above.
      </p>
    </div>
  );
}

export function JournalEntryList() {
  const entries = useJournalStore((s) => s.entries);
  const isLoading = useJournalStore((s) => s.isLoading);
  const error = useJournalStore((s) => s.error);
  const fetchEntries = useJournalStore((s) => s.fetchEntries);
  const personaId = useUserStore((s) => s.personaId);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="py-4 text-center" role="alert">
        <p className="text-sm text-destructive">
          Failed to load entries. Please try again.
        </p>
        <button
          onClick={() => personaId && fetchEntries(personaId)}
          className="mt-2 rounded-md bg-calm-blue-soft px-4 py-2 text-sm font-medium text-calm-blue transition-colors"
          style={{ transitionDuration: "var(--transition-duration-calm)" }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (entries.length === 0) {
    return <EmptyState />;
  }

  const grouped = groupEntriesByDate(entries);

  return (
    <div className="flex flex-col gap-1">
      {grouped.map(([label, groupEntries]) => (
        <div key={label}>
          <DateGroupHeader label={label} />
          <div className="flex flex-col gap-2">
            {groupEntries.map((entry) => (
              <JournalEntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
