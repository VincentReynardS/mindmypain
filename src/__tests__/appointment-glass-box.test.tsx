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
      Profession: 'Physiotherapist',
      'Practitioner Name': 'Dr. Smith',
      'Visit Type': 'Follow-up',
      Location: 'Downtown Clinic',
      Reason: 'Knee pain',
      'Admin Needs': ['Referral'],
      Questions: 'Is it getting better?',
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

  it('renders correctly in draft (read-only) mode', () => {
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
  });

  it('switches to edit mode when Edit is clicked', () => {
    render(
      <AppointmentGlassBox 
        entry={mockEntry} 
        onUpdate={mockOnUpdate} 
        onApprove={mockOnApprove} 
      />
    );

    fireEvent.click(screen.getByText('Edit'));
    
    expect(screen.getByLabelText(/Date/)).toBeTruthy();
    expect(screen.getByDisplayValue('Dr. Smith')).toBeTruthy();
    expect(screen.getByDisplayValue('2023-10-27')).toBeTruthy();
  });

  it('calls onUpdate with stringified JSON when saved', async () => {
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
});
