"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { MedicationGlassBox } from '@/components/patient/medication-glass-box';
import { updateMedicationEntry, approveMedicationEntry, backfillEntryIntent } from '@/app/actions/journal-actions';
import { JsonObject, JournalEntry } from '@/types/database';
import { useUserStore } from '@/lib/stores/user-store';
import { formatDateDDMMYYYY } from '@/lib/utils/date-helpers';

interface MedicationMention {
  entryId: string;
  date: string;
  medication: string;
}

export default function MedicationsPage() {
  const [medicationEntries, setMedicationEntries] = useState<JournalEntry[]>([]);
  const [medicationMentions, setMedicationMentions] = useState<MedicationMention[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const personaId = useUserStore((s) => s.personaId);
  const supabase = createClient();

  // Note: snapshot captures render-time closure. Rapid concurrent mutations may
  // rollback to an already-optimistic state. Acceptable for prototype scope.
  const handleUpdate = async (id: string, content: string) => {
    const previousEntries = [...medicationEntries];
    setMedicationEntries(entries =>
      entries.map(e => e.id === id ? { ...e, content } : e)
    );
    try {
      await updateMedicationEntry(id, content);
      setError(null);
    } catch (err) {
      console.error('Failed to update medication:', err);
      setMedicationEntries(previousEntries);
      setError('Failed to update medication. Please try again.');
    }
  };

  const handleApprove = async (id: string) => {
    const previousEntries = [...medicationEntries];
    setMedicationEntries(entries =>
      entries.map(e => e.id === id ? { ...e, status: 'approved' } : e)
    );
    try {
      await approveMedicationEntry(id);
      setError(null);
    } catch (err) {
      console.error('Failed to approve medication:', err);
      setMedicationEntries(previousEntries);
      setError('Failed to approve medication. Please try again.');
    }
  };

  useEffect(() => {
    async function loadMedications() {
      if (!personaId) {
        setMedicationEntries([]);
        setMedicationMentions([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const { data: entries } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', personaId)
        .eq('entry_type', 'journal')
        .neq('status', 'archived')
        .order('created_at', { ascending: false });

      const dedications: JournalEntry[] = [];
      const mentions: MedicationMention[] = [];
      const toBackfill: { id: string; intent: string }[] = [];

      ((entries as JournalEntry[]) || []).forEach(entry => {
        if (!entry.ai_response) return;
        const ai = entry.ai_response as JsonObject | null;
        if (!ai || typeof ai !== 'object') return;

        // Check authoritative _intent first
        if (typeof ai._intent === 'string') {
          if (ai._intent === 'medication') dedications.push(entry);
          // Medication mentions come from journal-intent entries, check below
          if (ai._intent === 'journal' && typeof ai.Medication === 'string' && ai.Medication.trim() !== '') {
            mentions.push({ entryId: entry.id, date: entry.created_at, medication: ai.Medication });
          }
          return;
        }

        // Legacy fallback: field-sniffing
        if (ai['Brand Name'] || ai['Generic Name'] || ai.Dosage) {
          dedications.push(entry);
          toBackfill.push({ id: entry.id, intent: 'medication' });
          return;
        }

        // Medication mention string from parseJournal()
        if (typeof ai.Medication === 'string' && ai.Medication.trim() !== '') {
          mentions.push({
            entryId: entry.id,
            date: entry.created_at,
            medication: ai.Medication,
          });
        }
      });

      // On-the-fly backfill for legacy entries
      toBackfill.forEach(({ id, intent }) => backfillEntryIntent(id, intent));

      setMedicationEntries(dedications);
      setMedicationMentions(mentions);
      setIsLoading(false);
    }

    loadMedications();
  }, [personaId, supabase]);

  const hasNoData = medicationEntries.length === 0 && medicationMentions.length === 0;

  return (
    <div className="flex flex-col h-full min-h-screen pb-24 bg-calm-background p-4">
      <div className="mb-6 mt-2">
        <h1 className="text-2xl font-medium text-calm-text">Medications</h1>
        <p className="mt-1 text-sm text-calm-text-muted">
          Your active medications and detailed regimen history.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 flex items-center justify-between border border-red-200">
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-sm text-red-600 font-medium">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-600 hover:bg-red-100 p-1 rounded-full transition-colors">
            <span className="sr-only">Dismiss</span>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <div className="space-y-6">
        {isLoading ? (
          <div className="flex flex-col gap-3">
             {[1, 2].map((i) => (
                <div key={i} className="animate-pulse rounded-lg bg-calm-surface-raised px-4 py-8" />
              ))}
          </div>
        ) : hasNoData ? (
          <div className="rounded-lg border border-calm-border border-dashed p-8 text-center bg-calm-surface">
             <p className="text-sm text-calm-text-muted">No medications found.</p>
             <p className="text-xs text-calm-text-muted mt-2">Speak an entry like &quot;Started taking 100mg of medication X today&quot; into your journal.</p>
          </div>
        ) : (
          <>
            {/* My Medications — dedicated medication records */}
            {medicationEntries.length > 0 && (
              <section>
                <h2 className="text-lg font-medium text-calm-text mb-3">My Medications</h2>
                <div className="space-y-4">
                  {medicationEntries.map((entry) => (
                    <MedicationGlassBox
                      key={entry.id}
                      entry={entry}
                      onUpdate={handleUpdate}
                      onApprove={handleApprove}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Medication Mentions — journal entries that mention medications */}
            {medicationMentions.length > 0 && (
              <section>
                <h2 className="text-lg font-medium text-calm-text mb-3">Medication Mentions</h2>
                <div className="space-y-3">
                  {medicationMentions.map((mention) => (
                    <a
                      key={mention.entryId}
                      href={`/home#${mention.entryId}`}
                      className="block rounded-lg border border-calm-border bg-calm-surface p-4 transition-colors hover:bg-calm-surface-raised"
                    >
                      <p className="text-xs text-calm-text-muted">
                        {formatDateDDMMYYYY(mention.date)}
                      </p>
                      <p className="mt-1 text-sm text-calm-text">{mention.medication}</p>
                    </a>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
