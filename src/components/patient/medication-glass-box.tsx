"use client";

import { useState } from 'react';
import { JournalEntry, JsonObject } from '@/types/database';
import { isEntryIntent } from '@/lib/journal-entry-ai';
import { formatDateDDMMYYYY } from '@/lib/utils/date-helpers';

interface MedicationGlassBoxProps {
  entry: JournalEntry;
  onUpdate: (id: string, aiResponse: JsonObject, contentText: string) => Promise<void>;
  onApprove: (id: string) => Promise<void>;
}

interface MedicationData {
  'Brand Name'?: string;
  'Generic Name'?: string;
  Dosage?: string;
  'Date Started'?: string;
  Reason?: string;
  'Side Effects'?: string;
  Feelings?: string;
  'Date Stopped'?: string;
  'Stop Reason'?: string;
  Notes?: string;
}

function extractMedicationData(entry: JournalEntry): MedicationData {
  // Primary: read from ai_response
  const ai = entry.ai_response as JsonObject | null;
  const persistedIntent = ai && typeof ai === 'object' ? ai._intent : null;
  if (
    ai &&
    typeof ai === 'object' &&
    (
      (isEntryIntent(persistedIntent) && persistedIntent === 'medication') ||
      'Brand Name' in ai ||
      'Generic Name' in ai ||
      'Dosage' in ai ||
      'Date Started' in ai ||
      'Reason' in ai ||
      'Side Effects' in ai ||
      'Feelings' in ai ||
      'Date Stopped' in ai ||
      'Stop Reason' in ai ||
      'Notes' in ai
    )
  ) {
    const result: MedicationData = {};
    if (ai['Brand Name']) result['Brand Name'] = String(ai['Brand Name']);
    if (ai['Generic Name']) result['Generic Name'] = String(ai['Generic Name']);
    if (ai.Dosage) result.Dosage = String(ai.Dosage);
    if (ai['Date Started']) result['Date Started'] = String(ai['Date Started']);
    if (ai.Reason) result.Reason = String(ai.Reason);
    if (ai['Side Effects']) result['Side Effects'] = String(ai['Side Effects']);
    if (ai.Feelings) result.Feelings = String(ai.Feelings);
    if (ai['Date Stopped']) result['Date Stopped'] = String(ai['Date Stopped']);
    if (ai['Stop Reason']) result['Stop Reason'] = String(ai['Stop Reason']);
    if (ai.Notes) result.Notes = String(ai.Notes);
    return result;
  }

  // Fallback: parse content as JSON (legacy entries)
  try {
    const parsed = JSON.parse(entry.content || '{}');
    if (typeof parsed === 'object' && parsed !== null) return parsed;
  } catch {
    // not JSON
  }

  // Final fallback: plain text as Notes
  return { Notes: entry.content };
}

function serializeToAiResponse(form: MedicationData): JsonObject {
  return {
    _intent: 'medication',
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
  } as JsonObject;
}

function serializeToContentText(form: MedicationData): string {
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

export function MedicationGlassBox({ entry, onUpdate, onApprove }: MedicationGlassBoxProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<MedicationData>(() => extractMedicationData(entry));
  const [isSaving, setIsSaving] = useState(false);

  const isApproved = entry.status === "approved";

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const aiResponse = serializeToAiResponse(formData);
      const contentText = serializeToContentText(formData);
      await onUpdate(entry.id, aiResponse, contentText);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save medication", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleApprove = async () => {
    try {
      setIsSaving(true);
      await onApprove(entry.id);
    } catch (error) {
       console.error("Failed to approve medication", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(extractMedicationData(entry));
    setIsEditing(false);
  };

  const handleChange = (field: keyof MedicationData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isEditing) {
    return (
      <div className="rounded-lg bg-calm-surface-raised p-4 shadow-sm border border-calm-border">
        <label className="mb-4 block text-sm font-medium text-calm-text">
          Editing Medication Record
        </label>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-calm-text-muted mb-1" htmlFor="med-brand-name">Brand Name</label>
              <input
                id="med-brand-name"
                type="text"
                className="w-full rounded-md border border-calm-border bg-white p-2 text-sm text-calm-text"
                value={formData['Brand Name'] || ''}
                onChange={(e) => handleChange('Brand Name', e.target.value)}
              />
            </div>
            <div>
               <label className="block text-xs font-medium text-calm-text-muted mb-1" htmlFor="med-generic-name">Generic Name</label>
               <input
                id="med-generic-name"
                type="text"
                className="w-full rounded-md border border-calm-border bg-white p-2 text-sm text-calm-text"
                value={formData['Generic Name'] || ''}
                onChange={(e) => handleChange('Generic Name', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-calm-text-muted mb-1" htmlFor="med-dosage">Dosage</label>
              <input
                id="med-dosage"
                type="text"
                className="w-full rounded-md border border-calm-border bg-white p-2 text-sm text-calm-text"
                value={formData.Dosage || ''}
                onChange={(e) => handleChange('Dosage', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-calm-text-muted mb-1" htmlFor="med-date-started">Date Started</label>
              <input
                id="med-date-started"
                type="text"
                className="w-full rounded-md border border-calm-border bg-white p-2 text-sm text-calm-text"
                value={formData['Date Started'] || ''}
                onChange={(e) => handleChange('Date Started', e.target.value)}
                placeholder="dd-mm-yyyy"
              />
            </div>
          </div>

          <div>
             <label className="block text-xs font-medium text-calm-text-muted mb-1" htmlFor="med-reason">Reason for taking</label>
              <input
                id="med-reason"
                type="text"
                className="w-full rounded-md border border-calm-border bg-white p-2 text-sm text-calm-text"
                value={formData.Reason || ''}
                onChange={(e) => handleChange('Reason', e.target.value)}
              />
          </div>

          <div>
             <label className="block text-xs font-medium text-calm-text-muted mb-1" htmlFor="med-side-effects">Side Effects</label>
              <textarea
                id="med-side-effects"
                className="w-full rounded-md border border-calm-border bg-white p-2 text-sm text-calm-text min-h-15"
                value={formData['Side Effects'] || ''}
                onChange={(e) => handleChange('Side Effects', e.target.value)}
              />
          </div>

          <div>
             <label className="block text-xs font-medium text-calm-text-muted mb-1" htmlFor="med-feelings">Emotions / Feelings</label>
              <textarea
                id="med-feelings"
                className="w-full rounded-md border border-calm-border bg-white p-2 text-sm text-calm-text min-h-15"
                value={formData.Feelings || ''}
                onChange={(e) => handleChange('Feelings', e.target.value)}
              />
          </div>

           <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-calm-text-muted mb-1" htmlFor="med-date-stopped">Date Stopped</label>
              <input
                id="med-date-stopped"
                type="text"
                className="w-full rounded-md border border-calm-border bg-white p-2 text-sm text-calm-text"
                value={formData['Date Stopped'] || ''}
                onChange={(e) => handleChange('Date Stopped', e.target.value)}
                placeholder="dd-mm-yyyy"
              />
            </div>
          </div>

          {formData['Date Stopped'] && (
            <div>
               <label className="block text-xs font-medium text-calm-text-muted mb-1" htmlFor="med-stop-reason">Reason for stopping</label>
                <input
                  id="med-stop-reason"
                  type="text"
                  className="w-full rounded-md border border-calm-border bg-white p-2 text-sm text-calm-text"
                  value={formData['Stop Reason'] || ''}
                  onChange={(e) => handleChange('Stop Reason', e.target.value)}
                />
            </div>
          )}

          <div>
             <label className="block text-xs font-medium text-calm-text-muted mb-1" htmlFor="med-note">Notes</label>
              <textarea
                id="med-note"
                className="w-full rounded-md border border-calm-border bg-white p-2 text-sm text-calm-text min-h-20"
                value={formData.Notes || ''}
                onChange={(e) => handleChange('Notes', e.target.value)}
              />
          </div>

        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={handleCancel}
            disabled={isSaving}
            className="rounded-md px-4 py-2 text-sm font-medium text-calm-text-muted hover:bg-calm-surface"
            style={{ minHeight: '44px' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-md bg-calm-blue px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
            style={{ minHeight: '44px' }}
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    );
  }

  const data = extractMedicationData(entry);

  return (
    <div className={`rounded-lg bg-calm-surface-raised p-4 shadow-sm border-l-4 ${isApproved ? "border-calm-green" : "border-calm-blue"} transition-all`}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-800">
            Medication
          </span>
          <span className={`text-xs ${isApproved ? "text-calm-green font-medium" : "text-calm-text-muted"}`}>
            {isApproved ? "Added" : "Draft"}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsEditing(true)}
            className="rounded-md px-3 py-1.5 text-xs font-medium text-calm-text hover:bg-calm-surface"
            style={{ minHeight: '44px' }}
          >
            Edit
          </button>
          {!isApproved && (
            <button
              onClick={handleApprove}
              disabled={isSaving}
              className="rounded-md bg-calm-green px-3 py-1.5 text-xs font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
              style={{ minHeight: '40px' }}
            >
              {isSaving ? "Adding..." : "Add"}
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3 text-sm text-calm-text leading-relaxed">
        {(data['Brand Name'] || data['Generic Name']) && (
           <div className="flex justify-between border-b border-calm-border pb-1">
             <span className="font-medium text-calm-text-muted text-xs uppercase tracking-wider">Medication</span>
             <span className="font-semibold text-calm-primary text-right">
               {data['Brand Name']}{data['Brand Name'] && data['Generic Name'] ? ' (' : ''}{data['Generic Name']}{data['Brand Name'] && data['Generic Name'] ? ')' : ''}
             </span>
           </div>
        )}
        {data.Dosage && (
           <div className="flex justify-between border-b border-calm-border pb-1">
             <span className="font-medium text-calm-text-muted text-xs uppercase tracking-wider">Dosage</span>
             <span>{data.Dosage}</span>
           </div>
        )}

        {data.Reason && (
          <div className="pt-1">
             <span className="block font-medium text-calm-text-muted text-xs uppercase tracking-wider mb-1">Reason</span>
             <p>{data.Reason}</p>
          </div>
        )}

        {Object.entries(data).map(([key, value]) => {
          if (['Brand Name', 'Generic Name', 'Dosage', 'Reason'].includes(key)) return null;
          if (!value) return null;

          const formattedKey = key;
          let displayValue: React.ReactNode = ['Date Started', 'Date Stopped'].includes(key)
            ? formatDateDDMMYYYY(String(value))
            : String(value);

          if (typeof value === 'object') {
            if (Array.isArray(value)) {
              displayValue = (
                <ul className="list-disc pl-5 space-y-1">
                  {value.map((item, index) => (
                    <li key={index}>
                      {typeof item === 'object' && item !== null ? (
                        <div className="space-y-1">
                          {Object.entries(item).map(([k, v]) => (
                            <div key={k}>
                              <span className="font-medium text-calm-text-muted">{k.replace(/_/g, ' ')}:</span> {String(v)}
                            </div>
                          ))}
                        </div>
                      ) : (
                        String(item)
                      )}
                    </li>
                  ))}
                </ul>
              );
            } else {
              displayValue = (
                <div className="space-y-1">
                  {Object.entries(value).map(([k, v]) => (
                    <div key={k}>
                      <span className="font-medium text-calm-text-muted">{k.replace(/_/g, ' ')}:</span> {String(v)}
                    </div>
                  ))}
                </div>
              );
            }
          }

          return (
             <div key={key} className="pt-1">
               <span className="block font-medium text-calm-text-muted text-xs uppercase tracking-wider mb-1">{formattedKey}</span>
               <div className="whitespace-pre-wrap">{displayValue}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
