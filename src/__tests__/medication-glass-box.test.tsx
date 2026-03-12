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

  const mockEntry: JournalEntry = {
    id: 'test-id',
    user_id: 'test-user',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    content: JSON.stringify({
      'Brand Name': 'Lyrica',
      'Generic Name': 'Pregabalin',
      Dosage: '75mg twice daily',
      'Date Started': '2023-11-01',
      Reason: 'Nerve pain',
      'Side Effects': 'Dizziness',
      Feelings: 'A bit groggy in the morning',
      'Date Stopped': '',
      'Stop Reason': '',
      Notes: 'Taking with food helps'
    }),
    transcription: null,
    audio_url: null,
    status: 'draft',
    // @ts-expect-error - Medication UI supports this shape even if enum is narrower
    entry_type: 'medication',
    ai_response: null,
    tags: [],
    metadata: null
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly in draft (read-only) mode', () => {
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

  it('switches to edit mode when Edit is clicked', () => {
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
    expect(screen.getByDisplayValue('2023-11-01')).toBeTruthy();
  });

  it('calls onUpdate with stringified JSON when saved', async () => {
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
      expect(mockOnUpdate).toHaveBeenCalledWith('test-id', expect.stringContaining('150mg twice daily'));
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
