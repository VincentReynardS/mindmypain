"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { MedicationGlassBox } from '@/components/patient/medication-glass-box';
import { updateMedicationEntry, approveMedicationEntry } from '@/app/actions/journal-actions';
import { JournalEntry } from '@/types/database';
import { useUserStore } from '@/lib/stores/user-store';

interface MedicationMention {
  entryId: string;
  date: string;
  medication: string;
}

export default function MedicationsPage() {
  const [medicationEntries, setMedicationEntries] = useState<JournalEntry[]>([]);
  const [medicationMentions, setMedicationMentions] = useState<MedicationMention[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const personaId = useUserStore((s) => s.personaId);
  const supabase = createClient();

  // Optimistic update wrapper functions
  const handleUpdate = async (id: string, content: string) => {
    setMedicationEntries(entries =>
      entries.map(e => e.id === id ? { ...e, content } : e)
    );
    await updateMedicationEntry(id, content);
  };

  const handleApprove = async (id: string) => {
    setMedicationEntries(entries =>
      entries.map(e => e.id === id ? { ...e, status: 'approved' } : e)
    );
    await approveMedicationEntry(id);
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

      ((entries as JournalEntry[]) || []).forEach(entry => {
        if (!entry.ai_response) return;
        const ai = entry.ai_response as any;

        // Flat medication object from parseMedication()
        if (ai['Brand Name'] || ai['Generic Name'] || ai.Dosage) {
          dedications.push(entry);
          return;
        }

        // Medication mention string from parseJournal()
        if (ai.Medication && typeof ai.Medication === 'string' && ai.Medication.trim() !== '') {
          mentions.push({
            entryId: entry.id,
            date: entry.created_at,
            medication: ai.Medication,
          });
        }
      });

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
                      href={`/journal#${mention.entryId}`}
                      className="block rounded-lg border border-calm-border bg-calm-surface p-4 transition-colors hover:bg-calm-surface-raised"
                    >
                      <p className="text-xs text-calm-text-muted">
                        {new Date(mention.date).toLocaleDateString('en-AU', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
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
