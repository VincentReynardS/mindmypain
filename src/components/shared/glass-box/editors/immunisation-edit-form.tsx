"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { normalizeOptionalDateDDMMYYYY } from '@/lib/utils/date-helpers';

interface ImmunisationFormData {
  'Vaccine Name': string;
  'Date Given': string;
  'Brand Name': string;
}

interface ImmunisationEditFormProps {
  aiResponse: Record<string, unknown>;
  onSave: (aiResponse: object, contentText: string) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
}

function parseAiResponse(ai: Record<string, unknown>): ImmunisationFormData {
  return {
    'Vaccine Name': String(ai['Vaccine Name'] ?? ''),
    'Date Given': String(ai['Date Given'] ?? ''),
    'Brand Name': String(ai['Brand Name'] ?? ''),
  };
}

function serializeToAiResponse(form: ImmunisationFormData): object {
  return {
    'Vaccine Name': form['Vaccine Name'] || null,
    'Date Given': form['Date Given'] || null,
    'Brand Name': form['Brand Name'] || null,
  };
}

function serializeToContentText(form: ImmunisationFormData): string {
  const lines: string[] = [];
  if (form['Vaccine Name']) lines.push(`Vaccine: ${form['Vaccine Name']}`);
  if (form['Date Given']) lines.push(`Date Given: ${form['Date Given']}`);
  if (form['Brand Name']) lines.push(`Brand: ${form['Brand Name']}`);
  return lines.join('\n');
}

const labelClass = "block text-xs font-medium text-calm-text-muted mb-1";

export function ImmunisationEditForm({ aiResponse, onSave, onCancel, isSaving }: ImmunisationEditFormProps) {
  const [form, setForm] = useState<ImmunisationFormData>(() => parseAiResponse(aiResponse));
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: keyof ImmunisationFormData, value: string) => {
    if (field === 'Date Given' && error) {
      setError(null);
    }
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    const normalizedDate = normalizeOptionalDateDDMMYYYY(form['Date Given']);
    if (form['Date Given'].trim() && !normalizedDate) {
      setError('Date Given must be a valid date in dd-mm-yyyy format.');
      return;
    }

    const normalizedForm: ImmunisationFormData = {
      ...form,
      'Date Given': normalizedDate ?? '',
    };

    setError(null);
    await onSave(serializeToAiResponse(normalizedForm), serializeToContentText(normalizedForm));
  };

  return (
    <div className="rounded-lg bg-calm-surface-raised p-4 shadow-sm border border-calm-border">
      <label className="mb-4 block text-sm font-medium text-calm-text">
        Editing Immunisation Record
      </label>

      <div className="space-y-4">
        <div>
          <label className={labelClass} htmlFor="immunisation-vaccine-name">Vaccine Name</label>
          <Input id="immunisation-vaccine-name"
            value={form['Vaccine Name']} onChange={(e) => handleChange('Vaccine Name', e.target.value)} disabled={isSaving} />
        </div>

        <div>
          <label className={labelClass} htmlFor="immunisation-date-given">Date Given (dd-mm-yyyy)</label>
          <Input id="immunisation-date-given"
            value={form['Date Given']} onChange={(e) => handleChange('Date Given', e.target.value)} disabled={isSaving} aria-invalid={error ? 'true' : 'false'} />
        </div>

        <div>
          <label className={labelClass} htmlFor="immunisation-brand-name">Brand Name</label>
          <Input id="immunisation-brand-name"
            value={form['Brand Name']} onChange={(e) => handleChange('Brand Name', e.target.value)} disabled={isSaving} />
        </div>
      </div>

      {error && (
        <p className="mt-3 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <div className="mt-6 flex justify-end gap-3">
        <Button onClick={onCancel} disabled={isSaving} variant="ghost">
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}
