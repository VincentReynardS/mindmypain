/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MedicationSummary } from '@/components/patient/medication-summary';
import type { JournalEntry, JsonObject } from '@/types/database';

function makeMed(id: string, ai: Partial<JsonObject>, options: Partial<JournalEntry> = {}): JournalEntry {
  return {
    id,
    user_id: 'sarah',
    content: 'content',
    transcription: null,
    audio_url: null,
    ai_response: { _intent: 'medication', ...ai } as JsonObject,
    created_at: '2026-06-15T09:00:00.000Z',
    updated_at: '2026-06-15T09:00:00.000Z',
    entry_type: 'journal',
    status: 'approved',
    tags: [],
    metadata: null,
    previous_status: null,
    ...options,
  };
}

describe('MedicationSummary', () => {
  const onUpdate = vi.fn();
  const onApprove = vi.fn();
  const onToggleCheck = vi.fn();

  const entries = [
    makeMed('lyrica', { 'Brand Name': 'Lyrica', Dosage: '75mg', 'Generic Name': 'Pregabalin', Category: 'prescription' }),
    makeMed('omega', { 'Brand Name': 'Omega-3', Category: 'supplement', Checked: true }),
    makeMed('endone', { 'Brand Name': 'Endone', Category: 'prescription', 'Date Stopped': '01-04-2026' }),
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  function renderSummary() {
    render(
      <MedicationSummary
        medications={entries}
        onUpdate={onUpdate}
        onApprove={onApprove}
        onToggleCheck={onToggleCheck}
      />
    );
  }

  it('renders the three summary section headers', () => {
    renderSummary();
    expect(screen.getByText('Active Medications Summary')).toBeTruthy();
    expect(screen.getByText('Natural Supplements Summary')).toBeTruthy();
    expect(screen.getByText('Inactive Medications Summary')).toBeTruthy();
  });

  it('formats items as "Brand Dosage (Generic)"', () => {
    renderSummary();
    expect(screen.getByText('Lyrica 75mg (Pregabalin)')).toBeTruthy();
  });

  it('renders an Edit button in each section header', () => {
    renderSummary();
    expect(screen.getAllByRole('button', { name: /edit .* section/i }).length).toBe(3);
  });

  it('renders an enabled, reflecting checkbox for active items', () => {
    renderSummary();
    const checkbox = screen.getByRole('checkbox', { name: /Omega-3/i }) as HTMLInputElement;
    expect(checkbox.disabled).toBe(false);
    expect(checkbox.checked).toBe(true);
    fireEvent.click(checkbox);
    expect(onToggleCheck).toHaveBeenCalledWith(expect.objectContaining({ id: 'omega' }));
  });

  it('disables checkboxes for inactive medications', () => {
    renderSummary();
    const checkbox = screen.getByRole('checkbox', { name: /Endone/i }) as HTMLInputElement;
    expect(checkbox.disabled).toBe(true);
  });

  it('expands the MedicationGlassBox detail when an item is tapped', () => {
    renderSummary();
    fireEvent.click(screen.getByRole('button', { name: /Lyrica 75mg \(Pregabalin\)/i }));
    // Detail view shows the medication glass box "Edit" affordance
    expect(screen.getByText('Edit')).toBeTruthy();
  });

  it('shows an empty state hint when a section has no items', () => {
    render(
      <MedicationSummary
        medications={[entries[0]]}
        onUpdate={onUpdate}
        onApprove={onApprove}
        onToggleCheck={onToggleCheck}
      />
    );
    const suppSection = screen.getByText('Natural Supplements Summary').closest('section') as HTMLElement;
    expect(within(suppSection).getByText(/none/i)).toBeTruthy();
  });
});
