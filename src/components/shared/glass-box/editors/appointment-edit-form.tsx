"use client";

import { useState } from 'react';

const ADMIN_NEEDS_OPTIONS = ['Referral', 'Prescription', 'Medical Certificate', 'Imaging Request', 'Blood Test'] as const;

interface AppointmentFormData {
  Date: string;
  Profession: string;
  'Practitioner Name': string;
  'Visit Type': string;
  Location: string;
  Reason: string;
  'Admin Needs': string[];
  Questions: string;
  Outcomes: string;
  'Follow-up Questions': string;
  Notes: string;
}

interface AppointmentEditFormProps {
  aiResponse: Record<string, unknown>;
  onSave: (aiResponse: object, contentText: string) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
}

function parseAiResponse(ai: Record<string, unknown>): AppointmentFormData {
  return {
    Date: String(ai.Date ?? ''),
    Profession: String(ai.Profession ?? ''),
    'Practitioner Name': String(ai['Practitioner Name'] ?? ''),
    'Visit Type': String(ai['Visit Type'] ?? ''),
    Location: String(ai.Location ?? ''),
    Reason: String(ai.Reason ?? ''),
    'Admin Needs': Array.isArray(ai['Admin Needs']) ? ai['Admin Needs'].map(String) : [],
    Questions: String(ai.Questions ?? ''),
    Outcomes: String(ai.Outcomes ?? ''),
    'Follow-up Questions': String(ai['Follow-up Questions'] ?? ''),
    Notes: String(ai.Notes ?? ''),
  };
}

function serializeToAiResponse(form: AppointmentFormData): object {
  return {
    Date: form.Date || null,
    Profession: form.Profession || null,
    'Practitioner Name': form['Practitioner Name'] || null,
    'Visit Type': form['Visit Type'] || null,
    Location: form.Location || null,
    Reason: form.Reason || null,
    'Admin Needs': form['Admin Needs'].length > 0 ? form['Admin Needs'] : null,
    Questions: form.Questions || null,
    Outcomes: form.Outcomes || null,
    'Follow-up Questions': form['Follow-up Questions'] || null,
    Notes: form.Notes || null,
  };
}

function serializeToContentText(form: AppointmentFormData): string {
  const lines: string[] = [];
  if (form['Practitioner Name']) lines.push(`Practitioner: ${form['Practitioner Name']}`);
  if (form['Visit Type']) lines.push(`Visit Type: ${form['Visit Type']}`);
  if (form.Profession) lines.push(`Profession: ${form.Profession}`);
  if (form.Date) lines.push(`Date: ${form.Date}`);
  if (form.Location) lines.push(`Location: ${form.Location}`);
  if (form.Reason) lines.push(`Reason: ${form.Reason}`);
  if (form['Admin Needs'].length > 0) lines.push(`Admin Needs: ${form['Admin Needs'].join(', ')}`);
  if (form.Questions) lines.push(`Questions: ${form.Questions}`);
  if (form.Outcomes) lines.push(`Outcomes: ${form.Outcomes}`);
  if (form['Follow-up Questions']) lines.push(`Follow-up Questions: ${form['Follow-up Questions']}`);
  if (form.Notes) lines.push(`Notes: ${form.Notes}`);
  return lines.join('\n');
}

const inputClass = "w-full rounded-md border border-calm-border bg-white p-2 text-sm text-calm-text focus:border-calm-primary focus:ring-1 focus:ring-calm-primary";
const labelClass = "block text-xs font-medium text-calm-text-muted mb-1";

export function AppointmentEditForm({ aiResponse, onSave, onCancel, isSaving }: AppointmentEditFormProps) {
  const [form, setForm] = useState<AppointmentFormData>(() => parseAiResponse(aiResponse));

  const handleChange = (field: keyof AppointmentFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleAdminNeed = (need: string) => {
    setForm((prev) => {
      const current = prev['Admin Needs'];
      const updated = current.includes(need)
        ? current.filter((n) => n !== need)
        : [...current, need];
      return { ...prev, 'Admin Needs': updated };
    });
  };

  const handleSave = async () => {
    await onSave(serializeToAiResponse(form), serializeToContentText(form));
  };

  return (
    <div className="rounded-lg bg-calm-surface-raised p-4 shadow-sm border border-calm-border">
      <label className="mb-4 block text-sm font-medium text-calm-text">
        Editing Appointment Record
      </label>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass} htmlFor="appt-practitioner">Practitioner Name</label>
            <input id="appt-practitioner" type="text" className={inputClass}
              value={form['Practitioner Name']} onChange={(e) => handleChange('Practitioner Name', e.target.value)} disabled={isSaving} />
          </div>
          <div>
            <label className={labelClass} htmlFor="appt-visit-type">Visit Type</label>
            <input id="appt-visit-type" type="text" className={inputClass}
              value={form['Visit Type']} onChange={(e) => handleChange('Visit Type', e.target.value)} disabled={isSaving} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass} htmlFor="appt-profession">Profession</label>
            <input id="appt-profession" type="text" className={inputClass}
              value={form.Profession} onChange={(e) => handleChange('Profession', e.target.value)} disabled={isSaving} />
          </div>
          <div>
            <label className={labelClass} htmlFor="appt-date">Date</label>
            <input id="appt-date" type="text" className={inputClass}
              value={form.Date} onChange={(e) => handleChange('Date', e.target.value)} disabled={isSaving} />
          </div>
        </div>

        <div>
          <label className={labelClass} htmlFor="appt-location">Location</label>
          <input id="appt-location" type="text" className={inputClass}
            value={form.Location} onChange={(e) => handleChange('Location', e.target.value)} disabled={isSaving} />
        </div>

        <div>
          <label className={labelClass} htmlFor="appt-reason">Reason</label>
          <textarea id="appt-reason" className={`${inputClass} min-h-15`}
            value={form.Reason} onChange={(e) => handleChange('Reason', e.target.value)} disabled={isSaving} />
        </div>

        {/* Admin Needs toggle buttons */}
        <div>
          <label className={labelClass}>Admin Needs</label>
          <div className="flex flex-wrap gap-2">
            {ADMIN_NEEDS_OPTIONS.map((need) => (
              <button
                key={need}
                type="button"
                onClick={() => toggleAdminNeed(need)}
                disabled={isSaving}
                className={`rounded-md px-3 py-1.5 text-xs font-medium border transition-all ${
                  form['Admin Needs'].includes(need)
                    ? 'bg-calm-primary text-white border-calm-primary'
                    : 'bg-white text-calm-text border-calm-border hover:border-calm-primary'
                }`}
                style={{ minHeight: '44px' }}
              >
                {need}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={labelClass} htmlFor="appt-questions">Questions to Ask</label>
          <textarea id="appt-questions" className={`${inputClass} min-h-15`}
            value={form.Questions} onChange={(e) => handleChange('Questions', e.target.value)} disabled={isSaving} />
        </div>

        <div>
          <label className={labelClass} htmlFor="appt-outcomes">Outcomes</label>
          <textarea id="appt-outcomes" className={`${inputClass} min-h-15`}
            value={form.Outcomes} onChange={(e) => handleChange('Outcomes', e.target.value)} disabled={isSaving} />
        </div>

        <div>
          <label className={labelClass} htmlFor="appt-followup">Follow-up Questions</label>
          <textarea id="appt-followup" className={`${inputClass} min-h-15`}
            value={form['Follow-up Questions']} onChange={(e) => handleChange('Follow-up Questions', e.target.value)} disabled={isSaving} />
        </div>

        <div>
          <label className={labelClass} htmlFor="appt-notes">Notes</label>
          <textarea id="appt-notes" className={`${inputClass} min-h-20`}
            value={form.Notes} onChange={(e) => handleChange('Notes', e.target.value)} disabled={isSaving} />
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button onClick={onCancel} disabled={isSaving}
          className="rounded-md px-4 py-2 text-sm font-medium text-calm-text-muted hover:bg-calm-surface"
          style={{ minHeight: '44px' }}>
          Cancel
        </button>
        <button onClick={handleSave} disabled={isSaving}
          className="rounded-md bg-calm-blue px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
          style={{ minHeight: '44px' }}>
          {isSaving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
