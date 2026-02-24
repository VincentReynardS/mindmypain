"use client";

import { useState } from 'react';

interface ClinicalSummaryFormData {
  chief_complaint: string;
  medication_review: string;
  patient_goal: string;
}

interface ClinicalSummaryEditFormProps {
  aiResponse: Record<string, unknown>;
  onSave: (aiResponse: object, contentText: string) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
}

function flattenField(val: unknown): string {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') return val;
  if (Array.isArray(val)) return val.map(flattenField).filter(Boolean).join('; ');
  if (typeof val === 'object') {
    return Object.entries(val as Record<string, unknown>)
      .map(([k, v]) => {
        const flat = flattenField(v);
        return flat ? `${k}: ${flat}` : '';
      })
      .filter(Boolean)
      .join('. ');
  }
  return String(val);
}

function parseAiResponse(ai: Record<string, unknown>): ClinicalSummaryFormData {
  return {
    chief_complaint: flattenField(ai.chief_complaint),
    medication_review: flattenField(ai.medication_review),
    patient_goal: flattenField(ai.patient_goal),
  };
}

function serializeToAiResponse(form: ClinicalSummaryFormData): object {
  return {
    chief_complaint: form.chief_complaint || null,
    medication_review: form.medication_review || null,
    patient_goal: form.patient_goal || null,
  };
}

function serializeToContentText(form: ClinicalSummaryFormData): string {
  const lines: string[] = [];
  if (form.chief_complaint) lines.push(`Chief Complaint: ${form.chief_complaint}`);
  if (form.medication_review) lines.push(`Medication Review: ${form.medication_review}`);
  if (form.patient_goal) lines.push(`Patient Goal: ${form.patient_goal}`);
  return lines.join('\n');
}

const inputClass = "w-full rounded-md border border-calm-border bg-white p-2 text-sm text-calm-text focus:border-calm-primary focus:ring-1 focus:ring-calm-primary";
const labelClass = "block text-xs font-medium text-calm-text-muted mb-1";

export function ClinicalSummaryEditForm({ aiResponse, onSave, onCancel, isSaving }: ClinicalSummaryEditFormProps) {
  const [form, setForm] = useState<ClinicalSummaryFormData>(() => parseAiResponse(aiResponse));

  const handleChange = (field: keyof ClinicalSummaryFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    await onSave(serializeToAiResponse(form), serializeToContentText(form));
  };

  return (
    <div className="rounded-lg bg-calm-surface-raised p-4 shadow-sm border border-calm-border">
      <label className="mb-4 block text-sm font-medium text-calm-text">
        Editing Clinical Summary
      </label>

      <div className="space-y-4">
        <div>
          <label className={labelClass} htmlFor="cs-chief-complaint">Chief Complaint</label>
          <textarea id="cs-chief-complaint" className={`${inputClass} min-h-20`}
            value={form.chief_complaint} onChange={(e) => handleChange('chief_complaint', e.target.value)} disabled={isSaving} />
        </div>

        <div>
          <label className={labelClass} htmlFor="cs-medication-review">Medication Review</label>
          <textarea id="cs-medication-review" className={`${inputClass} min-h-20`}
            value={form.medication_review} onChange={(e) => handleChange('medication_review', e.target.value)} disabled={isSaving} />
        </div>

        <div>
          <label className={labelClass} htmlFor="cs-patient-goal">Patient Goal</label>
          <textarea id="cs-patient-goal" className={`${inputClass} min-h-20`}
            value={form.patient_goal} onChange={(e) => handleChange('patient_goal', e.target.value)} disabled={isSaving} />
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
