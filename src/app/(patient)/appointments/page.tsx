import { createClient } from '@/lib/supabase/server';
import { AppointmentGlassBox } from '@/components/patient/appointment-glass-box';
import { updateAppointmentEntry, approveJournalEntry } from '@/app/actions/journal-actions';
import { JournalEntry } from '@/types/database';

export const dynamic = 'force-dynamic';

export default async function AppointmentsPage() {
  const supabase = await createClient();

  // For the prototype, we assume Persona ID determines the view implicitly or we just fetch all
  // The Architecture specifies Sarah (uuid1) or Michael (uuid2) are implicitly handled
  // We'll fetch entries of type 'appointment' (or potentially agendas if we piggyback)
  // For Epic 3, we define the `appointment` entry_type.
  const { data: entries, error } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('entry_type', 'agendas') // Using agendas for now as smart-parser produces this. 
    // Ideally we would have a dedicated 'appointment' type or parse it into appt
    .order('created_at', { ascending: false });

  return (
    <div className="flex flex-col h-full min-h-screen pb-24 bg-calm-background p-4">
      <div className="mb-6 mt-2">
        <h1 className="text-2xl font-medium text-calm-text">Appointments</h1>
        <p className="mt-1 text-sm text-calm-text-muted">
          Your recorded appointments and upcoming visits.
        </p>
      </div>

      <div className="space-y-4">
        {(!entries || entries.length === 0) ? (
          <div className="rounded-lg border border-calm-border border-dashed p-8 text-center bg-calm-surface">
             <p className="text-sm text-calm-text-muted">No appointments found.</p>
             <p className="text-xs text-calm-text-muted mt-2">Speak an entry like "I have a doctor's appointment tomorrow" into your journal.</p>
          </div>
        ) : (
          entries.map((entry: JournalEntry) => (
            <AppointmentGlassBox 
              key={entry.id} 
              entry={entry} 
              onUpdate={updateAppointmentEntry}
              onApprove={approveJournalEntry}
            />
          ))
        )}
      </div>
    </div>
  );
}
