"use client";

import { useState } from 'react';
import { JsonObject, JournalEntry, JournalEntryType } from '@/types/database';
import { JournalEditForm } from './editors/journal-edit-form';
import { MedicationEditForm } from './editors/medication-edit-form';
import { AppointmentEditForm } from './editors/appointment-edit-form';
import { ScriptEditForm } from './editors/script-edit-form';
import { ImmunisationEditForm } from './editors/immunisation-edit-form';
import { ArchiveConfirmPopover } from '@/components/shared/archive-confirm-popover';
import { formatDateDDMMYYYY } from '@/lib/utils/date-helpers';

interface GlassBoxCardProps {
  entry: JournalEntry;
  onUpdate: (id: string, content: string) => Promise<void>;
  onApprove: (id: string) => Promise<void>;
  onUpdateAiResponse?: (id: string, aiResponse: JsonObject, contentText: string) => Promise<void>;
  onArchive?: (id: string) => Promise<void>;
}

const TYPE_CONFIG: Record<JournalEntryType, { label: string; badgeClass: string }> = {
  raw_text: { label: '', badgeClass: '' },
  journal: { label: 'Journal', badgeClass: 'bg-calm-purple-soft text-calm-purple' },
  insight_card: { label: 'Insight', badgeClass: 'bg-calm-blue-soft text-calm-blue' },
};

type AiResponseShape = 'medication' | 'appointment' | 'script' | 'immunisation' | 'journal';
type RecordValue = string | number | boolean | null | JsonObject | RecordValue[];

const asRecord = (value: unknown): Record<string, RecordValue> | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, RecordValue>;
};

const getString = (value: RecordValue | undefined): string | null => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const getArray = (value: RecordValue | undefined): Record<string, RecordValue>[] => {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is Record<string, RecordValue> => !!item && typeof item === 'object' && !Array.isArray(item))
    .map((item) => item as Record<string, RecordValue>);
};

const getStringArray = (value: RecordValue | undefined): string[] => {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
};

const BADGE_CONFIG: Record<AiResponseShape, { label: string; badgeClass: string }> = {
  appointment: { label: 'Appointment', badgeClass: 'bg-indigo-100 text-indigo-700' },
  immunisation: { label: 'Immunisation', badgeClass: 'bg-teal-100 text-teal-700' },
  medication: { label: 'Medication', badgeClass: 'bg-amber-100 text-amber-800' },
  script: { label: 'Script', badgeClass: 'bg-calm-blue-soft text-calm-blue' },
  journal: { label: 'Journal', badgeClass: 'bg-calm-purple-soft text-calm-purple' },
};

/**
 * Detects the semantic shape of a journal entry's ai_response.
 * Checks `_intent` first (set at parse time); falls back to field-sniffing for legacy entries.
 */
function detectAiResponseShape(entry: JournalEntry): AiResponseShape {
  const ai = asRecord(entry.ai_response);
  if (!ai) return 'journal';

  // Authoritative: intent persisted at parse time
  const intent = getString(ai._intent);
  if (intent && intent in BADGE_CONFIG) return intent as AiResponseShape;

  // Legacy fallback: infer from field presence
  if (getString(ai['Practitioner Name']) || getString(ai['Visit Type'])) return 'appointment';
  if (getString(ai['Vaccine Name'])) return 'immunisation';
  if (getString(ai['Brand Name']) || getString(ai['Generic Name']) || getString(ai.Dosage)) return 'medication';
  if (getString(ai.Name) && typeof ai.Filled === 'boolean') return 'script';
  return 'journal';
}

function getDynamicBadge(entry: JournalEntry): { label: string; badgeClass: string } {
  const config = TYPE_CONFIG[entry.entry_type] || TYPE_CONFIG.raw_text;
  if (entry.entry_type !== 'journal') return config;

  const shape = detectAiResponseShape(entry);
  return BADGE_CONFIG[shape];
}

const DATE_FIELDS = new Set(['Date', 'Date Started', 'Date Stopped', 'Date Prescribed', 'Date Given']);

function SafeMedicationRender({ aiResponse }: { aiResponse: Record<string, RecordValue> }) {
  const fields = [
    { key: 'Brand Name', label: 'Brand Name' },
    { key: 'Generic Name', label: 'Generic Name' },
    { key: 'Dosage', label: 'Dosage' },
    { key: 'Date Started', label: 'Date Started' },
    { key: 'Reason', label: 'Reason' },
    { key: 'Side Effects', label: 'Side Effects' },
    { key: 'Feelings', label: 'Feelings' },
    { key: 'Date Stopped', label: 'Date Stopped' },
    { key: 'Stop Reason', label: 'Stop Reason' },
    { key: 'Notes', label: 'Notes' },
  ];

  return (
    <div className="space-y-2">
      {fields.map(({ key, label }) => {
        const val = aiResponse[key];
        const raw = getString(val);
        if (!raw) return null;
        const display = DATE_FIELDS.has(key) ? formatDateDDMMYYYY(raw) : raw;
        return (
          <div key={key} className="text-calm-text">
            <span className="font-medium text-calm-primary block text-[10px] uppercase tracking-wider mb-0.5">{label}</span>
            <div className="text-sm">{display}</div>
          </div>
        );
      })}
    </div>
  );
}

function SafeAppointmentRender({ aiResponse }: { aiResponse: Record<string, RecordValue> }) {
  const fields = [
    { key: 'Practitioner Name', label: 'Practitioner' },
    { key: 'Visit Type', label: 'Visit Type' },
    { key: 'Profession', label: 'Profession' },
    { key: 'Date', label: 'Date' },
    { key: 'Location', label: 'Location' },
    { key: 'Reason', label: 'Reason' },
    { key: 'Questions', label: 'Questions to Ask' },
    { key: 'Outcomes', label: 'Outcomes' },
    { key: 'Follow-up Questions', label: 'Follow-up Questions' },
    { key: 'Notes', label: 'Notes' },
  ];

  return (
    <div className="space-y-2">
      {fields.map(({ key, label }) => {
        const val = aiResponse[key];
        const raw = getString(val);
        if (!raw) return null;
        const display = DATE_FIELDS.has(key) ? formatDateDDMMYYYY(raw) : raw;
        return (
          <div key={key} className="text-calm-text">
            <span className="font-medium text-calm-primary block text-[10px] uppercase tracking-wider mb-0.5">{label}</span>
            <div className="text-sm">{display}</div>
          </div>
        );
      })}
      {getStringArray(aiResponse['Admin Needs']).length > 0 && (
        <div className="text-calm-text">
          <span className="font-medium text-calm-primary block text-[10px] uppercase tracking-wider mb-1">Admin Needs</span>
          <div className="flex flex-wrap gap-1">
            {getStringArray(aiResponse['Admin Needs']).map((need, idx: number) => (
              <span key={idx} className="bg-calm-surface text-calm-text text-xs px-2 py-1 rounded-md border border-calm-border">
                {need}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SafeScriptRender({ aiResponse }: { aiResponse: Record<string, RecordValue> }) {
  const fields = [
    { key: 'Name', label: 'Script / Referral' },
    { key: 'Date Prescribed', label: 'Date Prescribed' },
    { key: 'Notes', label: 'Notes' },
  ];

  return (
    <div className="space-y-2">
      {fields.map(({ key, label }) => {
        const val = aiResponse[key];
        const raw = getString(val);
        if (!raw) return null;
        const display = DATE_FIELDS.has(key) ? formatDateDDMMYYYY(raw) : raw;
        return (
          <div key={key} className="text-calm-text">
            <span className="font-medium text-calm-primary block text-[10px] uppercase tracking-wider mb-0.5">{label}</span>
            <div className="text-sm">{display}</div>
          </div>
        );
      })}
      <div className="text-calm-text">
        <span className="font-medium text-calm-primary block text-[10px] uppercase tracking-wider mb-0.5">Status</span>
        <div className="text-sm">{aiResponse.Filled ? 'Filled' : 'To Be Filled'}</div>
      </div>
    </div>
  );
}

function SafeImmunisationRender({ aiResponse }: { aiResponse: Record<string, RecordValue> }) {
  const fields = [
    { key: 'Vaccine Name', label: 'Vaccine Name' },
    { key: 'Date Given', label: 'Date Given' },
    { key: 'Brand Name', label: 'Brand Name' },
  ];

  return (
    <div className="space-y-2">
      {fields.map(({ key, label }) => {
        const val = aiResponse[key];
        const raw = getString(val);
        if (!raw) return null;
        const display = DATE_FIELDS.has(key) ? formatDateDDMMYYYY(raw) : raw;
        return (
          <div key={key} className="text-calm-text">
            <span className="font-medium text-calm-primary block text-[10px] uppercase tracking-wider mb-0.5">{label}</span>
            <div className="text-sm">{display}</div>
          </div>
        );
      })}
    </div>
  );
}

function parseJournalRecord(content: string, aiResponse?: unknown): Record<string, RecordValue> | null {
  const direct = asRecord(aiResponse);
  if (direct) return direct;
  if (!content) return null;
  try {
    return asRecord(JSON.parse(content));
  } catch {
    return null;
  }
}

function SafeHealthJournalRender({ content, aiResponse }: { content: string; aiResponse?: unknown }) {
  const parsed = parseJournalRecord(content, aiResponse);
  if (!parsed) return <>{content}</>;

  const fields = [
    { key: 'Sleep', label: 'Sleep' },
    { key: 'Pain', label: 'Pain' },
    { key: 'Feeling', label: 'Feeling' },
    { key: 'Action', label: 'Action to Feel Better' },
    { key: 'Grateful', label: 'Grateful For' },
    { key: 'Medication', label: 'Medications' },
    { key: 'Mood', label: 'Mood' },
    { key: 'Note', label: 'Note' },
  ] as const;

  const appointments = getArray(parsed.Appointments);
  const scripts = getArray(parsed.Scripts);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-2">
        {fields.map(({ key, label }) => {
          const display = getString(parsed[key]);
          if (!display) return null;
          return (
            <div key={key} className="text-calm-text">
              <span className="font-medium text-calm-primary block text-[10px] uppercase tracking-wider mb-0.5">{label}</span>
              <div className="text-sm">{display}</div>
            </div>
          );
        })}
      </div>

      {appointments.length > 0 && (
        <div className="pt-2 border-t border-calm-border/30">
          <span className="font-semibold text-calm-primary block text-[10px] uppercase tracking-wider mb-2">Appointments Identified</span>
          <div className="space-y-2">
            {appointments.map((appt, idx: number) => (
              <div key={idx} className="bg-calm-surface rounded p-2 text-xs border border-calm-border/20">
                <div className="font-medium">
                  {getString(appt['Practitioner Name']) || 'Doctor'} - {getString(appt['Visit Type']) || 'Consultation'}
                </div>
                {getString(appt.Date) && (
                  <div className="text-calm-text-muted">
                    {formatDateDDMMYYYY(getString(appt.Date)!)} {getString(appt.Time) ? `@ ${getString(appt.Time)}` : ''}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {scripts.length > 0 && (
        <div className="pt-2 border-t border-calm-border/30">
          <span className="font-semibold text-calm-primary block text-[10px] uppercase tracking-wider mb-2">Scripts/Referrals Found</span>
          <div className="space-y-1.5">
            {scripts.map((script, idx: number) => (
              <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-calm-border/10 last:border-0">
                <div className="flex items-center gap-2 pr-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-calm-teal shrink-0" />
                  <span className="font-medium line-clamp-2">{getString(script.Name) || 'Script / Referral'}</span>
                </div>
                <span className={`shrink-0 px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider font-medium border ${script.Filled ? 'bg-calm-green-soft text-calm-green border-calm-green/20' : 'bg-calm-blue-soft text-calm-blue border-calm-blue/20'}`}>
                  {script.Filled ? 'Filled' : 'To Be Filled'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


function renderByShape(shape: AiResponseShape, content: string, aiResponse: Record<string, RecordValue>) {
  switch (shape) {
    case 'appointment': return <SafeAppointmentRender aiResponse={aiResponse} />;
    case 'immunisation': return <SafeImmunisationRender aiResponse={aiResponse} />;
    case 'medication': return <SafeMedicationRender aiResponse={aiResponse} />;
    case 'script': return <SafeScriptRender aiResponse={aiResponse} />;
    case 'journal':
    default: return <SafeHealthJournalRender content={content} aiResponse={aiResponse} />;
  }
}

export function GlassBoxCard({ entry, onUpdate, onApprove, onUpdateAiResponse, onArchive }: GlassBoxCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(entry.content);
  const [isSaving, setIsSaving] = useState(false);
  const config = getDynamicBadge(entry);
  const isApproved = entry.status === "approved";
  const entryAiResponse = asRecord(entry.ai_response);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onUpdate(entry.id, editedContent);
      setIsEditing(false);
    } catch {
      // Fail silently for now
    } finally {
      setIsSaving(false);
    }
  };

  const handleAiResponseSave = async (aiResponse: object, contentText: string) => {
    try {
      setIsSaving(true);
      if (onUpdateAiResponse) {
        const normalized = asRecord(aiResponse);
        if (!normalized) {
          throw new Error('Invalid AI response payload');
        }
        await onUpdateAiResponse(entry.id, normalized as JsonObject, contentText);
      }
      setIsEditing(false);
    } catch {
      // Fail silently for now
    } finally {
      setIsSaving(false);
    }
  };

  const handleApprove = async () => {
    try {
      setIsSaving(true);
      await onApprove(entry.id);
    } catch {
      // Fail silently for now
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedContent(entry.content);
    setIsEditing(false);
  };

  // Edit mode: dispatch to shape-aware form editors
  if (isEditing) {
    const shape = detectAiResponseShape(entry);

    // If we have ai_response and a matching editor, use the structured form
    if (entry.ai_response && onUpdateAiResponse) {
      switch (shape) {
        case 'journal':
          return <JournalEditForm aiResponse={entry.ai_response} onSave={handleAiResponseSave} onCancel={handleCancel} isSaving={isSaving} />;
        case 'medication':
          return <MedicationEditForm aiResponse={entry.ai_response} onSave={handleAiResponseSave} onCancel={handleCancel} isSaving={isSaving} />;
        case 'appointment':
          return <AppointmentEditForm aiResponse={entry.ai_response} onSave={handleAiResponseSave} onCancel={handleCancel} isSaving={isSaving} />;
        case 'script':
          return <ScriptEditForm aiResponse={entry.ai_response} onSave={handleAiResponseSave} onCancel={handleCancel} isSaving={isSaving} />;
        case 'immunisation':
          return <ImmunisationEditForm aiResponse={entry.ai_response} onSave={handleAiResponseSave} onCancel={handleCancel} isSaving={isSaving} />;
      }
    }

    // Fallback: plain textarea for entries without ai_response (original behavior)
    return (
      <div className="rounded-lg bg-calm-surface-raised p-4 shadow-sm border border-calm-border">
        <label className="mb-4 block text-sm font-medium text-calm-text">
          Editing {config.label || 'Journal Entry'}
        </label>
        <textarea
          className="w-full min-h-37.5 rounded-md border border-calm-border bg-white p-3 text-sm text-calm-text focus:border-calm-primary focus:ring-1 focus:ring-calm-primary"
          value={editedContent}
          onChange={(e) => setEditedContent(e.target.value)}
          disabled={isSaving}
        />
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={handleCancel}
            disabled={isSaving}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-calm-text-muted hover:bg-calm-surface"
            style={{ minHeight: '44px' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-md bg-calm-blue px-3 py-1.5 text-sm font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
            style={{ minHeight: '44px' }}
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg bg-calm-surface-raised p-4 shadow-sm border-l-4 ${isApproved ? "border-calm-green" : "border-calm-primary"} transition-all`}>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${config.badgeClass}`}>
            {config.label}
          </span>
          <span className={`text-xs ${isApproved ? "text-calm-green font-medium" : "text-calm-text-muted"}`}>
            {isApproved ? "Added" : "Draft"}
          </span>
        </div>
        <div className="flex gap-2 items-center">
          {onArchive && (
            <ArchiveConfirmPopover onArchive={() => onArchive(entry.id)} disabled={isSaving} />
          )}
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

      <div className="whitespace-pre-wrap text-sm text-calm-text leading-relaxed">
        {entry.entry_type === "journal" && entryAiResponse ? (
          renderByShape(detectAiResponseShape(entry), entry.content, entryAiResponse)
        ) : entry.entry_type === "journal" ? (
          <SafeHealthJournalRender content={entry.content} aiResponse={entryAiResponse} />
        ) : (
          entry.content
        )}
      </div>
    </div>
  );
}
