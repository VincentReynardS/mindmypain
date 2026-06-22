"use client";

import { useState } from 'react';
import { JournalEntry, JsonObject } from '@/types/database';
import { MedicationGlassBox } from './medication-glass-box';
import { groupMedicationEntries, formatMedicationLabel } from '@/lib/journal-entry-ai';

interface MedicationSummaryProps {
  medications: JournalEntry[];
  onUpdate: (id: string, aiResponse: JsonObject, contentText: string) => Promise<void>;
  onApprove: (id: string) => Promise<void>;
  onToggleCheck: (entry: JournalEntry) => void;
}

function isChecked(entry: JournalEntry): boolean {
  const ai = entry.ai_response as JsonObject | null;
  return !!(ai && typeof ai === 'object' && ai.Checked === true);
}

const ArchiveIcon = () => (
  <svg className="h-4 w-4 text-calm-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
  </svg>
);

interface SummarySectionProps {
  title: string;
  items: JournalEntry[];
  inactive?: boolean;
  icon?: React.ReactNode;
  expanded: Set<string>;
  toggleExpand: (id: string) => void;
  expandAll: (ids: string[]) => void;
  onUpdate: MedicationSummaryProps['onUpdate'];
  onApprove: MedicationSummaryProps['onApprove'];
  onToggleCheck: MedicationSummaryProps['onToggleCheck'];
}

function SummarySection({
  title,
  items,
  inactive = false,
  icon,
  expanded,
  toggleExpand,
  expandAll,
  onUpdate,
  onApprove,
  onToggleCheck,
}: SummarySectionProps) {
  return (
    <section className="rounded-lg border border-calm-border bg-calm-surface p-4">
      <header className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-base font-medium text-calm-text">{title}</h2>
          <span className="text-xs text-calm-text-muted">({items.length})</span>
        </div>
        <button
          type="button"
          aria-label={`Edit ${title} section`}
          onClick={() => expandAll(items.map((e) => e.id))}
          className="flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium text-calm-blue hover:bg-calm-surface-raised"
          style={{ minHeight: '44px' }}
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <span>Edit</span>
        </button>
      </header>

      {items.length === 0 ? (
        <p className="text-xs text-calm-text-muted italic">None recorded.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((entry) => {
            const label = formatMedicationLabel(entry);
            const isOpen = expanded.has(entry.id);
            return (
              <li key={entry.id} className="rounded-md">
                <div className="flex items-center gap-3 py-1">
                  <input
                    type="checkbox"
                    aria-label={label}
                    checked={inactive ? false : isChecked(entry)}
                    disabled={inactive}
                    onChange={() => onToggleCheck(entry)}
                    className="h-5 w-5 rounded border-calm-border text-calm-green disabled:opacity-40"
                  />
                  <button
                    type="button"
                    onClick={() => toggleExpand(entry.id)}
                    className={`flex-1 text-left text-sm ${inactive ? 'text-calm-text-muted line-through' : 'text-calm-text'} hover:text-calm-primary`}
                    style={{ minHeight: '44px' }}
                  >
                    {label}
                  </button>
                </div>
                {isOpen && (
                  <div className="mt-2">
                    <MedicationGlassBox entry={entry} onUpdate={onUpdate} onApprove={onApprove} />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export function MedicationSummary({ medications, onUpdate, onApprove, onToggleCheck }: MedicationSummaryProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const { activePrescriptions, activeSupplements, inactive } = groupMedicationEntries(medications);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = (ids: string[]) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      const allOpen = ids.length > 0 && ids.every((id) => next.has(id));
      if (allOpen) {
        ids.forEach((id) => next.delete(id));
      } else {
        ids.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const shared = { expanded, toggleExpand, expandAll, onUpdate, onApprove, onToggleCheck };

  return (
    <div className="space-y-4">
      <SummarySection title="Active Medications Summary" items={activePrescriptions} {...shared} />
      <SummarySection title="Natural Supplements Summary" items={activeSupplements} {...shared} />
      <SummarySection title="Inactive Medications Summary" items={inactive} inactive icon={<ArchiveIcon />} {...shared} />
    </div>
  );
}
