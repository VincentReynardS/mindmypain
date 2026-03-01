"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { AppointmentGlassBox } from '@/components/patient/appointment-glass-box';
import { updateAppointmentEntry, approveAppointmentEntry } from '@/app/actions/journal-actions';
import { JournalEntry } from '@/types/database';
import { useUserStore } from '@/lib/stores/user-store';

export default function AppointmentsPage() {
  const [appointmentEntries, setAppointmentEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const personaId = useUserStore((s) => s.personaId);
  const supabase = createClient();

  // Optimistic update wrapper functions
  const handleUpdate = async (id: string, content: string) => {
    // Optimistically update the UI list
    setAppointmentEntries(entries => 
      entries.map(e => e.id === id ? { ...e, content } : e)
    );
    // Persist to server
    await updateAppointmentEntry(id, content);
  };

  const handleApprove = async (id: string) => {
    // Optimistically update the UI list
    setAppointmentEntries(entries => 
      entries.map(e => e.id === id ? { ...e, status: 'approved' } : e)
    );
    // Persist to server
    await approveAppointmentEntry(id);
  };

  useEffect(() => {
    async function loadAppointments() {
      if (!personaId) {
        setAppointmentEntries([]);
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

      const processedEntries: JournalEntry[] = [];

      ((entries as JournalEntry[]) || []).forEach(entry => {
        if (!entry.ai_response) return;
        const ai = entry.ai_response as any;

        // Flat appointment object from parseAppointment()
        if (ai['Practitioner Name'] || ai['Visit Type'] || ai.Date) {
          processedEntries.push(entry);
          return;
        }

        // Embedded array from parseJournal()
        if (ai.Appointments && Array.isArray(ai.Appointments) && ai.Appointments.length > 0) {
          ai.Appointments.forEach((appt: any, idx: number) => {
            processedEntries.push({
              ...entry,
              id: `${entry.id}_appt_${idx}`,
              content: JSON.stringify(appt),
              entry_type: 'journal'
            });
          });
        }
      });
      
      setAppointmentEntries(processedEntries);
      setIsLoading(false);
    }
    
    loadAppointments();
  }, [personaId, supabase]);

  return (
    <div className="flex flex-col h-full min-h-screen pb-24 bg-calm-background p-4">
      <div className="mb-6 mt-2">
        <h1 className="text-2xl font-medium text-calm-text">Appointments</h1>
        <p className="mt-1 text-sm text-calm-text-muted">
          Your recorded appointments and upcoming visits.
        </p>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="flex flex-col gap-3">
             {[1, 2].map((i) => (
                <div key={i} className="animate-pulse rounded-lg bg-calm-surface-raised px-4 py-8" />
              ))}
          </div>
        ) : (!appointmentEntries || appointmentEntries.length === 0) ? (
          <div className="rounded-lg border border-calm-border border-dashed p-8 text-center bg-calm-surface">
             <p className="text-sm text-calm-text-muted">No appointments found.</p>
             <p className="text-xs text-calm-text-muted mt-2">Speak an entry like "I have a doctor's appointment tomorrow" into your journal.</p>
          </div>
        ) : (
          appointmentEntries.map((entry) => (
            <AppointmentGlassBox 
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
