"use client";

import { useState } from 'react';

interface MedicationFormData {
  'Brand Name': string;
  'Generic Name': string;
  Dosage: string;
  'Date Started': string;
  Reason: string;
  'Side Effects': string;
  Feelings: string;
  'Date Stopped': string;
  'Stop Reason': string;
  Notes: string;
}

interface MedicationEditFormProps {
  aiResponse: Record<string, unknown>;
  onSave: (aiResponse: object, contentText: string) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
}

function parseAiResponse(ai: Record<string, unknown>): MedicationFormData {
  return {
    'Brand Name': String(ai['Brand Name'] ?? ''),
    'Generic Name': String(ai['Generic Name'] ?? ''),
    Dosage: String(ai.Dosage ?? ''),
    'Date Started': String(ai['Date Started'] ?? ''),
    Reason: String(ai.Reason ?? ''),
    'Side Effects': String(ai['Side Effects'] ?? ''),
    Feelings: String(ai.Feelings ?? ''),
    'Date Stopped': String(ai['Date Stopped'] ?? ''),
    'Stop Reason': String(ai['Stop Reason'] ?? ''),
    Notes: String(ai.Notes ?? ''),
  };
}

function serializeToAiResponse(form: MedicationFormData): object {
  return {
    'Brand Name': form['Brand Name'] || null,
    'Generic Name': form['Generic Name'] || null,
    Dosage: form.Dosage || null,
    'Date Started': form['Date Started'] || null,
    Reason: form.Reason || null,
    'Side Effects': form['Side Effects'] || null,
    Feelings: form.Feelings || null,
    'Date Stopped': form['Date Stopped'] || null,
    'Stop Reason': form['Stop Reason'] || null,
    Notes: form.Notes || null,
  };
}

function serializeToContentText(form: MedicationFormData): string {
  const lines: string[] = [];
  if (form['Brand Name']) lines.push(`Brand Name: ${form['Brand Name']}`);
  if (form['Generic Name']) lines.push(`Generic Name: ${form['Generic Name']}`);
  if (form.Dosage) lines.push(`Dosage: ${form.Dosage}`);
  if (form['Date Started']) lines.push(`Date Started: ${form['Date Started']}`);
  if (form.Reason) lines.push(`Reason: ${form.Reason}`);
  if (form['Side Effects']) lines.push(`Side Effects: ${form['Side Effects']}`);
  if (form.Feelings) lines.push(`Feelings: ${form.Feelings}`);
  if (form['Date Stopped']) lines.push(`Date Stopped: ${form['Date Stopped']}`);
  if (form['Stop Reason']) lines.push(`Stop Reason: ${form['Stop Reason']}`);
  if (form.Notes) lines.push(`Notes: ${form.Notes}`);
  return lines.join('\n');
}

const inputClass = "w-full rounded-md border border-calm-border bg-white p-2 text-sm text-calm-text focus:border-calm-primary focus:ring-1 focus:ring-calm-primary";
const labelClass = "block text-xs font-medium text-calm-text-muted mb-1";

export function MedicationEditForm({ aiResponse, onSave, onCancel, isSaving }: MedicationEditFormProps) {
  const [form, setForm] = useState<MedicationFormData>(() => parseAiResponse(aiResponse));

  const handleChange = (field: keyof MedicationFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    await onSave(serializeToAiResponse(form), serializeToContentText(form));
  };

  return (
    <div className="rounded-lg bg-calm-surface-raised p-4 shadow-sm border border-calm-border">
      <label className="mb-4 block text-sm font-medium text-calm-text">
        Editing Medication Record
      </label>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass} htmlFor="med-brand-name">Brand Name</label>
            <input id="med-brand-name" type="text" className={inputClass}
              value={form['Brand Name']} onChange={(e) => handleChange('Brand Name', e.target.value)} disabled={isSaving} />
          </div>
          <div>
            <label className={labelClass} htmlFor="med-generic-name">Generic Name</label>
            <input id="med-generic-name" type="text" className={inputClass}
              value={form['Generic Name']} onChange={(e) => handleChange('Generic Name', e.target.value)} disabled={isSaving} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass} htmlFor="med-dosage">Dosage</label>
            <input id="med-dosage" type="text" className={inputClass}
              value={form.Dosage} onChange={(e) => handleChange('Dosage', e.target.value)} disabled={isSaving} />
          </div>
          <div>
            <label className={labelClass} htmlFor="med-date-started">Date Started</label>
            <input id="med-date-started" type="text" className={inputClass}
              value={form['Date Started']} onChange={(e) => handleChange('Date Started', e.target.value)} disabled={isSaving} />
          </div>
        </div>

        <div>
          <label className={labelClass} htmlFor="med-reason">Reason</label>
          <input id="med-reason" type="text" className={inputClass}
            value={form.Reason} onChange={(e) => handleChange('Reason', e.target.value)} disabled={isSaving} />
        </div>

        <div>
          <label className={labelClass} htmlFor="med-side-effects">Side Effects</label>
          <textarea id="med-side-effects" className={`${inputClass} min-h-15`}
            value={form['Side Effects']} onChange={(e) => handleChange('Side Effects', e.target.value)} disabled={isSaving} />
        </div>

        <div>
          <label className={labelClass} htmlFor="med-feelings">Feelings</label>
          <textarea id="med-feelings" className={`${inputClass} min-h-15`}
            value={form.Feelings} onChange={(e) => handleChange('Feelings', e.target.value)} disabled={isSaving} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass} htmlFor="med-date-stopped">Date Stopped</label>
            <input id="med-date-stopped" type="text" className={inputClass}
              value={form['Date Stopped']} onChange={(e) => handleChange('Date Stopped', e.target.value)} disabled={isSaving} />
          </div>
          {form['Date Stopped'] && (
            <div>
              <label className={labelClass} htmlFor="med-stop-reason">Stop Reason</label>
              <input id="med-stop-reason" type="text" className={inputClass}
                value={form['Stop Reason']} onChange={(e) => handleChange('Stop Reason', e.target.value)} disabled={isSaving} />
            </div>
          )}
        </div>

        <div>
          <label className={labelClass} htmlFor="med-notes">Notes</label>
          <textarea id="med-notes" className={`${inputClass} min-h-20`}
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
