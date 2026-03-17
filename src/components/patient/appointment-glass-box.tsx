"use client";

import { useState } from 'react';
import { JournalEntry } from '@/types/database';
import { formatDateDDMMYYYY, toYYYYMMDD } from '@/lib/utils/date-helpers';

interface AppointmentGlassBoxProps {
  entry: JournalEntry;
  onUpdate: (id: string, content: string) => Promise<void>;
  onApprove: (id: string) => Promise<void>;
}

interface AppointmentData {
  Date?: string;
  Time?: string;
  Profession?: string;
  'Practitioner Name'?: string;
  'Visit Type'?: string;
  Mode?: 'In-person' | 'Telehealth' | string;
  Address?: string;
  Location?: string; // Legacy fallback
  Reason?: string;
  'Admin Needs'?: string[];
  Questions?: string;
  'Repeat Prescriptions'?: string[];
  Outcomes?: string;
  'Follow-up Questions'?: string;
  Notes?: string;
}

const ADMIN_NEEDS_OPTIONS = ['Repeat Prescription', 'Medical Certificate', 'Specialist Referral', 'Pathology Referral'];
const MODE_OPTIONS = ['In-person', 'Telehealth'] as const;
type AdminNeedOption = typeof ADMIN_NEEDS_OPTIONS[number];
const LEGACY_ADMIN_NEEDS_MAP: Record<string, typeof ADMIN_NEEDS_OPTIONS[number]> = {
  Referral: 'Specialist Referral',
  Prescription: 'Repeat Prescription',
  'Medical Certificate': 'Medical Certificate',
  'Imaging Request': 'Pathology Referral',
};


function parseContent(content: string): AppointmentData {
  try {
    return JSON.parse(content || '{}');
  } catch {
    return { Notes: content }; // Fallback to raw text if not JSON
  }
}

function isAdminNeedOption(value: string): value is AdminNeedOption {
  return (ADMIN_NEEDS_OPTIONS as readonly string[]).includes(value);
}

function normalizeAdminNeeds(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const normalized = value
    .map(String)
    .map((need) => LEGACY_ADMIN_NEEDS_MAP[need] ?? need)
    .filter(isAdminNeedOption);
  return normalized.length > 0 ? Array.from(new Set(normalized)) : undefined;
}

function normalizeAppointmentData(data: AppointmentData): AppointmentData {
  const normalized: AppointmentData = { ...data };
  if (!normalized.Address && normalized.Location) {
    normalized.Address = normalized.Location;
  }
  const adminNeeds = normalizeAdminNeeds(normalized['Admin Needs']);
  if (adminNeeds) {
    normalized['Admin Needs'] = adminNeeds;
  }
  return normalized;
}

function resolveAppointmentData(entry: JournalEntry): AppointmentData {
  const ai = entry.ai_response as AppointmentData | null;
  if (ai && (ai['Practitioner Name'] || ai['Visit Type'] || ai.Date)) {
    return normalizeAppointmentData(ai);
  }
  return normalizeAppointmentData(parseContent(entry.content));
}

export function AppointmentGlassBox({ entry, onUpdate, onApprove }: AppointmentGlassBoxProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<AppointmentData>(() => resolveAppointmentData(entry));
  const [isSaving, setIsSaving] = useState(false);
  const [newPrescription, setNewPrescription] = useState('');

  const isApproved = entry.status === "approved";

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onUpdate(entry.id, JSON.stringify(formData));
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save appointment", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleApprove = async () => {
    try {
      setIsSaving(true);
      await onApprove(entry.id);
    } catch (error) {
       console.error("Failed to approve appointment", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(resolveAppointmentData(entry));
    setIsEditing(false);
  };

  const handleChange = (field: keyof AppointmentData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAdminNeedToggle = (need: string) => {
    setFormData(prev => {
      const current = prev['Admin Needs'] || [];
      const updated = current.includes(need)
        ? current.filter(n => n !== need)
        : [...current, need];
      return { ...prev, 'Admin Needs': updated };
    });
  };

  const addPrescription = () => {
    const trimmed = newPrescription.trim();
    if (!trimmed) return;
    setFormData(prev => ({
      ...prev,
      'Repeat Prescriptions': [...(prev['Repeat Prescriptions'] || []), trimmed],
    }));
    setNewPrescription('');
  };

  const removePrescription = (index: number) => {
    setFormData(prev => ({
      ...prev,
      'Repeat Prescriptions': (prev['Repeat Prescriptions'] || []).filter((_, i) => i !== index),
    }));
  };

  if (isEditing) {
    return (
      <div className="rounded-lg bg-calm-surface-raised p-4 shadow-sm border border-calm-border">
        <label className="mb-4 block text-sm font-medium text-calm-text">
          Editing Appointment Record
        </label>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-calm-text-muted mb-1" htmlFor="apt-date">Date</label>
              <input
                id="apt-date"
                type="date"
                className="w-full rounded-md border border-calm-border bg-white p-2 text-sm text-calm-text"
                value={toYYYYMMDD(formData.Date || '')}
                onChange={(e) => handleChange('Date', formatDateDDMMYYYY(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-calm-text-muted mb-1" htmlFor="apt-time">Time</label>
              <input
                id="apt-time"
                type="time"
                className="w-full rounded-md border border-calm-border bg-white p-2 text-sm text-calm-text"
                value={formData.Time || ''}
                onChange={(e) => handleChange('Time', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
               <label className="block text-xs font-medium text-calm-text-muted mb-1" htmlFor="apt-type">Visit Type</label>
               <input
                id="apt-type"
                type="text"
                className="w-full rounded-md border border-calm-border bg-white p-2 text-sm text-calm-text"
                value={formData['Visit Type'] || ''}
                onChange={(e) => handleChange('Visit Type', e.target.value)}
                placeholder="e.g., Initial, Follow-up"
              />
            </div>
             <div>
              <label className="block text-xs font-medium text-calm-text-muted mb-1" htmlFor="apt-prof">Profession</label>
              <input
                id="apt-prof"
                type="text"
                className="w-full rounded-md border border-calm-border bg-white p-2 text-sm text-calm-text"
                value={formData.Profession || ''}
                onChange={(e) => handleChange('Profession', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-calm-text-muted mb-1" htmlFor="apt-prac">Practitioner Name</label>
              <input
                id="apt-prac"
                type="text"
                className="w-full rounded-md border border-calm-border bg-white p-2 text-sm text-calm-text"
                value={formData['Practitioner Name'] || ''}
                onChange={(e) => handleChange('Practitioner Name', e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-calm-text-muted mb-1">Mode</label>
            <div className="flex gap-2">
              {MODE_OPTIONS.map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => handleChange('Mode', formData.Mode === mode ? '' : mode)}
                  className={`rounded-md px-4 py-2 text-xs font-medium border transition-colors ${
                    formData.Mode === mode
                      ? 'bg-calm-blue text-white border-calm-blue'
                      : 'bg-calm-surface text-calm-text border-calm-border hover:bg-calm-border'
                  }`}
                  style={{ minHeight: '44px' }}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div>
             <label className="block text-xs font-medium text-calm-text-muted mb-1" htmlFor="apt-address">Address</label>
              <input
                id="apt-address"
                type="text"
                className="w-full rounded-md border border-calm-border bg-white p-2 text-sm text-calm-text"
                value={formData.Address || ''}
                onChange={(e) => handleChange('Address', e.target.value)}
              />
          </div>

          <div>
             <label className="block text-xs font-medium text-calm-text-muted mb-1" htmlFor="apt-reason">Reason for Visit</label>
              <textarea
                id="apt-reason"
                className="w-full rounded-md border border-calm-border bg-white p-2 text-sm text-calm-text min-h-15"
                value={formData.Reason || ''}
                onChange={(e) => handleChange('Reason', e.target.value)}
              />
          </div>

          <div>
             <label className="block text-xs font-medium text-calm-text-muted mb-2">Reason for Visit</label>
             <div className="flex flex-wrap gap-2">
               {ADMIN_NEEDS_OPTIONS.map(need => (
                 <button
                   key={need}
                   onClick={() => handleAdminNeedToggle(need)}
                   className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                     (formData['Admin Needs'] || []).includes(need)
                       ? 'bg-calm-blue text-white'
                       : 'bg-calm-surface text-calm-text hover:bg-calm-border'
                   }`}
                   style={{ minHeight: '44px' }}
                 >
                   {need}
                 </button>
               ))}
             </div>
          </div>

           <div>
             <label className="block text-xs font-medium text-calm-text-muted mb-1" htmlFor="apt-q">Questions to Ask</label>
              <textarea
                id="apt-q"
                className="w-full rounded-md border border-calm-border bg-white p-2 text-sm text-calm-text min-h-15"
                value={formData.Questions || ''}
                onChange={(e) => handleChange('Questions', e.target.value)}
              />
          </div>

          {/* Repeat Prescriptions dynamic list */}
          <div>
            <label className="block text-xs font-medium text-calm-text-muted mb-1">Repeat Prescriptions</label>
            {(formData['Repeat Prescriptions'] || []).length > 0 && (
              <div className="space-y-1.5 mb-2">
                {(formData['Repeat Prescriptions'] || []).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="flex-1 rounded-md border border-calm-border bg-white px-2 py-1.5 text-sm text-calm-text">{item}</span>
                    <button
                      type="button"
                      onClick={() => removePrescription(idx)}
                      className="rounded-md px-2 py-1.5 text-xs font-medium text-destructive hover:bg-red-50 border border-calm-border"
                      style={{ minHeight: '44px' }}
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                className="w-full rounded-md border border-calm-border bg-white p-2 text-sm text-calm-text"
                value={newPrescription}
                onChange={(e) => setNewPrescription(e.target.value)}
                placeholder="Medication name"
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addPrescription(); } }}
              />
              <button
                type="button"
                onClick={addPrescription}
                disabled={!newPrescription.trim()}
                className="rounded-md bg-calm-green px-3 py-2 text-xs font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
                style={{ minHeight: '44px' }}
              >
                Add
              </button>
            </div>
          </div>

          <div>
             <label className="block text-xs font-medium text-calm-text-muted mb-1" htmlFor="apt-out">Outcomes / Plan</label>
              <textarea
                id="apt-out"
                className="w-full rounded-md border border-calm-border bg-white p-2 text-sm text-calm-text min-h-15"
                value={formData.Outcomes || ''}
                onChange={(e) => handleChange('Outcomes', e.target.value)}
              />
          </div>

          <div>
             <label className="block text-xs font-medium text-calm-text-muted mb-1" htmlFor="apt-fq">Follow-up Questions</label>
              <textarea
                id="apt-fq"
                className="w-full rounded-md border border-calm-border bg-white p-2 text-sm text-calm-text min-h-15"
                value={formData['Follow-up Questions'] || ''}
                onChange={(e) => handleChange('Follow-up Questions', e.target.value)}
              />
          </div>

          <div>
             <label className="block text-xs font-medium text-calm-text-muted mb-1" htmlFor="apt-note">Notes</label>
              <textarea
                id="apt-note"
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

  const data = resolveAppointmentData(entry);
  // Resolve address with legacy Location fallback
  const address = data.Address || data.Location;

  const fields: { key: keyof AppointmentData; label: string }[] = [
    { key: 'Practitioner Name', label: 'Practitioner' },
    { key: 'Visit Type', label: 'Visit Type' },
    { key: 'Profession', label: 'Profession' },
    { key: 'Date', label: 'Date' },
    { key: 'Time', label: 'Time' },
  ];

  const lowerFields: { key: keyof AppointmentData; label: string }[] = [
    { key: 'Reason', label: 'Reason' },
    { key: 'Questions', label: 'Questions to Ask' },
    { key: 'Outcomes', label: 'Outcomes' },
    { key: 'Follow-up Questions', label: 'Follow-up Questions' },
    { key: 'Notes', label: 'Notes' },
  ];

  return (
    <div className={`rounded-lg bg-calm-surface-raised p-4 shadow-sm border-l-4 ${isApproved ? "border-calm-green" : "border-calm-primary"} transition-all`}>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-indigo-100 text-indigo-700">
            Appointment
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
        <div className="space-y-2">
          {fields.map(({ key, label }) => {
            const val = data[key];
            if (!val) return null;
            const displayValue = key === 'Date' ? formatDateDDMMYYYY(String(val)) : String(val);
            return (
              <div key={key} className="text-calm-text">
                <span className="font-medium text-calm-primary block text-[10px] uppercase tracking-wider mb-0.5">{label}</span>
                <div className="text-sm">{displayValue}</div>
              </div>
            );
          })}
          {data.Mode && (
            <div className="text-calm-text">
              <span className="font-medium text-calm-primary block text-[10px] uppercase tracking-wider mb-0.5">Mode</span>
              <div className="text-sm">
                <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                  data.Mode === 'Telehealth' ? 'bg-calm-blue-soft text-calm-blue' : 'bg-calm-purple-soft text-calm-purple'
                }`}>
                  {data.Mode}
                </span>
              </div>
            </div>
          )}
          {address && (
            <div className="text-calm-text">
              <span className="font-medium text-calm-primary block text-[10px] uppercase tracking-wider mb-0.5">Address</span>
              <div className="text-sm">{address}</div>
            </div>
          )}
          {lowerFields.map(({ key, label }) => {
            const val = data[key];
            if (!val) return null;
            return (
              <div key={key} className="text-calm-text">
                <span className="font-medium text-calm-primary block text-[10px] uppercase tracking-wider mb-0.5">{label}</span>
                <div className="text-sm">{String(val)}</div>
              </div>
            );
          })}
          {data['Admin Needs'] && data['Admin Needs'].length > 0 && (
            <div className="text-calm-text">
              <span className="font-medium text-calm-primary block text-[10px] uppercase tracking-wider mb-1">Reason for Visit</span>
              <div className="flex flex-wrap gap-1">
                {data['Admin Needs'].map((need: string, idx: number) => (
                  <span key={idx} className="bg-calm-surface text-calm-text text-xs px-2 py-1 rounded-md border border-calm-border">
                    {need}
                  </span>
                ))}
              </div>
            </div>
          )}
          {data['Repeat Prescriptions'] && data['Repeat Prescriptions'].length > 0 && (
            <div className="text-calm-text">
              <span className="font-medium text-calm-primary block text-[10px] uppercase tracking-wider mb-1">Repeat Prescriptions</span>
              <div className="space-y-1">
                {data['Repeat Prescriptions'].map((item: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <div className="h-1.5 w-1.5 rounded-full bg-calm-green shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
