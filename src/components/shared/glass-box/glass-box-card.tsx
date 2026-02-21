"use client";

import { useState } from 'react';
import { JournalEntry, JournalEntryType } from '@/types/database';
import { SafeClinicalSummaryRender } from './renderers/safe-clinical-summary-render';

interface GlassBoxCardProps {
  entry: JournalEntry;
  onUpdate: (id: string, content: string) => Promise<void>;
  onApprove: (id: string) => Promise<void>;
}

const TYPE_CONFIG: Record<JournalEntryType, { label: string; badgeClass: string }> = {
  raw_text: { label: '', badgeClass: '' },
  agendas: { label: 'Agenda', badgeClass: 'bg-calm-purple-soft text-calm-purple' },
  clinical_summary: { label: 'Summary', badgeClass: 'bg-calm-green-soft text-calm-green' },
  insight_card: { label: 'Insight', badgeClass: 'bg-calm-blue-soft text-calm-blue' },
};

function SafeAgendaRender({ content }: { content: string }) {
  try {
    // Attempt to parse content as JSON
    // Note: The content might be a raw string if edited by user, or JSON if from AI
    const parsed = JSON.parse(content);
    
    if (parsed && Array.isArray(parsed.agenda_items)) {
      return (
        <ul className="list-disc pl-5 space-y-1">
          {parsed.agenda_items.map((item: any, idx: number) => (
            <li key={idx}>
              <span className="font-medium text-calm-primary">{item.category}:</span> {item.item}
            </li>
          ))}
        </ul>
      );
    } else if (parsed && parsed.Name !== undefined) {
      return (
        <div className="space-y-1">
          <p><span className="font-medium text-calm-primary">Script/Referral:</span> {parsed.Name}</p>
          {parsed['Date Prescribed'] && <p><span className="font-medium text-calm-primary">Date:</span> {parsed['Date Prescribed']}</p>}
          <p><span className="font-medium text-calm-primary">Status:</span> {parsed.Filled ? "Filled" : "To Be Filled"}</p>
          {parsed.Notes && <p><span className="font-medium text-calm-primary">Notes:</span> {parsed.Notes}</p>}
        </div>
      );
    }
  } catch (_e) {
    // Not JSON, fall back to text rendering
  }
  
  return <>{content}</>;
}


export function GlassBoxCard({ entry, onUpdate, onApprove }: GlassBoxCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(entry.content);
  const [isSaving, setIsSaving] = useState(false);

  // ... (existing code for TYPE_CONFIG, handleSave, handleApprove, handleCancel, isEditing check) ...

  const config = TYPE_CONFIG[entry.entry_type] || TYPE_CONFIG.raw_text;

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onUpdate(entry.id, editedContent);
      setIsEditing(false);
    } catch (error) {
      // Fail silently for now, or add toast later
    } finally {
      setIsSaving(false);
    }
  };

  const handleApprove = async () => {
    try {
      setIsSaving(true);
      await onApprove(entry.id);
    } catch (error) {
      // Fail silently for now, or add toast later
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedContent(entry.content);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="rounded-lg bg-calm-surface-raised p-4 shadow-sm border border-calm-border">
        <label className="mb-2 block text-sm font-medium text-calm-text">
          Editing {config.label}
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
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-md bg-calm-blue px-3 py-1.5 text-sm font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    );
  }

  const isApproved = entry.status === "approved";

  return (
    <div className={`rounded-lg bg-calm-surface-raised p-4 shadow-sm border-l-4 ${isApproved ? "border-calm-green" : "border-calm-primary"} transition-all`}>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${config.badgeClass}`}>
            {config.label}
          </span>
          <span className={`text-xs ${isApproved ? "text-calm-green font-medium" : "text-calm-text-muted"}`}>
            {isApproved ? "Approved" : "Draft"}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsEditing(true)}
            className="rounded-md px-3 py-1.5 text-xs font-medium text-calm-text hover:bg-calm-surface"
          >
            Edit
          </button>
          {!isApproved && (
            <button
              onClick={handleApprove}
              disabled={isSaving}
              className="rounded-md bg-calm-green px-3 py-1.5 text-xs font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
            >
              {isSaving ? "Approving..." : "Approve"}
            </button>
          )}
        </div>
      </div>
      
      <div className="whitespace-pre-wrap text-sm text-calm-text leading-relaxed">
        {entry.entry_type === "agendas" ? (
          <SafeAgendaRender content={entry.content} />
        ) : entry.entry_type === "clinical_summary" ? (
          <SafeClinicalSummaryRender content={entry.content || ''} />
        ) : (
          entry.content
        )}
      </div>
    </div>
  );
}
