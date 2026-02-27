/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GlassBoxCard } from '@/components/shared/glass-box/glass-box-card';
import type { JournalEntry } from '@/types/database';

function makeEntry(overrides: Partial<JournalEntry> = {}): JournalEntry {
  return {
    id: 'test-id',
    user_id: 'sarah',
    created_at: '2026-02-24T10:00:00Z',
    updated_at: '2026-02-24T10:00:00Z',
    content: 'Test content',
    transcription: null,
    audio_url: null,
    status: 'draft',
    entry_type: 'journal',
    ai_response: null,
    tags: [],
    metadata: null,
    ...overrides,
  };
}

describe('GlassBoxCard Edit Dispatch', () => {
  const onUpdate = vi.fn().mockResolvedValue(undefined);
  const onApprove = vi.fn().mockResolvedValue(undefined);
  const onUpdateAiResponse = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render JournalEditForm for journal-shaped ai_response', () => {
    const entry = makeEntry({
      ai_response: { Sleep: '7 hours', Pain: '4/10', Feeling: 'Ok', Action: null, Grateful: null, Medication: null, Mood: 'Ok', Note: null, Appointments: null, Scripts: null },
    });
    render(<GlassBoxCard entry={entry} onUpdate={onUpdate} onApprove={onApprove} onUpdateAiResponse={onUpdateAiResponse} />);

    fireEvent.click(screen.getByText('Edit'));
    expect(screen.getByText('Editing Daily Health Journal')).toBeTruthy();
    expect(screen.getByLabelText('Sleep')).toBeTruthy();
  });

  it('should render MedicationEditForm for medication-shaped ai_response', () => {
    const entry = makeEntry({
      ai_response: { 'Brand Name': 'Panadol', 'Generic Name': 'Paracetamol', Dosage: '500mg' },
    });
    render(<GlassBoxCard entry={entry} onUpdate={onUpdate} onApprove={onApprove} onUpdateAiResponse={onUpdateAiResponse} />);

    fireEvent.click(screen.getByText('Edit'));
    expect(screen.getByText('Editing Medication Record')).toBeTruthy();
  });

  it('should render AppointmentEditForm for appointment-shaped ai_response', () => {
    const entry = makeEntry({
      ai_response: { 'Practitioner Name': 'Dr Smith', 'Visit Type': 'Consultation', Date: '2026-03-01' },
    });
    render(<GlassBoxCard entry={entry} onUpdate={onUpdate} onApprove={onApprove} onUpdateAiResponse={onUpdateAiResponse} />);

    fireEvent.click(screen.getByText('Edit'));
    expect(screen.getByText('Editing Appointment Record')).toBeTruthy();
  });

  it('should render ScriptEditForm for script-shaped ai_response', () => {
    const entry = makeEntry({
      ai_response: { Name: 'Panadol Script', Filled: false, 'Date Prescribed': '2026-02-20', Notes: '' },
    });
    render(<GlassBoxCard entry={entry} onUpdate={onUpdate} onApprove={onApprove} onUpdateAiResponse={onUpdateAiResponse} />);

    fireEvent.click(screen.getByText('Edit'));
    expect(screen.getByText('Editing Script / Referral')).toBeTruthy();
  });

  it('should render ClinicalSummaryEditForm for clinical_summary entries', () => {
    const entry = makeEntry({
      entry_type: 'clinical_summary',
      ai_response: { chief_complaint: 'Back pain', medication_review: 'Panadol', patient_goal: 'Pain reduction' },
    });
    render(<GlassBoxCard entry={entry} onUpdate={onUpdate} onApprove={onApprove} onUpdateAiResponse={onUpdateAiResponse} />);

    fireEvent.click(screen.getByText('Edit'));
    expect(screen.getByText('Editing Clinical Summary')).toBeTruthy();
  });

  it('should fallback to JournalEditForm for unrecognized ai_response shapes', () => {
    const entry = makeEntry({
      ai_response: { unknown_field: 'some value' },
    });
    render(<GlassBoxCard entry={entry} onUpdate={onUpdate} onApprove={onApprove} onUpdateAiResponse={onUpdateAiResponse} />);

    fireEvent.click(screen.getByText('Edit'));
    // Fallback uses JournalEditForm
    expect(screen.getByText('Editing Daily Health Journal')).toBeTruthy();
  });

  it('should still show Edit button when entry is approved', () => {
    const entry = makeEntry({
      status: 'approved',
      ai_response: { Sleep: '7 hours', Pain: '4/10', Feeling: 'Ok', Action: null, Grateful: null, Medication: null, Mood: 'Ok', Note: null, Appointments: null, Scripts: null },
    });
    render(<GlassBoxCard entry={entry} onUpdate={onUpdate} onApprove={onApprove} onUpdateAiResponse={onUpdateAiResponse} />);

    expect(screen.getByText('Edit')).toBeTruthy();
    expect(screen.getByText('Added')).toBeTruthy();
  });

  it('should show Edit button for draft entries', () => {
    const entry = makeEntry({
      status: 'draft',
      ai_response: { Sleep: '7 hours', Pain: '4/10', Feeling: 'Ok', Action: null, Grateful: null, Medication: null, Mood: 'Ok', Note: null, Appointments: null, Scripts: null },
    });
    render(<GlassBoxCard entry={entry} onUpdate={onUpdate} onApprove={onApprove} onUpdateAiResponse={onUpdateAiResponse} />);

    expect(screen.getByText('Edit')).toBeTruthy();
    expect(screen.getByText('Draft')).toBeTruthy();
  });

  it('should never display raw JSON in any edit form', () => {
    const entry = makeEntry({
      ai_response: { Sleep: '7 hours', Pain: '4/10', Feeling: 'Ok', Action: null, Grateful: null, Medication: null, Mood: 'Ok', Note: null, Appointments: null, Scripts: null },
    });
    const { container } = render(<GlassBoxCard entry={entry} onUpdate={onUpdate} onApprove={onApprove} onUpdateAiResponse={onUpdateAiResponse} />);

    fireEvent.click(screen.getByText('Edit'));
    expect(container.textContent).not.toContain('{"Sleep"');
    expect(container.textContent).not.toContain('"Pain"');
  });
});
