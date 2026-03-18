/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MedicationGlassBox } from '@/components/patient/medication-glass-box';
import { JournalEntry } from '../types/database';

describe('MedicationGlassBox', () => {
  const mockOnUpdate = vi.fn();
  const mockOnApprove = vi.fn();

  const medicationAiResponse = {
    _intent: 'medication',
    'Brand Name': 'Lyrica',
    'Generic Name': 'Pregabalin',
    Dosage: '75mg twice daily',
    'Date Started': '2023-11-01',
    Reason: 'Nerve pain',
    'Side Effects': 'Dizziness',
    Feelings: 'A bit groggy in the morning',
    'Date Stopped': null,
    'Stop Reason': null,
    Notes: 'Taking with food helps'
  };

  const mockEntry: JournalEntry = {
    id: 'test-id',
    user_id: 'test-user',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    content: 'Brand Name: Lyrica\nGeneric Name: Pregabalin\nDosage: 75mg twice daily',
    transcription: null,
    audio_url: null,
    status: 'draft',
    entry_type: 'journal',
    ai_response: medicationAiResponse,
    tags: [],
    metadata: null,
    previous_status: null
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly in draft (read-only) mode from ai_response', () => {
    render(
      <MedicationGlassBox
        entry={mockEntry}
        onUpdate={mockOnUpdate}
        onApprove={mockOnApprove}
      />
    );

    expect(screen.getAllByText('Medication').length).toBeGreaterThan(0);
    expect(screen.getByText('Draft')).toBeTruthy();
    expect(screen.getByText('Lyrica (Pregabalin)')).toBeTruthy();
    expect(screen.getByText('75mg twice daily')).toBeTruthy();
    expect(screen.getByText('01-11-2023')).toBeTruthy();
  });

  it('falls back to content JSON when ai_response is null (legacy)', () => {
    const legacyEntry: JournalEntry = {
      ...mockEntry,
      ai_response: null,
      content: JSON.stringify({
        'Brand Name': 'Aspirin',
        Dosage: '100mg',
      }),
    };

    render(
      <MedicationGlassBox
        entry={legacyEntry}
        onUpdate={mockOnUpdate}
        onApprove={mockOnApprove}
      />
    );

    expect(screen.getByText('Aspirin')).toBeTruthy();
    expect(screen.getByText('100mg')).toBeTruthy();
  });

  it('renders from ai_response when _intent marks a medication without brand or dosage fields', () => {
    const intentOnlyEntry: JournalEntry = {
      ...mockEntry,
      ai_response: {
        _intent: 'medication',
        Notes: 'Take after dinner',
        'Date Started': '2023-11-02',
      },
      content: 'raw legacy note that should not be shown',
    };

    render(
      <MedicationGlassBox
        entry={intentOnlyEntry}
        onUpdate={mockOnUpdate}
        onApprove={mockOnApprove}
      />
    );

    expect(screen.getByText('Take after dinner')).toBeTruthy();
    expect(screen.getByText('02-11-2023')).toBeTruthy();
    expect(screen.queryByText('raw legacy note that should not be shown')).toBeNull();
  });

  it('falls back to plain text as Notes when content is not JSON', () => {
    const plainEntry: JournalEntry = {
      ...mockEntry,
      ai_response: null,
      content: 'Started taking ibuprofen for headaches',
    };

    render(
      <MedicationGlassBox
        entry={plainEntry}
        onUpdate={mockOnUpdate}
        onApprove={mockOnApprove}
      />
    );

    expect(screen.getByText('Started taking ibuprofen for headaches')).toBeTruthy();
  });

  it('switches to edit mode and populates from ai_response', () => {
    render(
      <MedicationGlassBox
        entry={mockEntry}
        onUpdate={mockOnUpdate}
        onApprove={mockOnApprove}
      />
    );

    fireEvent.click(screen.getByText('Edit'));

    expect(screen.getByLabelText(/Brand Name/)).toBeTruthy();
    expect(screen.getByDisplayValue('Lyrica')).toBeTruthy();
    expect(screen.getByDisplayValue('Pregabalin')).toBeTruthy();
    expect(screen.getByDisplayValue('2023-11-01')).toBeTruthy();
  });

  it('calls onUpdate with aiResponse object and content text when saved', async () => {
    render(
      <MedicationGlassBox
        entry={mockEntry}
        onUpdate={mockOnUpdate}
        onApprove={mockOnApprove}
      />
    );

    fireEvent.click(screen.getByText('Edit'));

    const dosageInput = screen.getByDisplayValue('75mg twice daily');
    fireEvent.change(dosageInput, { target: { value: '150mg twice daily' } });

    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith(
        'test-id',
        expect.objectContaining({ Dosage: '150mg twice daily', 'Brand Name': 'Lyrica' }),
        expect.stringContaining('150mg twice daily')
      );
    });
  });

  it('preserves medication intent when a legacy entry is saved', async () => {
    const legacyEntry: JournalEntry = {
      ...mockEntry,
      ai_response: null,
      content: JSON.stringify({
        'Brand Name': 'Aspirin',
        Dosage: '100mg',
      }),
    };

    render(
      <MedicationGlassBox
        entry={legacyEntry}
        onUpdate={mockOnUpdate}
        onApprove={mockOnApprove}
      />
    );

    fireEvent.click(screen.getByText('Edit'));
    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith(
        'test-id',
        expect.objectContaining({ _intent: 'medication', 'Brand Name': 'Aspirin' }),
        expect.any(String)
      );
    });
  });

  it('calls onApprove when Add is clicked', async () => {
    render(
      <MedicationGlassBox
        entry={mockEntry}
        onUpdate={mockOnUpdate}
        onApprove={mockOnApprove}
      />
    );

    fireEvent.click(screen.getByText('Add'));

    await waitFor(() => {
      expect(mockOnApprove).toHaveBeenCalledWith('test-id');
    });
  });

  it('does not show Add action for approved entries', () => {
    render(
      <MedicationGlassBox
        entry={{ ...mockEntry, status: 'approved' }}
        onUpdate={mockOnUpdate}
        onApprove={mockOnApprove}
      />
    );

    expect(screen.queryByText('Add')).toBeNull();
    expect(screen.getByText('Added')).toBeTruthy();
  });
});
