"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { MedicationGlassBox } from '@/components/patient/medication-glass-box';
import { updateMedicationEntry, approveMedicationEntry } from '@/app/actions/journal-actions';
import { JournalEntry } from '@/types/database';
import { useUserStore } from '@/lib/stores/user-store';

export default function MedicationsPage() {
  const [medicationEntries, setMedicationEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const personaId = useUserStore((s) => s.personaId);
  const supabase = createClient();

  // Optimistic update wrapper functions
  const handleUpdate = async (id: string, content: string) => {
    // Optimistically update the UI list
    setMedicationEntries(entries => 
      entries.map(e => e.id === id ? { ...e, content } : e)
    );
    // Persist to server
    await updateMedicationEntry(id, content);
  };

  const handleApprove = async (id: string) => {
    // Optimistically update the UI list
    setMedicationEntries(entries => 
      entries.map(e => e.id === id ? { ...e, status: 'approved' } : e)
    );
    // Persist to server
    await approveMedicationEntry(id);
  };

  useEffect(() => {
    async function loadMedications() {
      if (!personaId) {
        setMedicationEntries([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const { data: entries } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', personaId) 
        .in('entry_type', ['journal', 'daily_journal'])
        .order('created_at', { ascending: false });

      const processedEntries: JournalEntry[] = [];
      
      ((entries as JournalEntry[]) || []).forEach(entry => {
        // Pattern 1: Agenda with Brand Name (Direct medication record)
        if (entry.entry_type === 'journal') {
          try {
            const parsed = typeof entry.content === 'string' ? JSON.parse(entry.content || '{}') : entry.content;
            if (parsed['Brand Name'] || parsed['Generic Name'] || parsed['Dosage']) {
              processedEntries.push(entry);
              return;
            }
          } catch { /* ignore */ }
        }

        // Pattern 2: Daily Journal with medication notes
        if (entry.entry_type === 'daily_journal' && entry.ai_response) {
          const ai = entry.ai_response as any;
          if (ai.Medication && ai.Medication.trim() !== '') {
            // For now, we display the whole journal entry in the meds list 
            // if it contains medication info. The user can see their daily dose log here.
            processedEntries.push(entry);
          }
        }
      });
      
      setMedicationEntries(processedEntries);
      setIsLoading(false);
    }
    
    loadMedications();
  }, [personaId, supabase]);

  return (
    <div className="flex flex-col h-full min-h-screen pb-24 bg-calm-background p-4">
      <div className="mb-6 mt-2">
        <h1 className="text-2xl font-medium text-calm-text">Medications</h1>
        <p className="mt-1 text-sm text-calm-text-muted">
          Your active medications and detailed regimen history.
        </p>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="flex flex-col gap-3">
             {[1, 2].map((i) => (
                <div key={i} className="animate-pulse rounded-lg bg-calm-surface-raised px-4 py-8" />
              ))}
          </div>
        ) : (!medicationEntries || medicationEntries.length === 0) ? (
          <div className="rounded-lg border border-calm-border border-dashed p-8 text-center bg-calm-surface">
             <p className="text-sm text-calm-text-muted">No medications found.</p>
             <p className="text-xs text-calm-text-muted mt-2">Speak an entry like "Started taking 100mg of medication X today" into your journal.</p>
          </div>
        ) : (
          medicationEntries.map((entry) => (
            <MedicationGlassBox 
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
