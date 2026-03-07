"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { AppointmentGlassBox } from '@/components/patient/appointment-glass-box';
import { updateAppointmentEntry, approveAppointmentEntry } from '@/app/actions/journal-actions';
import { JsonObject, JournalEntry } from '@/types/database';
import { useUserStore } from '@/lib/stores/user-store';

export default function AppointmentsPage() {
  const [appointmentEntries, setAppointmentEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const personaId = useUserStore((s) => s.personaId);
  const supabase = createClient();

  // Note: snapshot captures render-time closure. Rapid concurrent mutations may
  // rollback to an already-optimistic state. Acceptable for prototype scope.
  const handleUpdate = async (id: string, content: string) => {
    const previousEntries = [...appointmentEntries];
    setAppointmentEntries(entries =>
      entries.map(e => e.id === id ? { ...e, content } : e)
    );
    try {
      await updateAppointmentEntry(id, content);
      setError(null);
    } catch (err) {
      console.error('Failed to update appointment:', err);
      setAppointmentEntries(previousEntries);
      setError('Failed to update appointment. Please try again.');
    }
  };

  const handleApprove = async (id: string) => {
    const previousEntries = [...appointmentEntries];
    setAppointmentEntries(entries =>
      entries.map(e => e.id === id ? { ...e, status: 'approved' } : e)
    );
    try {
      await approveAppointmentEntry(id);
      setError(null);
    } catch (err) {
      console.error('Failed to approve appointment:', err);
      setAppointmentEntries(previousEntries);
      setError('Failed to approve appointment. Please try again.');
    }
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
        const ai = entry.ai_response as (JsonObject & { Appointments?: JsonObject[] }) | null;
        if (!ai || typeof ai !== 'object') return;

        // Flat appointment object from parseAppointment()
        if (ai['Practitioner Name'] || ai['Visit Type'] || ai.Date) {
          processedEntries.push(entry);
          return;
        }

        // Embedded array from parseJournal()
        if (ai.Appointments && Array.isArray(ai.Appointments) && ai.Appointments.length > 0) {
          ai.Appointments.forEach((appt: JsonObject, idx: number) => {
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
        ) : (!appointmentEntries || appointmentEntries.length === 0) ? (
          <div className="rounded-lg border border-calm-border border-dashed p-8 text-center bg-calm-surface">
             <p className="text-sm text-calm-text-muted">No appointments found.</p>
             <p className="text-xs text-calm-text-muted mt-2">Speak an entry like &quot;I have a doctor&apos;s appointment tomorrow&quot; into your journal.</p>
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
