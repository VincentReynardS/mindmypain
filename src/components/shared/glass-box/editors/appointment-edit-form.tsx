"use client";

import { useState } from 'react';
import { formatDateDDMMYYYY, toYYYYMMDD } from '@/lib/utils/date-helpers';

const ADMIN_NEEDS_OPTIONS = ['Repeat Prescription', 'Medical Certificate', 'Specialist Referral', 'Pathology Referral'] as const;
const MODE_OPTIONS = ['In-person', 'Telehealth'] as const;
type AdminNeedOption = typeof ADMIN_NEEDS_OPTIONS[number];
const LEGACY_ADMIN_NEEDS_MAP: Record<string, typeof ADMIN_NEEDS_OPTIONS[number]> = {
  Referral: 'Specialist Referral',
  Prescription: 'Repeat Prescription',
  'Medical Certificate': 'Medical Certificate',
  'Imaging Request': 'Pathology Referral',
};

interface AppointmentFormData {
  Date: string;
  Time: string;
  Profession: string;
  'Practitioner Name': string;
  'Visit Type': string;
  Mode: string;
  Address: string;
  Reason: string;
  'Admin Needs': string[];
  Questions: string;
  'Repeat Prescriptions': string[];
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

function isAdminNeedOption(value: string): value is AdminNeedOption {
  return (ADMIN_NEEDS_OPTIONS as readonly string[]).includes(value);
}

function normalizeAdminNeeds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const normalized = value
    .map(String)
    .map((need) => LEGACY_ADMIN_NEEDS_MAP[need] ?? need)
    .filter(isAdminNeedOption);
  return Array.from(new Set(normalized));
}

function parseAiResponse(ai: Record<string, unknown>): AppointmentFormData {
  return {
    Date: String(ai.Date ?? ''),
    Time: String(ai.Time ?? ''),
    Profession: String(ai.Profession ?? ''),
    'Practitioner Name': String(ai['Practitioner Name'] ?? ''),
    'Visit Type': String(ai['Visit Type'] ?? ''),
    Mode: String(ai.Mode ?? ''),
    Address: String(ai.Address ?? ai.Location ?? ''),
    Reason: String(ai.Reason ?? ''),
    'Admin Needs': normalizeAdminNeeds(ai['Admin Needs']),
    Questions: String(ai.Questions ?? ''),
    'Repeat Prescriptions': Array.isArray(ai['Repeat Prescriptions']) ? ai['Repeat Prescriptions'].map(String) : [],
    Outcomes: String(ai.Outcomes ?? ''),
    'Follow-up Questions': String(ai['Follow-up Questions'] ?? ''),
    Notes: String(ai.Notes ?? ''),
  };
}

function serializeToAiResponse(form: AppointmentFormData): object {
  return {
    Date: form.Date || null,
    Time: form.Time || null,
    Profession: form.Profession || null,
    'Practitioner Name': form['Practitioner Name'] || null,
    'Visit Type': form['Visit Type'] || null,
    Mode: form.Mode || null,
    Address: form.Address || null,
    Reason: form.Reason || null,
    'Admin Needs': form['Admin Needs'].length > 0 ? form['Admin Needs'] : null,
    Questions: form.Questions || null,
    'Repeat Prescriptions': form['Repeat Prescriptions'].length > 0 ? form['Repeat Prescriptions'] : null,
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
  if (form.Time) lines.push(`Time: ${form.Time}`);
  if (form.Mode) lines.push(`Mode: ${form.Mode}`);
  if (form.Address) lines.push(`Address: ${form.Address}`);
  if (form.Reason) lines.push(`Reason: ${form.Reason}`);
  if (form['Admin Needs'].length > 0) lines.push(`Admin Needs: ${form['Admin Needs'].join(', ')}`);
  if (form.Questions) lines.push(`Questions: ${form.Questions}`);
  if (form['Repeat Prescriptions'].length > 0) lines.push(`Repeat Prescriptions: ${form['Repeat Prescriptions'].join(', ')}`);
  if (form.Outcomes) lines.push(`Outcomes: ${form.Outcomes}`);
  if (form['Follow-up Questions']) lines.push(`Follow-up Questions: ${form['Follow-up Questions']}`);
  if (form.Notes) lines.push(`Notes: ${form.Notes}`);
  return lines.join('\n');
}

const inputClass = "w-full rounded-md border border-calm-border bg-white p-2 text-sm text-calm-text focus:border-calm-blue focus:ring-1 focus:ring-calm-blue";
const labelClass = "block text-xs font-medium text-calm-text-muted mb-1";

export function AppointmentEditForm({ aiResponse, onSave, onCancel, isSaving }: AppointmentEditFormProps) {
  const [form, setForm] = useState<AppointmentFormData>(() => parseAiResponse(aiResponse));
  const [newPrescription, setNewPrescription] = useState('');

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

  const addPrescription = () => {
    const trimmed = newPrescription.trim();
    if (!trimmed) return;
    setForm((prev) => ({
      ...prev,
      'Repeat Prescriptions': [...prev['Repeat Prescriptions'], trimmed],
    }));
    setNewPrescription('');
  };

  const removePrescription = (index: number) => {
    setForm((prev) => ({
      ...prev,
      'Repeat Prescriptions': prev['Repeat Prescriptions'].filter((_, i) => i !== index),
    }));
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
            <label className={labelClass} htmlFor="appt-date">Date</label>
            <input id="appt-date" type="date" className={inputClass}
              value={toYYYYMMDD(form.Date)}
              onChange={(e) => handleChange('Date', formatDateDDMMYYYY(e.target.value))}
              disabled={isSaving} />
          </div>
          <div>
            <label className={labelClass} htmlFor="appt-time">Time</label>
            <input id="appt-time" type="time" className={inputClass}
              value={form.Time}
              onChange={(e) => handleChange('Time', e.target.value)}
              disabled={isSaving} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass} htmlFor="appt-visit-type">Visit Type</label>
            <input id="appt-visit-type" type="text" className={inputClass}
              value={form['Visit Type']} onChange={(e) => handleChange('Visit Type', e.target.value)} disabled={isSaving} />
          </div>
          <div>
            <label className={labelClass} htmlFor="appt-profession">Profession</label>
            <input id="appt-profession" type="text" className={inputClass}
              value={form.Profession} onChange={(e) => handleChange('Profession', e.target.value)} disabled={isSaving} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass} htmlFor="appt-practitioner">Practitioner Name</label>
            <input id="appt-practitioner" type="text" className={inputClass}
              value={form['Practitioner Name']} onChange={(e) => handleChange('Practitioner Name', e.target.value)} disabled={isSaving} />
          </div>
        </div>

        <div>
          <label className={labelClass}>Mode</label>
          <div className="flex gap-2">
            {MODE_OPTIONS.map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => handleChange('Mode', form.Mode === mode ? '' : mode)}
                disabled={isSaving}
                className={`rounded-md px-4 py-2 text-xs font-medium border transition-all ${
                  form.Mode === mode
                    ? 'bg-calm-blue text-white border-calm-blue'
                    : 'bg-calm-surface text-calm-text border-calm-border hover:bg-calm-border'
                }`}
                style={{ minHeight: '44px' }}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={labelClass} htmlFor="appt-address">Address</label>
          <input id="appt-address" type="text" className={inputClass}
            value={form.Address} onChange={(e) => handleChange('Address', e.target.value)} disabled={isSaving} />
        </div>

        <div>
          <label className={labelClass} htmlFor="appt-reason">Reason</label>
          <textarea id="appt-reason" className={`${inputClass} min-h-15`}
            value={form.Reason} onChange={(e) => handleChange('Reason', e.target.value)} disabled={isSaving} />
        </div>

        {/* Admin Needs toggle buttons */}
        <div>
          <label className={labelClass}>Reason for Visit</label>
          <div className="flex flex-wrap gap-2">
            {ADMIN_NEEDS_OPTIONS.map((need) => (
              <button
                key={need}
                type="button"
                onClick={() => toggleAdminNeed(need)}
                disabled={isSaving}
                className={`rounded-md px-3 py-1.5 text-xs font-medium border transition-all ${
                  form['Admin Needs'].includes(need)
                    ? 'bg-calm-blue text-white border-calm-blue'
                    : 'bg-calm-surface text-calm-text border-calm-border hover:bg-calm-border'
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

        {/* Repeat Prescriptions dynamic list */}
        <div>
          <label className={labelClass}>Repeat Prescriptions</label>
          {form['Repeat Prescriptions'].length > 0 && (
            <div className="space-y-1.5 mb-2">
              {form['Repeat Prescriptions'].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="flex-1 rounded-md border border-calm-border bg-white px-2 py-1.5 text-sm text-calm-text">{item}</span>
                  <button
                    type="button"
                    onClick={() => removePrescription(idx)}
                    disabled={isSaving}
                    className="rounded-md px-2 py-1.5 text-xs font-medium text-destructive hover:bg-red-50 border border-calm-border"
                    style={{ minHeight: '44px' }}
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              className={inputClass}
              value={newPrescription}
              onChange={(e) => setNewPrescription(e.target.value)}
              disabled={isSaving}
              placeholder="Medication name"
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addPrescription(); } }}
            />
            <button
              type="button"
              onClick={addPrescription}
              disabled={isSaving || !newPrescription.trim()}
              className="rounded-md bg-calm-green px-3 py-2 text-xs font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
              style={{ minHeight: '44px' }}
            >
              Add
            </button>
          </div>
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
