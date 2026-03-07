/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ScriptsList } from '../components/patient/scripts-list';
import { JournalEntry } from '../types/database';

describe('ScriptsList', () => {
  const mockToggleFilled = vi.fn();
  
  const mockEntries: JournalEntry[] = [
    {
      id: '1',
      user_id: 'sarah',
      content: JSON.stringify({
        Name: 'Physiotherapy Referral',
        'Date Prescribed': '2023-11-01',
        Filled: false,
        Notes: 'Dr. Lee recommended 6 sessions'
      }),
      status: 'approved',
      entry_type: 'journal',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tags: [],
      transcription: null,
      audio_url: null,
      ai_response: null,
      metadata: null,
      previous_status: null,
    },
    {
      id: '2',
      user_id: 'sarah',
      content: JSON.stringify({
        Name: 'Lyrica',
        'Date Prescribed': '2023-10-15',
        Filled: true
      }),
      status: 'approved',
      entry_type: 'journal',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tags: [],
      transcription: null,
      audio_url: null,
      ai_response: null,
      metadata: null,
      previous_status: null,
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders an empty state when no entries are provided', () => {
    render(<ScriptsList entries={[]} onToggleFilled={mockToggleFilled} />);
    expect(screen.getByText('No pending scripts or referrals found.')).toBeDefined();
  });

  it('renders a list of scripts and referrals', () => {
    render(<ScriptsList entries={mockEntries} onToggleFilled={mockToggleFilled} />);
    
    expect(screen.getByText('Physiotherapy Referral')).toBeDefined();
    expect(screen.getByText('Dr. Lee recommended 6 sessions')).toBeDefined();
    expect(screen.getByText('Lyrica')).toBeDefined();
    
    // Check states
    expect(screen.getByText('To Be Filled')).toBeDefined();
    expect(screen.getByText('Filled')).toBeDefined();
  });

  it('calls onToggleFilled when the toggle button is clicked', async () => {
    render(<ScriptsList entries={mockEntries} onToggleFilled={mockToggleFilled} />);
    
    // The first entry is not filled. Click its button.
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBe(2);
    
    fireEvent.click(buttons[0]);
    
    await waitFor(() => {
      expect(mockToggleFilled).toHaveBeenCalledWith('1', true);
    });
  });

  it('shows loading state while toggling', async () => {
    // Make the mock function take some time
    let resolvePromise: (() => void) | undefined;
    mockToggleFilled.mockImplementation(() => new Promise((resolve) => {
      resolvePromise = resolve;
    }));
    
    render(<ScriptsList entries={mockEntries} onToggleFilled={mockToggleFilled} />);
    
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);
    
    // Button should be disabled during the toggle
    expect(buttons[0].hasAttribute('disabled')).toBe(true);
    
    // Complete the mock function
    resolvePromise?.();
    
    await waitFor(() => {
      expect(buttons[0].hasAttribute('disabled')).toBe(false);
    });
  });
  it('updates toggle state labels correctly when entries prop changes', () => {
    const { rerender } = render(<ScriptsList entries={mockEntries} onToggleFilled={mockToggleFilled} />);
    
    // Initially, one is "Filled" and one is "To Be Filled"
    expect(screen.getByText('To Be Filled')).toBeDefined();
    
    const toggledEntries = [
      {
        ...mockEntries[0],
        content: JSON.stringify({ ...JSON.parse(mockEntries[0].content || '{}'), Filled: true })
      },
      ...mockEntries.slice(1)
    ];

    rerender(<ScriptsList entries={toggledEntries} onToggleFilled={mockToggleFilled} />);
    
    // Now both should be "Filled" and "To Be Filled" should not be present
    // The "Filled" label is inside a span, plus the script item itself might be named "Physiotherapy Referral"
    // We check that "To Be Filled" is gone.
    expect(screen.queryByText('To Be Filled')).toBeNull();
  });
});
