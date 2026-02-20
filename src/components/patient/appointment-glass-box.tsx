"use client";

import { useState } from 'react';
import { JournalEntry } from '@/types/database';

interface AppointmentGlassBoxProps {
  entry: JournalEntry;
  onUpdate: (id: string, content: string) => Promise<void>;
  onApprove: (id: string) => Promise<void>;
}

interface AppointmentData {
  Date?: string;
  Profession?: string;
  'Practitioner Name'?: string;
  'Visit Type'?: string;
  Location?: string;
  Reason?: string;
  'Admin Needs'?: string[];
  Questions?: string;
  Outcomes?: string;
  'Follow-up Questions'?: string;
  Notes?: string;
}

const ADMIN_NEEDS_OPTIONS = ['Referral', 'Prescription', 'Medical Certificate', 'Imaging Request', 'Blood Test'];

function parseContent(content: string): AppointmentData {
  try {
    return JSON.parse(content || '{}');
  } catch (e) {
    return { Notes: content }; // Fallback to raw text if not JSON
  }
}

export function AppointmentGlassBox({ entry, onUpdate, onApprove }: AppointmentGlassBoxProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<AppointmentData>(parseContent(entry.content));
  const [isSaving, setIsSaving] = useState(false);

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
    setFormData(parseContent(entry.content));
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
                value={formData.Date || ''}
                onChange={(e) => handleChange('Date', e.target.value)}
              />
            </div>
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
          </div>

          <div className="grid grid-cols-2 gap-4">
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
             <label className="block text-xs font-medium text-calm-text-muted mb-1" htmlFor="apt-loc">Location</label>
              <input 
                id="apt-loc"
                type="text" 
                className="w-full rounded-md border border-calm-border bg-white p-2 text-sm text-calm-text"
                value={formData.Location || ''}
                onChange={(e) => handleChange('Location', e.target.value)}
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
             <label className="block text-xs font-medium text-calm-text-muted mb-2">Admin Needs</label>
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
                   style={{ minHeight: '44px' }} // Accessibility target
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

  const data = parseContent(entry.content);

  return (
    <div className={`rounded-lg bg-calm-surface-raised p-4 shadow-sm border-l-4 ${isApproved ? "border-calm-green" : "border-calm-primary"} transition-all`}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-indigo-100 text-indigo-700">
            Appointment
          </span>
          <span className={`text-xs ${isApproved ? "text-calm-green font-medium" : "text-calm-text-muted"}`}>
            {isApproved ? "Approved" : "Draft"}
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
              style={{ minHeight: '44px' }}
            >
              {isSaving ? "Approving..." : "Approve"}
            </button>
          )}
        </div>
      </div>
      
      <div className="space-y-3 text-sm text-calm-text leading-relaxed">
        {data.Date && (
           <div className="flex justify-between border-b border-calm-border pb-1">
             <span className="font-medium text-calm-text-muted text-xs uppercase tracking-wider">Date</span>
             <span>{data.Date}</span>
           </div>
        )}
        {(data.Profession || data['Practitioner Name']) && (
           <div className="flex justify-between border-b border-calm-border pb-1">
             <span className="font-medium text-calm-text-muted text-xs uppercase tracking-wider">Practitioner</span>
             <span className="font-semibold text-calm-primary text-right">
               {data['Practitioner Name']}{data['Practitioner Name'] && data.Profession ? ' - ' : ''}{data.Profession}
             </span>
           </div>
        )}
        
        {data.Reason && (
          <div className="pt-1">
             <span className="block font-medium text-calm-text-muted text-xs uppercase tracking-wider mb-1">Reason</span>
             <p>{data.Reason}</p>
          </div>
        )}

        {data['Admin Needs'] && data['Admin Needs'].length > 0 && (
           <div className="pt-1">
             <span className="block font-medium text-calm-text-muted text-xs uppercase tracking-wider mb-2">Admin Needs</span>
             <div className="flex flex-wrap gap-1">
               {data['Admin Needs'].map((need, idx) => (
                 <span key={idx} className="bg-calm-surface text-calm-text text-xs px-2 py-1 rounded-md border border-calm-border">
                   {need}
                 </span>
               ))}
             </div>
          </div>
        )}

        {Object.entries(data).map(([key, value]) => {
          if (['Date', 'Profession', 'Practitioner Name', 'Reason', 'Admin Needs', 'Visit Type', 'Location'].includes(key)) return null;
          if (!value) return null;
          
          const formattedKey = key.replace(/_/g, ' ');
          let displayValue: React.ReactNode = String(value);
          
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
