"use client";

import { useState } from 'react';

const MOOD_OPTIONS = [
  'Excellent', 'Fantastic', 'Happy', 'Great', 'Good', 'Joyful',
  'Ok', 'Content', 'Grateful', 'Flat', 'Tired', 'Sad',
  'Annoyed', 'Frustrated', 'Anxious', 'Groggy', 'Sore',
  'Achy', 'Nauseated', 'Terrible', 'Sick', 'Angry',
] as const;

interface JournalFormData {
  Sleep: string;
  Pain: string;
  Feeling: string;
  Action: string;
  Grateful: string;
  Medication: string;
  Mood: string;
  Note: string;
}

interface JournalEditFormProps {
  aiResponse: Record<string, unknown>;
  onSave: (aiResponse: object, contentText: string) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
}

function parseAiResponse(ai: Record<string, unknown>): JournalFormData {
  return {
    Sleep: String(ai.Sleep ?? ''),
    Pain: String(ai.Pain ?? ''),
    Feeling: String(ai.Feeling ?? ''),
    Action: String(ai.Action ?? ''),
    Grateful: String(ai.Grateful ?? ''),
    Medication: String(ai.Medication ?? ''),
    Mood: String(ai.Mood ?? ''),
    Note: String(ai.Note ?? ''),
  };
}

function serializeToAiResponse(form: JournalFormData, originalAiResponse: Record<string, unknown>): object {
  return {
    Sleep: form.Sleep || null,
    Pain: form.Pain || null,
    Feeling: form.Feeling || null,
    Action: form.Action || null,
    Grateful: form.Grateful || null,
    Medication: form.Medication || null,
    Mood: form.Mood || null,
    Note: form.Note || null,
    // Preserve existing Appointments/Scripts — edited via their dedicated entry types
    Appointments: originalAiResponse.Appointments ?? null,
    Scripts: originalAiResponse.Scripts ?? null,
  };
}

function serializeToContentText(form: JournalFormData): string {
  const lines: string[] = [];
  if (form.Sleep) lines.push(`Sleep: ${form.Sleep}`);
  if (form.Pain) lines.push(`Pain: ${form.Pain}`);
  if (form.Mood) lines.push(`Mood: ${form.Mood}`);
  if (form.Feeling) lines.push(`Feeling: ${form.Feeling}`);
  if (form.Action) lines.push(`Action: ${form.Action}`);
  if (form.Grateful) lines.push(`Grateful: ${form.Grateful}`);
  if (form.Medication) lines.push(`Medication: ${form.Medication}`);
  if (form.Note) lines.push(`Note: ${form.Note}`);
  return lines.join('\n');
}

const inputClass = "w-full rounded-md border border-calm-border bg-white p-2 text-sm text-calm-text focus:border-calm-primary focus:ring-1 focus:ring-calm-primary";
const labelClass = "block text-xs font-medium text-calm-text-muted mb-1";

export function JournalEditForm({ aiResponse, onSave, onCancel, isSaving }: JournalEditFormProps) {
  const [form, setForm] = useState<JournalFormData>(() => parseAiResponse(aiResponse));

  const handleField = (field: keyof JournalFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    const aiResp = serializeToAiResponse(form, aiResponse);
    const contentText = serializeToContentText(form);
    await onSave(aiResp, contentText);
  };

  return (
    <div className="rounded-lg bg-calm-surface-raised p-4 shadow-sm border border-calm-border">
      <label className="mb-4 block text-sm font-medium text-calm-text">
        Editing Daily Health Journal
      </label>

      <div className="space-y-4">
        {/* Sleep & Pain — short inputs in a row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass} htmlFor="journal-sleep">Sleep</label>
            <input
              id="journal-sleep"
              type="text"
              className={inputClass}
              placeholder="e.g. 7 hours, restful"
              value={form.Sleep}
              onChange={(e) => handleField('Sleep', e.target.value)}
              disabled={isSaving}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="journal-pain">Pain</label>
            <input
              id="journal-pain"
              type="text"
              className={inputClass}
              placeholder="e.g. 4/10"
              value={form.Pain}
              onChange={(e) => handleField('Pain', e.target.value)}
              disabled={isSaving}
            />
          </div>
        </div>

        {/* Mood — select dropdown */}
        <div>
          <label className={labelClass} htmlFor="journal-mood">Mood</label>
          <select
            id="journal-mood"
            className={inputClass}
            value={form.Mood}
            onChange={(e) => handleField('Mood', e.target.value)}
            disabled={isSaving}
          >
            <option value="">Select mood...</option>
            {MOOD_OPTIONS.map((mood) => (
              <option key={mood} value={mood}>{mood}</option>
            ))}
          </select>
        </div>

        {/* Feeling — textarea */}
        <div>
          <label className={labelClass} htmlFor="journal-feeling">Feeling</label>
          <textarea
            id="journal-feeling"
            className={`${inputClass} min-h-15`}
            placeholder="Right now I am feeling..."
            value={form.Feeling}
            onChange={(e) => handleField('Feeling', e.target.value)}
            disabled={isSaving}
          />
        </div>

        {/* Action — textarea */}
        <div>
          <label className={labelClass} htmlFor="journal-action">Action to Feel Better</label>
          <textarea
            id="journal-action"
            className={`${inputClass} min-h-15`}
            placeholder="What can I do to feel better today?"
            value={form.Action}
            onChange={(e) => handleField('Action', e.target.value)}
            disabled={isSaving}
          />
        </div>

        {/* Grateful — textarea */}
        <div>
          <label className={labelClass} htmlFor="journal-grateful">Grateful For</label>
          <textarea
            id="journal-grateful"
            className={`${inputClass} min-h-15`}
            placeholder="I am grateful for..."
            value={form.Grateful}
            onChange={(e) => handleField('Grateful', e.target.value)}
            disabled={isSaving}
          />
        </div>

        {/* Medication — input */}
        <div>
          <label className={labelClass} htmlFor="journal-medication">Medication</label>
          <input
            id="journal-medication"
            type="text"
            className={inputClass}
            placeholder="Morning, Midday, Evening..."
            value={form.Medication}
            onChange={(e) => handleField('Medication', e.target.value)}
            disabled={isSaving}
          />
        </div>

        {/* Note — textarea */}
        <div>
          <label className={labelClass} htmlFor="journal-note">Note</label>
          <textarea
            id="journal-note"
            className={`${inputClass} min-h-20`}
            placeholder="Tasks, reminders, general thoughts..."
            value={form.Note}
            onChange={(e) => handleField('Note', e.target.value)}
            disabled={isSaving}
          />
        </div>

      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={onCancel}
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

// Export helpers for testing
export { parseAiResponse, serializeToAiResponse, serializeToContentText, MOOD_OPTIONS };
