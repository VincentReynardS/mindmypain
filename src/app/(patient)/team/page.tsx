"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { TeamMemberGlassBox } from '@/components/patient/team-member-glass-box';
import { updateJournalAiResponse, approveTeamMemberEntry } from '@/app/actions/journal-actions';
import { JsonObject, JournalEntry } from '@/types/database';
import { useUserStore } from '@/lib/stores/user-store';
import { selectTeamMemberEntries } from '@/lib/journal-entry-ai';

export default function TeamPage() {
  const [teamEntries, setTeamEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const personaId = useUserStore((s) => s.personaId);
  const [supabase] = useState(createClient);

  const handleUpdate = async (id: string, aiResponse: object, contentText: string) => {
    const previousEntries = [...teamEntries];
    setTeamEntries(entries =>
      entries.map(e => e.id === id ? {
        ...e,
        content: contentText,
        ai_response: { ...(e.ai_response as JsonObject || {}), ...(aiResponse as JsonObject) },
      } : e)
    );
    try {
      await updateJournalAiResponse(id, aiResponse as JsonObject, contentText);
      setError(null);
    } catch (err) {
      console.error('Failed to update team member:', err);
      setTeamEntries(previousEntries);
      setError('Failed to update team member. Please try again.');
    }
  };

  const handleApprove = async (id: string) => {
    const previousEntries = [...teamEntries];
    setTeamEntries(entries =>
      entries.map(e => e.id === id ? { ...e, status: 'approved' } : e)
    );
    try {
      await approveTeamMemberEntry(id);
      setError(null);
    } catch (err) {
      console.error('Failed to approve team member:', err);
      setTeamEntries(previousEntries);
      setError('Failed to approve team member. Please try again.');
    }
  };

  useEffect(() => {
    async function loadTeam() {
      if (!personaId) {
        setTeamEntries([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const { data: entries, error: loadError } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', personaId)
        .eq('entry_type', 'journal')
        .neq('status', 'archived')
        .order('created_at', { ascending: false });

      if (loadError) {
        console.error('Failed to load team:', loadError);
        setTeamEntries([]);
        setError('Failed to load your care team. Please try again.');
        setIsLoading(false);
        return;
      }

      const { teamMembers } = selectTeamMemberEntries((entries as JournalEntry[]) || []);
      setTeamEntries(teamMembers);
      setIsLoading(false);
    }

    loadTeam();
  }, [personaId, supabase]);

  return (
    <div className="flex flex-col h-full min-h-screen pb-24 bg-calm-background p-4">
      <div className="mb-6 mt-2">
        <h1 className="text-2xl font-medium text-calm-text">Team</h1>
        <p className="mt-1 text-sm text-calm-text-muted">
          Your active teams.
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

      <div className="space-y-4">
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {[1, 2].map((i) => (
              <div key={i} className="animate-pulse rounded-lg bg-calm-surface-raised px-4 py-8" />
            ))}
          </div>
        ) : teamEntries.length === 0 ? (
          <div className="rounded-lg border border-calm-border border-dashed p-8 text-center bg-calm-surface">
            <p className="text-sm text-calm-text-muted">No care team members yet.</p>
            <p className="text-xs text-calm-text-muted mt-2">Add one from the home page, e.g. &quot;Add my GP Dr Smith, phone 0400 000 000&quot;.</p>
          </div>
        ) : (
          teamEntries.map((entry) => (
            <TeamMemberGlassBox
              key={entry.id}
              entry={entry}
              onUpdate={handleUpdate}
              onApprove={handleApprove}
            />
          ))
        )}
      </div>
    </div>
  );
}
