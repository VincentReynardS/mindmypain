"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { GlassBoxCard } from '@/components/shared/glass-box/glass-box-card';
import { updateImmunisationEntry, approveImmunisationEntry, updateJournalAiResponse, archiveJournalEntry, backfillEntryIntent } from '@/app/actions/journal-actions';
import { JsonObject, JournalEntry } from '@/types/database';
import { useUserStore } from '@/lib/stores/user-store';
import { selectImmunisationEntries } from '@/lib/journal-entry-ai';

export default function ImmunisationsPage() {
  const [immunisationEntries, setImmunisationEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const personaId = useUserStore((s) => s.personaId);
  const supabase = createClient();

  const handleUpdate = async (id: string, content: string) => {
    const previousEntries = [...immunisationEntries];
    setImmunisationEntries(entries =>
      entries.map(e => e.id === id ? { ...e, content } : e)
    );
    try {
      await updateImmunisationEntry(id, content);
      setError(null);
    } catch (err) {
      console.error('Failed to update immunisation:', err);
      setImmunisationEntries(previousEntries);
      setError('Failed to update immunisation. Please try again.');
    }
  };

  const handleApprove = async (id: string) => {
    const previousEntries = [...immunisationEntries];
    setImmunisationEntries(entries =>
      entries.map(e => e.id === id ? { ...e, status: 'approved' } : e)
    );
    try {
      await approveImmunisationEntry(id);
      setError(null);
    } catch (err) {
      console.error('Failed to approve immunisation:', err);
      setImmunisationEntries(previousEntries);
      setError('Failed to approve immunisation. Please try again.');
    }
  };

  const handleUpdateAiResponse = async (id: string, aiResponse: JsonObject, contentText: string) => {
    const previousEntries = [...immunisationEntries];
    setImmunisationEntries(entries =>
      entries.map(e => e.id === id ? { ...e, ai_response: aiResponse, content: contentText } : e)
    );
    try {
      await updateJournalAiResponse(id, aiResponse, contentText);
      setError(null);
    } catch (err) {
      console.error('Failed to update immunisation ai_response:', err);
      setImmunisationEntries(previousEntries);
      setError('Failed to update immunisation. Please try again.');
    }
  };

  const handleArchive = async (id: string) => {
    const previousEntries = [...immunisationEntries];
    setImmunisationEntries(entries => entries.filter(e => e.id !== id));
    try {
      await archiveJournalEntry(id);
      setError(null);
    } catch (err) {
      console.error('Failed to archive immunisation:', err);
      setImmunisationEntries(previousEntries);
      setError('Failed to archive immunisation. Please try again.');
    }
  };

  useEffect(() => {
    async function loadImmunisations() {
      if (!personaId) {
        setImmunisationEntries([]);
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

      const { immunisations, toBackfill } = selectImmunisationEntries((entries as JournalEntry[]) || []);

      // On-the-fly backfill for legacy entries
      toBackfill.forEach(({ id, intent }) => backfillEntryIntent(id, intent));

      setImmunisationEntries(immunisations);
      setIsLoading(false);
    }

    loadImmunisations();
  }, [personaId, supabase]);

  return (
    <div className="flex flex-col h-full min-h-screen pb-24 bg-calm-background p-4">
      <div className="mb-6 mt-2">
        <h1 className="text-2xl font-medium text-calm-text">Immunisations</h1>
        <p className="mt-1 text-sm text-calm-text-muted">
          Your vaccination and immunisation records.
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
        ) : immunisationEntries.length === 0 ? (
          <div className="rounded-lg border border-calm-border border-dashed p-8 text-center bg-calm-surface">
            <p className="text-sm text-calm-text-muted">No immunisation records found.</p>
            <p className="text-xs text-calm-text-muted mt-2">Speak an entry like &quot;Got my Pfizer COVID booster today&quot; into your journal.</p>
          </div>
        ) : (
          <section>
            <h2 className="text-lg font-medium text-calm-text mb-3">My Immunisations</h2>
            <div className="space-y-4">
              {immunisationEntries.map((entry) => (
                <GlassBoxCard
                  key={entry.id}
                  entry={entry}
                  onUpdate={handleUpdate}
                  onApprove={handleApprove}
                  onUpdateAiResponse={handleUpdateAiResponse}
                  onArchive={handleArchive}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
