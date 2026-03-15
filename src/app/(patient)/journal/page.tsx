"use client";

/**
 * Journal Page - Dedicated view for pure journal reflection entries.
 *
 * Filters entries to show only journal reflections (excluding medications,
 * appointments, scripts, and immunisations). Uses the authoritative `_intent`
 * field for filtering, with conservative fallback handling for legacy and
 * unorganized raw drafts.
 *
 * @see epics.md - Story 7.5 (Dedicated Journal Page)
 */

import { useEffect, useMemo, useState } from "react";
import { useJournalStore } from "@/lib/stores/journal-store";
import { useUserStore } from "@/lib/stores/user-store";
import { groupEntriesByDate } from "@/lib/utils/date-helpers";
import { isJournalReflectionEntry } from "@/lib/journal-entry-ai";
import { DateGroupHeader } from "@/components/patient/date-group-header";
import { JournalEntryCard } from "@/components/patient/journal-entry-card";
import { GlassBoxCard } from "@/components/shared/glass-box/glass-box-card";
import {
  updateJournalEntry,
  approveJournalEntry,
  updateJournalAiResponse,
  archiveJournalEntry,
} from "@/app/actions/journal-actions";

export default function JournalPage() {
  const personaId = useUserStore((s) => s.personaId);
  const entries = useJournalStore((s) => s.entries);
  const isLoading = useJournalStore((s) => s.isLoading);
  const error = useJournalStore((s) => s.error);
  const fetchEntries = useJournalStore((s) => s.fetchEntries);
  const clearEntries = useJournalStore((s) => s.clearEntries);
  const updateEntry = useJournalStore((s) => s.updateEntry);
  const approveEntry = useJournalStore((s) => s.approveEntry);
  const archiveEntryOptimistic = useJournalStore((s) => s.archiveEntry);
  const getEntriesSnapshot = useJournalStore((s) => s.getEntriesSnapshot);
  const restoreSnapshot = useJournalStore((s) => s.restoreSnapshot);
  const [mutationError, setMutationError] = useState<string | null>(null);

  useEffect(() => {
    if (personaId) {
      clearEntries();
      fetchEntries(personaId);
    }
  }, [personaId, fetchEntries, clearEntries]);

  const journalEntries = useMemo(() => {
    return entries.filter(isJournalReflectionEntry);
  }, [entries]);

  const handleArchive = async (id: string) => {
    const snapshot = getEntriesSnapshot();
    archiveEntryOptimistic(id);
    try {
      await archiveJournalEntry(id);
      setMutationError(null);
    } catch (err) {
      console.error("Failed to archive entry:", err);
      restoreSnapshot(snapshot);
      setMutationError("Failed to archive entry. Please try again.");
    }
  };

  const grouped = groupEntriesByDate(journalEntries);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-calm-text">My Journal</h1>
        <p className="mt-1 text-sm text-calm-text-muted">
          Your personal reflections and daily thoughts.
        </p>
      </div>

      {isLoading ? (
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
      ) : error ? (
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
      ) : journalEntries.length === 0 ? (
        <div className="py-8 text-center" role="status">
          <p className="text-sm text-calm-text-muted">
            No journal reflections yet. Head to Home to capture your thoughts.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          {mutationError && (
            <div className="mb-2 rounded-md bg-red-50 p-3 flex items-center justify-between border border-red-200">
              <p className="text-sm text-red-600 font-medium">{mutationError}</p>
              <button onClick={() => setMutationError(null)} className="text-red-600 hover:bg-red-100 p-1 rounded-full transition-colors">
                <span className="sr-only">Dismiss</span>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
          {grouped.map(([label, groupEntries]) => (
            <div key={label}>
              <DateGroupHeader label={label} />
              <div className="flex flex-col gap-2">
                {groupEntries.map((entry) => {
                  if (entry.entry_type === "raw_text") {
                    return <JournalEntryCard key={entry.id} entry={entry} onArchive={handleArchive} />;
                  }

                  return (
                    <GlassBoxCard
                      key={entry.id}
                      entry={entry}
                      onUpdate={async (id, content) => {
                        const snapshot = getEntriesSnapshot();
                        updateEntry(id, { content });
                        try {
                          await updateJournalEntry(id, { content });
                          setMutationError(null);
                        } catch (err) {
                          console.error("Failed to update entry:", err);
                          restoreSnapshot(snapshot);
                          setMutationError("Failed to save changes. Please try again.");
                        }
                      }}
                      onApprove={async (id) => {
                        const snapshot = getEntriesSnapshot();
                        approveEntry(id);
                        try {
                          await approveJournalEntry(id);
                          setMutationError(null);
                        } catch (err) {
                          console.error("Failed to approve entry:", err);
                          restoreSnapshot(snapshot);
                          setMutationError("Failed to approve entry. Please try again.");
                        }
                      }}
                      onUpdateAiResponse={async (id, aiResponse, contentText) => {
                        const snapshot = getEntriesSnapshot();
                        updateEntry(id, { ai_response: aiResponse, content: contentText });
                        try {
                          await updateJournalAiResponse(id, aiResponse, contentText);
                          setMutationError(null);
                        } catch (err) {
                          console.error("Failed to update AI response:", err);
                          restoreSnapshot(snapshot);
                          setMutationError("Failed to update entry. Please try again.");
                        }
                      }}
                      onArchive={handleArchive}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
