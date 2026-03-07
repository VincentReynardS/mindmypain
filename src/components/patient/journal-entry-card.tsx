
import { useState } from "react";
import { type JournalEntry, type JournalEntryType } from "@/types/database";
import { formatTime, truncateContent } from "@/lib/utils/date-helpers";
import { Sparkles, Loader2 } from "lucide-react";
import { processJournalEntry } from "@/app/actions/journal-actions";
import { useJournalStore } from "@/lib/stores/journal-store";
import { ArchiveConfirmPopover } from "@/components/shared/archive-confirm-popover";

const TYPE_BADGE_CONFIG: Record<
  JournalEntryType,
  { label: string; className: string } | null
> = {
  raw_text: null,
  journal: {
    label: "Journal",
    className: "bg-calm-purple-soft text-calm-purple",
  },
  insight_card: {
    label: "Insight",
    className: "bg-calm-blue-soft text-calm-blue",
  },
};

interface JournalEntryCardProps {
  entry: JournalEntry;
  onArchive?: (id: string) => Promise<void>;
}

export function JournalEntryCard({ entry, onArchive }: JournalEntryCardProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const fetchEntries = useJournalStore((s) => s.fetchEntries);
  const badge = TYPE_BADGE_CONFIG[entry.entry_type];

  const handleOrganize = async () => {
    try {
      setIsProcessing(true);
      await processJournalEntry(entry.id);
      // Refresh list to show GlassBoxCard
      await fetchEntries(entry.user_id);
    } catch (error) {
      console.error("Failed to organize entry:", error);
      alert("Failed to organize entry. Please try again.");
      // Optional: Add toast notification here
    } finally {
      setIsProcessing(false);
    }
  };

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
          {onArchive && (
            <ArchiveConfirmPopover onArchive={() => onArchive(entry.id)} />
          )}
          {entry.entry_type === "raw_text" && (
            <button
              onClick={handleOrganize}
              disabled={isProcessing}
              className="group flex items-center gap-1.5 rounded-full bg-calm-blue-soft px-3 py-1 text-xs font-medium text-calm-blue transition-colors hover:bg-calm-blue hover:text-white disabled:opacity-50"
              title="Organize with AI"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Organizing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3 w-3" />
                  <span>Organize</span>
                </>
              )}
            </button>
          )}

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
