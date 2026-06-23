"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface TeamMemberFormData {
  Profession: string;
  Name: string;
  Address: string;
  Email: string;
  Phone: string;
}

interface TeamMemberEditFormProps {
  aiResponse: Record<string, unknown>;
  onSave: (aiResponse: object, contentText: string) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
}

function parseAiResponse(ai: Record<string, unknown>): TeamMemberFormData {
  return {
    Profession: String(ai['Profession'] ?? ''),
    Name: String(ai['Name'] ?? ''),
    Address: String(ai['Address'] ?? ''),
    Email: String(ai['Email'] ?? ''),
    Phone: String(ai['Phone'] ?? ''),
  };
}

function serializeToAiResponse(form: TeamMemberFormData): object {
  return {
    Profession: form.Profession || null,
    Name: form.Name || null,
    Address: form.Address || null,
    Email: form.Email || null,
    Phone: form.Phone || null,
  };
}

function serializeToContentText(form: TeamMemberFormData): string {
  const lines: string[] = [];
  if (form.Profession) lines.push(`Profession: ${form.Profession}`);
  if (form.Name) lines.push(`Name: ${form.Name}`);
  if (form.Address) lines.push(`Address: ${form.Address}`);
  if (form.Email) lines.push(`Email: ${form.Email}`);
  if (form.Phone) lines.push(`Phone: ${form.Phone}`);
  return lines.join('\n');
}

const labelClass = "block text-xs font-medium text-calm-text-muted mb-1";

export function TeamMemberEditForm({ aiResponse, onSave, onCancel, isSaving }: TeamMemberEditFormProps) {
  const [form, setForm] = useState<TeamMemberFormData>(() => parseAiResponse(aiResponse));

  const handleChange = (field: keyof TeamMemberFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    await onSave(serializeToAiResponse(form), serializeToContentText(form));
  };

  return (
    <div className="rounded-lg bg-calm-surface-raised p-4 shadow-sm border border-calm-border">
      <label className="mb-4 block text-sm font-medium text-calm-text">
        Editing Care Team Member
      </label>

      <div className="space-y-4">
        <div>
          <label className={labelClass} htmlFor="team-profession">Profession</label>
          <Input id="team-profession"
            value={form.Profession} onChange={(e) => handleChange('Profession', e.target.value)} disabled={isSaving} />
        </div>

        <div>
          <label className={labelClass} htmlFor="team-name">Name</label>
          <Input id="team-name"
            value={form.Name} onChange={(e) => handleChange('Name', e.target.value)} disabled={isSaving} />
        </div>

        <div>
          <label className={labelClass} htmlFor="team-address">Address</label>
          <Input id="team-address"
            value={form.Address} onChange={(e) => handleChange('Address', e.target.value)} disabled={isSaving} />
        </div>

        <div>
          <label className={labelClass} htmlFor="team-email">Email</label>
          <Input id="team-email" type="email"
            value={form.Email} onChange={(e) => handleChange('Email', e.target.value)} disabled={isSaving} />
        </div>

        <div>
          <label className={labelClass} htmlFor="team-phone">Phone</label>
          <Input id="team-phone" type="tel"
            value={form.Phone} onChange={(e) => handleChange('Phone', e.target.value)} disabled={isSaving} />
        </div>
      </div>

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
