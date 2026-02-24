"use client";

import { useState } from 'react';

interface ScriptFormData {
  Name: string;
  'Date Prescribed': string;
  Filled: boolean;
  Notes: string;
}

interface ScriptEditFormProps {
  aiResponse: Record<string, unknown>;
  onSave: (aiResponse: object, contentText: string) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
}

function parseAiResponse(ai: Record<string, unknown>): ScriptFormData {
  return {
    Name: String(ai.Name ?? ''),
    'Date Prescribed': String(ai['Date Prescribed'] ?? ''),
    Filled: Boolean(ai.Filled),
    Notes: String(ai.Notes ?? ''),
  };
}

function serializeToAiResponse(form: ScriptFormData): object {
  return {
    Name: form.Name || null,
    'Date Prescribed': form['Date Prescribed'] || null,
    Filled: form.Filled,
    Notes: form.Notes || null,
  };
}

function serializeToContentText(form: ScriptFormData): string {
  const lines: string[] = [];
  if (form.Name) lines.push(`Script: ${form.Name}`);
  if (form['Date Prescribed']) lines.push(`Date Prescribed: ${form['Date Prescribed']}`);
  lines.push(`Status: ${form.Filled ? 'Filled' : 'To Be Filled'}`);
  if (form.Notes) lines.push(`Notes: ${form.Notes}`);
  return lines.join('\n');
}

const inputClass = "w-full rounded-md border border-calm-border bg-white p-2 text-sm text-calm-text focus:border-calm-primary focus:ring-1 focus:ring-calm-primary";
const labelClass = "block text-xs font-medium text-calm-text-muted mb-1";

export function ScriptEditForm({ aiResponse, onSave, onCancel, isSaving }: ScriptEditFormProps) {
  const [form, setForm] = useState<ScriptFormData>(() => parseAiResponse(aiResponse));

  const handleChange = (field: keyof ScriptFormData, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    await onSave(serializeToAiResponse(form), serializeToContentText(form));
  };

  return (
    <div className="rounded-lg bg-calm-surface-raised p-4 shadow-sm border border-calm-border">
      <label className="mb-4 block text-sm font-medium text-calm-text">
        Editing Script / Referral
      </label>

      <div className="space-y-4">
        <div>
          <label className={labelClass} htmlFor="script-name">Name</label>
          <input id="script-name" type="text" className={inputClass}
            value={form.Name} onChange={(e) => handleChange('Name', e.target.value)} disabled={isSaving} />
        </div>

        <div>
          <label className={labelClass} htmlFor="script-date">Date Prescribed</label>
          <input id="script-date" type="text" className={inputClass}
            value={form['Date Prescribed']} onChange={(e) => handleChange('Date Prescribed', e.target.value)} disabled={isSaving} />
        </div>

        <label htmlFor="script-filled" className="flex items-center gap-3 cursor-pointer" style={{ minHeight: '44px' }}>
          <input
            type="checkbox"
            id="script-filled"
            checked={form.Filled}
            onChange={(e) => handleChange('Filled', e.target.checked)}
            disabled={isSaving}
            className="h-5 w-5 rounded border-calm-border text-calm-primary focus:ring-calm-primary"
          />
          <span className="text-sm text-calm-text">Filled</span>
        </label>

        <div>
          <label className={labelClass} htmlFor="script-notes">Notes</label>
          <textarea id="script-notes" className={`${inputClass} min-h-20`}
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
