"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, RotateCcw, Trash2 } from "lucide-react";
import { useJournalStore } from "@/lib/stores/journal-store";
import { useUserStore } from "@/lib/stores/user-store";
import { groupEntriesByDate } from "@/lib/utils/date-helpers";
import { DateGroupHeader } from "@/components/patient/date-group-header";
import { JournalEntryCard } from "@/components/patient/journal-entry-card";
import { GlassBoxCard } from "@/components/shared/glass-box/glass-box-card";
import {
  restoreJournalEntry,
  permanentlyDeleteJournalEntry,
  bulkDeleteArchivedEntries,
} from "@/app/actions/journal-actions";

// No-op handlers for read-only card rendering
const noop = async () => {};

export default function ArchivePage() {
  const personaId = useUserStore((s) => s.personaId);
  const archivedEntries = useJournalStore((s) => s.archivedEntries);
  const isLoadingArchived = useJournalStore((s) => s.isLoadingArchived);
  const fetchArchivedEntries = useJournalStore((s) => s.fetchArchivedEntries);
  const restoreEntry = useJournalStore((s) => s.restoreEntry);
  const removeEntry = useJournalStore((s) => s.removeEntry);
  const getEntriesSnapshot = useJournalStore((s) => s.getEntriesSnapshot);
  const restoreSnapshot = useJournalStore((s) => s.restoreSnapshot);

  const [showDeleteAll, setShowDeleteAll] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (personaId) {
      fetchArchivedEntries(personaId);
    }
  }, [personaId, fetchArchivedEntries]);

  const handleRestore = async (id: string) => {
    const snapshot = getEntriesSnapshot();
    restoreEntry(id);
    try {
      await restoreJournalEntry(id);
      setError(null);
    } catch (err) {
      console.error("Failed to restore entry:", err);
      restoreSnapshot(snapshot);
      setError("Failed to restore entry. Please try again.");
    }
  };

  const handleDelete = async (id: string) => {
    const snapshot = getEntriesSnapshot();
    removeEntry(id);
    try {
      await permanentlyDeleteJournalEntry(id);
      setConfirmDeleteId(null);
      setError(null);
    } catch (err) {
      console.error("Failed to delete entry:", err);
      restoreSnapshot(snapshot);
      setError("Failed to delete entry. Please try again.");
    }
  };

  const handleDeleteAll = async () => {
    if (!personaId) return;
    setIsDeleting(true);
    try {
      await bulkDeleteArchivedEntries(personaId);
      // Read IDs before mutating to avoid stale closure over archivedEntries
      const ids = useJournalStore.getState().archivedEntries.map((e) => e.id);
      ids.forEach((id) => removeEntry(id));
    } finally {
      setIsDeleting(false);
      setShowDeleteAll(false);
    }
  };

  const grouped = groupEntriesByDate(archivedEntries);

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/journal"
          className="rounded-md p-2 text-calm-text-muted hover:text-calm-text hover:bg-calm-surface transition-colors"
          style={{ minHeight: "44px", minWidth: "44px" }}
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-calm-text">Archive</h1>
          <p className="mt-0.5 text-sm text-calm-text-muted">
            {archivedEntries.length} archived{" "}
            {archivedEntries.length === 1 ? "entry" : "entries"}
          </p>
        </div>
        {archivedEntries.length > 0 && (
          <button
            onClick={() => setShowDeleteAll(true)}
            className="rounded-md px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
            style={{ minHeight: "44px" }}
          >
            Delete All
          </button>
        )}
      </div>

      {/* Error banner */}
      {error && (
        <div className="rounded-md bg-red-50 p-3 flex items-center justify-between border border-red-200">
          <p className="text-sm text-red-600 font-medium">{error}</p>
          <button onClick={() => setError(null)} className="text-red-600 hover:bg-red-100 p-1 rounded-full transition-colors">
            <span className="sr-only">Dismiss</span>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Delete All overlay confirmation */}
      {showDeleteAll && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-800 font-medium">
            Permanently delete all {archivedEntries.length} archived entries?
          </p>
          <p className="text-xs text-red-600 mt-1">This cannot be undone.</p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleDeleteAll}
              disabled={isDeleting}
              className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
              style={{ minHeight: "44px" }}
            >
              {isDeleting ? "Deleting..." : "Yes, Delete All"}
            </button>
            <button
              onClick={() => setShowDeleteAll(false)}
              className="rounded-md px-3 py-1.5 text-xs font-medium text-calm-text-muted hover:bg-calm-surface"
              style={{ minHeight: "44px" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Loading */}
      {isLoadingArchived && (
        <div className="flex flex-col gap-3">
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
      )}

      {/* Empty state */}
      {!isLoadingArchived && archivedEntries.length === 0 && (
        <div className="py-8 text-center">
          <p className="text-sm text-calm-text-muted">
            No archived entries.
          </p>
        </div>
      )}

      {/* Archived entries grouped by date */}
      {!isLoadingArchived && grouped.length > 0 && (
        <div className="flex flex-col gap-1">
          {grouped.map(([label, groupEntries]) => (
            <div key={label}>
              <DateGroupHeader label={label} />
              <div className="flex flex-col gap-2">
                {groupEntries.map((entry) => (
                  <div key={entry.id} className="flex flex-col gap-1">
                    {/* Reuse the same card components as the journal page */}
                    {entry.entry_type === "raw_text" ? (
                      <JournalEntryCard entry={entry} />
                    ) : (
                      <GlassBoxCard
                        entry={entry}
                        onUpdate={noop}
                        onApprove={noop}
                      />
                    )}

                    {/* Restore / Delete actions */}
                    <div className="flex gap-2 pl-1">
                      <button
                        onClick={() => handleRestore(entry.id)}
                        className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-calm-blue hover:bg-calm-blue-soft transition-colors"
                        style={{ minHeight: "44px" }}
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Restore
                      </button>
                      {confirmDeleteId === entry.id ? (
                        <span className="flex items-center gap-1 text-xs text-calm-text-muted">
                          Delete permanently?
                          <button
                            onClick={() => handleDelete(entry.id)}
                            className="rounded px-2 py-1 font-medium text-red-600 hover:bg-red-50"
                            style={{ minHeight: "44px" }}
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="rounded px-2 py-1 font-medium text-calm-text-muted hover:bg-calm-surface"
                            style={{ minHeight: "44px" }}
                          >
                            No
                          </button>
                        </span>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(entry.id)}
                          className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
                          style={{ minHeight: "44px" }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
