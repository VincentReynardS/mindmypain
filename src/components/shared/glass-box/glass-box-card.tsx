"use client";

import { useState } from 'react';
import { JournalEntry, JournalEntryType } from '@/types/database';
import { SafeClinicalSummaryRender } from './renderers/safe-clinical-summary-render';
import { JournalEditForm } from './editors/journal-edit-form';
import { MedicationEditForm } from './editors/medication-edit-form';
import { AppointmentEditForm } from './editors/appointment-edit-form';
import { ScriptEditForm } from './editors/script-edit-form';
import { ClinicalSummaryEditForm } from './editors/clinical-summary-edit-form';

interface GlassBoxCardProps {
  entry: JournalEntry;
  onUpdate: (id: string, content: string) => Promise<void>;
  onApprove: (id: string) => Promise<void>;
  onUpdateAiResponse?: (id: string, aiResponse: object, contentText: string) => Promise<void>;
}

const TYPE_CONFIG: Record<JournalEntryType, { label: string; badgeClass: string }> = {
  raw_text: { label: '', badgeClass: '' },
  journal: { label: 'Journal', badgeClass: 'bg-calm-purple-soft text-calm-purple' },
  clinical_summary: { label: 'Summary', badgeClass: 'bg-calm-green-soft text-calm-green' },
  insight_card: { label: 'Insight', badgeClass: 'bg-calm-blue-soft text-calm-blue' },
};

type AiResponseShape = 'medication' | 'appointment' | 'script' | 'clinical_summary' | 'journal';

function getDynamicBadge(entry: JournalEntry): { label: string; badgeClass: string } {
  const config = TYPE_CONFIG[entry.entry_type] || TYPE_CONFIG.raw_text;

  if (entry.entry_type === 'journal' && entry.ai_response) {
    const ai = entry.ai_response;
    if (ai['Practitioner Name'] || ai['Visit Type'] || ai.Date) {
      return { label: 'Appointment', badgeClass: 'bg-indigo-100 text-indigo-700' };
    }
    if (ai['Brand Name'] || ai['Generic Name'] || ai.Dosage) {
      return { label: 'Medication', badgeClass: 'bg-amber-100 text-amber-800' };
    }
    if (ai.Name && ai.Filled !== undefined) {
      return { label: 'Script', badgeClass: 'bg-calm-blue-soft text-calm-blue' };
    }
  }

  return config;
}

function detectAiResponseShape(entry: JournalEntry): AiResponseShape {
  if (entry.entry_type === 'clinical_summary') return 'clinical_summary';
  if (entry.ai_response) {
    const ai = entry.ai_response;
    if (ai['Practitioner Name'] || ai['Visit Type']) return 'appointment';
    if (ai['Brand Name'] || ai['Generic Name'] || ai.Dosage) return 'medication';
    if (ai.Name && ai.Filled !== undefined) return 'script';
    if (ai.chief_complaint) return 'clinical_summary';
  }
  return 'journal';
}

function SafeMedicationRender({ aiResponse }: { aiResponse: any }) {
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
        if (!val) return null;
        return (
          <div key={key} className="text-calm-text">
            <span className="font-medium text-calm-primary block text-[10px] uppercase tracking-wider mb-0.5">{label}</span>
            <div className="text-sm">{String(val)}</div>
          </div>
        );
      })}
    </div>
  );
}

function SafeAppointmentRender({ aiResponse }: { aiResponse: any }) {
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
        if (!val) return null;
        return (
          <div key={key} className="text-calm-text">
            <span className="font-medium text-calm-primary block text-[10px] uppercase tracking-wider mb-0.5">{label}</span>
            <div className="text-sm">{String(val)}</div>
          </div>
        );
      })}
      {aiResponse['Admin Needs'] && aiResponse['Admin Needs'].length > 0 && (
        <div className="text-calm-text">
          <span className="font-medium text-calm-primary block text-[10px] uppercase tracking-wider mb-1">Admin Needs</span>
          <div className="flex flex-wrap gap-1">
            {aiResponse['Admin Needs'].map((need: string, idx: number) => (
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

function SafeScriptRender({ aiResponse }: { aiResponse: any }) {
  const fields = [
    { key: 'Name', label: 'Script / Referral' },
    { key: 'Date Prescribed', label: 'Date Prescribed' },
    { key: 'Notes', label: 'Notes' },
  ];

  return (
    <div className="space-y-2">
      {fields.map(({ key, label }) => {
        const val = aiResponse[key];
        if (!val) return null;
        return (
          <div key={key} className="text-calm-text">
            <span className="font-medium text-calm-primary block text-[10px] uppercase tracking-wider mb-0.5">{label}</span>
            <div className="text-sm">{String(val)}</div>
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

function SafeHealthJournalRender({ content, aiResponse }: { content: string; aiResponse?: any }) {
  try {
    const parsed = aiResponse || (content ? JSON.parse(content) : null);

    if (!parsed || typeof parsed !== 'object') {
       return <>{content}</>;
    }

    // We only expect specific keys
    const fields = [
      { key: 'Sleep', label: 'Sleep' },
      { key: 'Pain', label: 'Pain' },
      { key: 'Feeling', label: 'Feeling' },
      { key: 'Action', label: 'Action to Feel Better' },
      { key: 'Grateful', label: 'Grateful For' },
      { key: 'Medication', label: 'Medications' },
      { key: 'Mood', label: 'Mood' },
      { key: 'Note', label: 'Note' },
    ];

    return (
      <div className="space-y-3">
        {/* Health Data */}
        <div className="grid grid-cols-1 gap-2">
          {fields.map(({ key, label }) => {
            const val = parsed[key];
            if (val && typeof val === 'string' && val.trim() !== '') {
              return (
                <div key={key} className="text-calm-text">
                  <span className="font-medium text-calm-primary block text-[10px] uppercase tracking-wider mb-0.5">{label}</span>
                  <div className="text-sm">{val}</div>
                </div>
              );
            }
            return null;
          })}
        </div>

        {/* Appointments Section */}
        {parsed.Appointments && parsed.Appointments.length > 0 && (
          <div className="pt-2 border-t border-calm-border/30">
            <span className="font-semibold text-calm-primary block text-[10px] uppercase tracking-wider mb-2">Appointments Identified</span>
            <div className="space-y-2">
              {parsed.Appointments.map((appt: any, idx: number) => (
                <div key={idx} className="bg-calm-surface rounded p-2 text-xs border border-calm-border/20">
                  <div className="font-medium">{appt['Practitioner Name'] || 'Doctor'} - {appt['Visit Type'] || 'Consultation'}</div>
                  {appt.Date && <div className="text-calm-text-muted">{appt.Date} {appt.Time ? `@ ${appt.Time}` : ''}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Scripts Section */}
        {parsed.Scripts && parsed.Scripts.length > 0 && (
          <div className="pt-2 border-t border-calm-border/30">
            <span className="font-semibold text-calm-primary block text-[10px] uppercase tracking-wider mb-2">Scripts/Referrals Found</span>
            <div className="space-y-1">
              {parsed.Scripts.map((script: any, idx: number) => (
                <div key={idx} className="flex items-center gap-2 text-xs py-1">
                   <div className="h-1.5 w-1.5 rounded-full bg-calm-teal" />
                   <span className="font-medium">{script.Name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  } catch (error) {
    // Not JSON, fall back to text rendering
    return <>{content}</>;
  }
}


export function GlassBoxCard({ entry, onUpdate, onApprove, onUpdateAiResponse }: GlassBoxCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(entry.content);
  const [isSaving, setIsSaving] = useState(false);

  const config = getDynamicBadge(entry);
  const isApproved = entry.status === "approved";

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onUpdate(entry.id, editedContent);
      setIsEditing(false);
    } catch (error) {
      // Fail silently for now
    } finally {
      setIsSaving(false);
    }
  };

  const handleAiResponseSave = async (aiResponse: object, contentText: string) => {
    try {
      setIsSaving(true);
      if (onUpdateAiResponse) {
        await onUpdateAiResponse(entry.id, aiResponse, contentText);
      }
      setIsEditing(false);
    } catch (error) {
      // Fail silently for now
    } finally {
      setIsSaving(false);
    }
  };

  const handleApprove = async () => {
    try {
      setIsSaving(true);
      await onApprove(entry.id);
    } catch (error) {
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
        case 'clinical_summary':
          return <ClinicalSummaryEditForm aiResponse={entry.ai_response} onSave={handleAiResponseSave} onCancel={handleCancel} isSaving={isSaving} />;
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

      <div className="whitespace-pre-wrap text-sm text-calm-text leading-relaxed">
        {entry.entry_type === "journal" && entry.ai_response ? (
          // Dispatch to the right renderer based on ai_response shape
          entry.ai_response['Brand Name'] || entry.ai_response['Generic Name'] || entry.ai_response.Dosage ? (
            <SafeMedicationRender aiResponse={entry.ai_response} />
          ) : entry.ai_response['Practitioner Name'] || entry.ai_response['Visit Type'] ? (
            <SafeAppointmentRender aiResponse={entry.ai_response} />
          ) : entry.ai_response.Name && entry.ai_response.Filled !== undefined ? (
            <SafeScriptRender aiResponse={entry.ai_response} />
          ) : (
            <SafeHealthJournalRender content={entry.content} aiResponse={entry.ai_response} />
          )
        ) : entry.entry_type === "journal" ? (
          <SafeHealthJournalRender content={entry.content} aiResponse={entry.ai_response} />
        ) : entry.entry_type === "clinical_summary" && entry.ai_response ? (
          <SafeClinicalSummaryRender aiResponse={entry.ai_response} />
        ) : (
          entry.content
        )}
      </div>
    </div>
  );
}
