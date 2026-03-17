/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AppointmentGlassBox } from '@/components/patient/appointment-glass-box';
import { JournalEntry } from '../types/database';

describe('AppointmentGlassBox', () => {
  const mockOnUpdate = vi.fn();
  const mockOnApprove = vi.fn();

  const mockEntry: JournalEntry = {
    id: 'test-id',
    user_id: 'test-user',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    content: JSON.stringify({
      Date: '2023-10-27',
      Time: '14:30',
      Profession: 'Physiotherapist',
      'Practitioner Name': 'Dr. Smith',
      'Visit Type': 'Follow-up',
      Mode: 'In-person',
      Address: 'Downtown Clinic',
      Reason: 'Knee pain',
      'Admin Needs': ['Repeat Prescription'],
      Questions: 'Is it getting better?',
      'Repeat Prescriptions': ['Lyrica 75mg', 'Panadol Osteo'],
      Outcomes: 'Keep exercising',
      'Follow-up Questions': 'None',
      Notes: 'Good progress'
    }),
    transcription: null,
    audio_url: null,
    status: 'draft',
    // @ts-expect-error - Appointment UI supports this shape even if enum is narrower
    entry_type: 'appointment',
    ai_response: null,
    tags: [],
    metadata: null
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly in draft (read-only) mode with new fields', () => {
    render(
      <AppointmentGlassBox
        entry={mockEntry}
        onUpdate={mockOnUpdate}
        onApprove={mockOnApprove}
      />
    );

    expect(screen.getByText('Appointment')).toBeTruthy();
    expect(screen.getByText('Draft')).toBeTruthy();
    expect(screen.getByText(/Dr\. Smith/)).toBeTruthy();
    expect(screen.getByText('27-10-2023')).toBeTruthy();
    expect(screen.getByText('14:30')).toBeTruthy();
    expect(screen.getByText('In-person')).toBeTruthy();
    expect(screen.getByText('Downtown Clinic')).toBeTruthy();
    expect(screen.getByText('Repeat Prescription')).toBeTruthy();
    expect(screen.getByText('Lyrica 75mg')).toBeTruthy();
    expect(screen.getByText('Panadol Osteo')).toBeTruthy();
  });

  it('renders Address from legacy Location field', () => {
    const legacyEntry = {
      ...mockEntry,
      content: JSON.stringify({
        Date: '2023-10-27',
        'Practitioner Name': 'Dr. Legacy',
        Location: 'Old Clinic Address',
      }),
    };

    render(
      <AppointmentGlassBox
        entry={legacyEntry}
        onUpdate={mockOnUpdate}
        onApprove={mockOnApprove}
      />
    );

    expect(screen.getByText('Old Clinic Address')).toBeTruthy();
  });

  it('normalizes legacy Admin Needs values when saved from edit mode', async () => {
    const legacyEntry = {
      ...mockEntry,
      content: JSON.stringify({
        Date: '2023-10-27',
        'Practitioner Name': 'Dr. Legacy',
        'Admin Needs': ['Referral', 'Prescription', 'Blood Test'],
      }),
      ai_response: null,
    };

    render(
      <AppointmentGlassBox
        entry={legacyEntry}
        onUpdate={mockOnUpdate}
        onApprove={mockOnApprove}
      />
    );

    fireEvent.click(screen.getByText('Edit'));
    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      const savedJson = JSON.parse(mockOnUpdate.mock.calls[0][1]);
      expect(savedJson['Admin Needs']).toEqual(['Specialist Referral', 'Repeat Prescription']);
      expect(savedJson['Admin Needs']).not.toContain('Referral');
      expect(savedJson['Admin Needs']).not.toContain('Blood Test');
    });
  });

  it('switches to edit mode showing new fields', () => {
    render(
      <AppointmentGlassBox
        entry={mockEntry}
        onUpdate={mockOnUpdate}
        onApprove={mockOnApprove}
      />
    );

    fireEvent.click(screen.getByText('Edit'));

    expect(screen.getByLabelText(/Date/)).toBeTruthy();
    expect(screen.getByLabelText(/Time/)).toBeTruthy();
    expect(screen.getByLabelText(/Address/)).toBeTruthy();
    expect(screen.getByDisplayValue('Dr. Smith')).toBeTruthy();
    expect(screen.getByDisplayValue('14:30')).toBeTruthy();
    expect(screen.getByDisplayValue('Downtown Clinic')).toBeTruthy();
  });

  it('shows new admin needs chip options in edit mode', () => {
    render(
      <AppointmentGlassBox
        entry={mockEntry}
        onUpdate={mockOnUpdate}
        onApprove={mockOnApprove}
      />
    );

    fireEvent.click(screen.getByText('Edit'));

    expect(screen.getByText('Repeat Prescription')).toBeTruthy();
    expect(screen.getByText('Medical Certificate')).toBeTruthy();
    expect(screen.getByText('Specialist Referral')).toBeTruthy();
    expect(screen.getByText('Pathology Referral')).toBeTruthy();
    // Old values should not be present
    expect(screen.queryByText('Blood Test')).toBeNull();
    expect(screen.queryByText('Imaging Request')).toBeNull();
  });

  it('shows Mode radio buttons in edit mode', () => {
    render(
      <AppointmentGlassBox
        entry={mockEntry}
        onUpdate={mockOnUpdate}
        onApprove={mockOnApprove}
      />
    );

    fireEvent.click(screen.getByText('Edit'));

    // Both mode buttons should exist
    const inPersonButtons = screen.getAllByText('In-person');
    const telehealthButtons = screen.getAllByText('Telehealth');
    expect(inPersonButtons.length).toBeGreaterThanOrEqual(1);
    expect(telehealthButtons.length).toBeGreaterThanOrEqual(1);
  });

  it('renders Repeat Prescriptions in edit mode with remove buttons', () => {
    render(
      <AppointmentGlassBox
        entry={mockEntry}
        onUpdate={mockOnUpdate}
        onApprove={mockOnApprove}
      />
    );

    fireEvent.click(screen.getByText('Edit'));

    expect(screen.getByText('Lyrica 75mg')).toBeTruthy();
    expect(screen.getByText('Panadol Osteo')).toBeTruthy();
    // X buttons for removal
    const removeButtons = screen.getAllByText('X');
    expect(removeButtons.length).toBe(2);
  });

  it('adds a new Repeat Prescription item', async () => {
    render(
      <AppointmentGlassBox
        entry={mockEntry}
        onUpdate={mockOnUpdate}
        onApprove={mockOnApprove}
      />
    );

    fireEvent.click(screen.getByText('Edit'));

    const input = screen.getByPlaceholderText('Medication name');
    fireEvent.change(input, { target: { value: 'Endep 10mg' } });
    fireEvent.click(screen.getByText('Add'));

    expect(screen.getByText('Endep 10mg')).toBeTruthy();
  });

  it('removes a Repeat Prescription item', async () => {
    render(
      <AppointmentGlassBox
        entry={mockEntry}
        onUpdate={mockOnUpdate}
        onApprove={mockOnApprove}
      />
    );

    fireEvent.click(screen.getByText('Edit'));

    // Remove the first item
    const removeButtons = screen.getAllByText('X');
    fireEvent.click(removeButtons[0]);

    expect(screen.queryByText('Lyrica 75mg')).toBeNull();
    expect(screen.getByText('Panadol Osteo')).toBeTruthy();
  });

  it('calls onUpdate with stringified JSON including new fields', async () => {
    render(
      <AppointmentGlassBox
        entry={mockEntry}
        onUpdate={mockOnUpdate}
        onApprove={mockOnApprove}
      />
    );

    fireEvent.click(screen.getByText('Edit'));

    const practitionerInput = screen.getByDisplayValue('Dr. Smith');
    fireEvent.change(practitionerInput, { target: { value: 'Dr. Jones' } });

    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith('test-id', expect.stringContaining('Dr. Jones'));
      const savedJson = JSON.parse(mockOnUpdate.mock.calls[0][1]);
      expect(savedJson.Time).toBe('14:30');
      expect(savedJson.Mode).toBe('In-person');
      expect(savedJson.Address).toBe('Downtown Clinic');
      expect(savedJson['Repeat Prescriptions']).toEqual(['Lyrica 75mg', 'Panadol Osteo']);
    });
  });

  it('calls onApprove when Add is clicked', async () => {
    render(
      <AppointmentGlassBox
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
      <AppointmentGlassBox
        entry={{ ...mockEntry, status: 'approved' }}
        onUpdate={mockOnUpdate}
        onApprove={mockOnApprove}
      />
    );

    expect(screen.queryByText('Add')).toBeNull();
    expect(screen.getByText('Added')).toBeTruthy();
  });

  it('handles empty Repeat Prescriptions gracefully', () => {
    const entryNoRx = {
      ...mockEntry,
      content: JSON.stringify({
        Date: '2023-10-27',
        'Practitioner Name': 'Dr. Smith',
      }),
    };

    render(
      <AppointmentGlassBox
        entry={entryNoRx}
        onUpdate={mockOnUpdate}
        onApprove={mockOnApprove}
      />
    );

    // Should not crash or show Repeat Prescriptions heading
    expect(screen.queryByText('Repeat Prescriptions')).toBeNull();
  });
});
