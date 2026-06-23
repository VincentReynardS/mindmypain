"use client";

import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { JournalEntry } from '@/types/database';

interface TeamMemberGlassBoxProps {
  entry: JournalEntry;
  onUpdate: (id: string, content: string) => Promise<void>;
  onApprove: (id: string) => Promise<void>;
}

interface TeamMemberData {
  Profession?: string;
  Name?: string;
  Address?: string;
  Email?: string;
  Phone?: string;
}

function parseContent(content: string): TeamMemberData {
  try {
    return JSON.parse(content || '{}');
  } catch {
    return {};
  }
}

function resolveTeamMemberData(entry: JournalEntry): TeamMemberData {
  const ai = entry.ai_response as TeamMemberData | null;
  if (ai && (ai.Profession || ai.Name || ai.Address || ai.Email || ai.Phone)) {
    return ai;
  }
  return parseContent(entry.content);
}

export function TeamMemberGlassBox({ entry, onUpdate, onApprove }: TeamMemberGlassBoxProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<TeamMemberData>(() => resolveTeamMemberData(entry));
  const [isSaving, setIsSaving] = useState(false);

  const isApproved = entry.status === "approved";

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onUpdate(entry.id, JSON.stringify(formData));
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save team member", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleApprove = async () => {
    try {
      setIsSaving(true);
      await onApprove(entry.id);
    } catch (error) {
      console.error("Failed to approve team member", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(resolveTeamMemberData(entry));
    setIsEditing(false);
  };

  const handleChange = (field: keyof TeamMemberData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isEditing) {
    const inputClass = "w-full rounded-md border border-calm-border bg-white p-2 text-sm text-calm-text";
    const labelClass = "block text-xs font-medium text-calm-text-muted mb-1";
    return (
      <div className="rounded-lg bg-calm-surface-raised p-4 shadow-sm border border-calm-border">
        <label className="mb-4 block text-sm font-medium text-calm-text">
          Editing Care Team Member
        </label>

        <div className="space-y-4">
          <div>
            <label className={labelClass} htmlFor="tm-profession">Profession</label>
            <input id="tm-profession" type="text" className={inputClass}
              value={formData.Profession || ''} onChange={(e) => handleChange('Profession', e.target.value)} />
          </div>
          <div>
            <label className={labelClass} htmlFor="tm-name">Name</label>
            <input id="tm-name" type="text" className={inputClass}
              value={formData.Name || ''} onChange={(e) => handleChange('Name', e.target.value)} />
          </div>
          <div>
            <label className={labelClass} htmlFor="tm-address">Address</label>
            <input id="tm-address" type="text" className={inputClass}
              value={formData.Address || ''} onChange={(e) => handleChange('Address', e.target.value)} />
          </div>
          <div>
            <label className={labelClass} htmlFor="tm-email">Email</label>
            <input id="tm-email" type="email" className={inputClass}
              value={formData.Email || ''} onChange={(e) => handleChange('Email', e.target.value)} />
          </div>
          <div>
            <label className={labelClass} htmlFor="tm-phone">Phone</label>
            <input id="tm-phone" type="tel" className={inputClass}
              value={formData.Phone || ''} onChange={(e) => handleChange('Phone', e.target.value)} />
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

  const data = resolveTeamMemberData(entry);
  const fields: { key: keyof TeamMemberData; label: string }[] = [
    { key: 'Profession', label: 'Profession' },
    { key: 'Name', label: 'Name' },
    { key: 'Address', label: 'Address' },
    { key: 'Email', label: 'Email' },
    { key: 'Phone', label: 'Phone' },
  ];

  return (
    <div className={`rounded-lg bg-calm-surface-raised p-4 shadow-sm border-l-4 ${isApproved ? "border-calm-green" : "border-calm-blue"} transition-all`}>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-calm-green-soft text-calm-green">
            Care Team
          </span>
          <span className={`text-xs ${isApproved ? "text-calm-green font-medium" : "text-calm-text-muted"}`}>
            {isApproved ? "Added" : "Draft"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Contact/booking shortcut actions are temporarily disabled. */}
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-calm-text hover:bg-calm-surface"
            style={{ minHeight: '40px' }}
          >
            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
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

      <div className="space-y-2">
        {fields.map(({ key, label }) => {
          const val = data[key];
          if (!val) return null;
          return (
            <div key={key} className="text-calm-text">
              <span className="font-medium text-calm-text-muted block text-[10px] uppercase tracking-wider mb-0.5">{label}</span>
              <div className="text-sm">{String(val)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
