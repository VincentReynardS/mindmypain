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
    // We expect the backend to set this type eventually, but testing the UI logic itself
    // @ts-ignore
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

  it('calls onApprove when Approve is clicked', async () => {
    render(
      <AppointmentGlassBox 
        entry={mockEntry} 
        onUpdate={mockOnUpdate} 
        onApprove={mockOnApprove} 
      />
    );

    fireEvent.click(screen.getByText('Approve'));

    await waitFor(() => {
      expect(mockOnApprove).toHaveBeenCalledWith('test-id');
    });
  });
});
