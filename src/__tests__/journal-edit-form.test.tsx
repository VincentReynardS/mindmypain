/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { JournalEditForm, parseAiResponse, serializeToAiResponse, serializeToContentText, MOOD_OPTIONS } from '@/components/shared/glass-box/editors/journal-edit-form';

describe('JournalEditForm', () => {
  const mockAiResponse = {
    Sleep: '7 hours',
    Pain: '4/10',
    Feeling: 'Tired but ok',
    Action: 'Go for a walk',
    Grateful: 'Family',
    Medication: 'Panadol morning',
    Mood: 'Ok',
    Note: 'Remember to call doctor',
    Appointments: null,
    Scripts: null,
  };

  describe('parseAiResponse', () => {
    it('should parse a full ai_response into form data', () => {
      const result = parseAiResponse(mockAiResponse);
      expect(result.Sleep).toBe('7 hours');
      expect(result.Pain).toBe('4/10');
      expect(result.Feeling).toBe('Tired but ok');
      expect(result.Mood).toBe('Ok');
    });

    it('should handle null/missing fields gracefully', () => {
      const result = parseAiResponse({ Sleep: null, Pain: undefined });
      expect(result.Sleep).toBe('');
      expect(result.Pain).toBe('');
      expect(result.Feeling).toBe('');
    });

    it('should handle empty object', () => {
      const result = parseAiResponse({});
      expect(result.Sleep).toBe('');
      expect(result.Mood).toBe('');
      expect(result.Note).toBe('');
    });
  });

  describe('serializeToAiResponse', () => {
    it('should serialize form data back to ai_response shape', () => {
      const form = parseAiResponse(mockAiResponse);
      const result = serializeToAiResponse(form, mockAiResponse) as Record<string, unknown>;
      expect(result.Sleep).toBe('7 hours');
      expect(result.Pain).toBe('4/10');
      expect(result.Mood).toBe('Ok');
    });

    it('should set empty strings to null', () => {
      const original = { Sleep: '', Pain: '' };
      const form = parseAiResponse(original);
      const result = serializeToAiResponse(form, original) as Record<string, unknown>;
      expect(result.Sleep).toBeNull();
      expect(result.Pain).toBeNull();
    });

    it('should preserve existing Appointments and Scripts from original ai_response', () => {
      const originalWithSubs = {
        ...mockAiResponse,
        Appointments: [{ 'Practitioner Name': 'Dr Smith' }],
        Scripts: [{ Name: 'Panadol', Filled: false }],
      };
      const form = parseAiResponse(originalWithSubs);
      const result = serializeToAiResponse(form, originalWithSubs) as Record<string, unknown>;
      expect(result.Appointments).toEqual([{ 'Practitioner Name': 'Dr Smith' }]);
      expect(result.Scripts).toEqual([{ Name: 'Panadol', Filled: false }]);
    });
  });

  describe('serializeToContentText', () => {
    it('should create human-readable text from form data', () => {
      const form = parseAiResponse(mockAiResponse);
      const text = serializeToContentText(form);
      expect(text).toContain('Sleep: 7 hours');
      expect(text).toContain('Pain: 4/10');
      expect(text).toContain('Mood: Ok');
      expect(text).not.toContain('Appointments');
      expect(text).not.toContain('Scripts');
    });

    it('should skip empty fields', () => {
      const form = parseAiResponse({ Sleep: '7 hours' });
      const text = serializeToContentText(form);
      expect(text).toBe('Sleep: 7 hours');
      expect(text).not.toContain('Pain');
    });
  });

  describe('MOOD_OPTIONS', () => {
    it('should contain 22 mood options', () => {
      expect(MOOD_OPTIONS).toHaveLength(22);
    });

    it('should include key moods', () => {
      expect(MOOD_OPTIONS).toContain('Happy');
      expect(MOOD_OPTIONS).toContain('Sad');
      expect(MOOD_OPTIONS).toContain('Anxious');
      expect(MOOD_OPTIONS).toContain('Angry');
    });
  });

  describe('rendering', () => {
    it('should render all journal fields as labeled inputs', () => {
      const onSave = vi.fn();
      const onCancel = vi.fn();
      render(<JournalEditForm aiResponse={mockAiResponse} onSave={onSave} onCancel={onCancel} isSaving={false} />);

      expect(screen.getByLabelText('Sleep')).toBeTruthy();
      expect(screen.getByLabelText('Pain')).toBeTruthy();
      expect(screen.getByLabelText('Mood')).toBeTruthy();
      expect(screen.getByLabelText('Feeling')).toBeTruthy();
      expect(screen.getByLabelText('Action to Feel Better')).toBeTruthy();
      expect(screen.getByLabelText('Grateful For')).toBeTruthy();
      expect(screen.getByLabelText('Medication')).toBeTruthy();
      expect(screen.getByLabelText('Note')).toBeTruthy();
    });

    it('should pre-fill fields from ai_response', () => {
      const onSave = vi.fn();
      const onCancel = vi.fn();
      render(<JournalEditForm aiResponse={mockAiResponse} onSave={onSave} onCancel={onCancel} isSaving={false} />);

      const sleepInput = screen.getByLabelText('Sleep') as HTMLInputElement;
      const painInput = screen.getByLabelText('Pain') as HTMLInputElement;
      expect(sleepInput.value).toBe('7 hours');
      expect(painInput.value).toBe('4/10');
    });

    it('should render Mood as a select with 22 options', () => {
      const onSave = vi.fn();
      const onCancel = vi.fn();
      render(<JournalEditForm aiResponse={mockAiResponse} onSave={onSave} onCancel={onCancel} isSaving={false} />);

      const select = screen.getByLabelText('Mood') as HTMLSelectElement;
      // 22 moods + 1 placeholder "Select mood..."
      expect(select.options).toHaveLength(23);
      expect(select.value).toBe('Ok');
    });

    it('should not show appointment or script add buttons', () => {
      const onSave = vi.fn();
      const onCancel = vi.fn();
      const { container } = render(<JournalEditForm aiResponse={mockAiResponse} onSave={onSave} onCancel={onCancel} isSaving={false} />);

      expect(container.textContent).not.toContain('Add Appointment');
      expect(container.textContent).not.toContain('Add Script');
    });

    it('should never display raw JSON', () => {
      const onSave = vi.fn();
      const onCancel = vi.fn();
      const { container } = render(<JournalEditForm aiResponse={mockAiResponse} onSave={onSave} onCancel={onCancel} isSaving={false} />);

      // Raw JSON should never appear in the rendered output
      expect(container.textContent).not.toContain('{"Sleep"');
      expect(container.textContent).not.toContain('"Practitioner Name"');
    });

    it('should call onSave with serialized data when Save is clicked', async () => {
      const onSave = vi.fn().mockResolvedValue(undefined);
      const onCancel = vi.fn();
      render(<JournalEditForm aiResponse={mockAiResponse} onSave={onSave} onCancel={onCancel} isSaving={false} />);

      fireEvent.click(screen.getByText('Save'));

      await waitFor(() => {
        expect(onSave).toHaveBeenCalledTimes(1);
        const [aiResp, contentText] = onSave.mock.calls[0];
        expect(aiResp).toHaveProperty('Sleep', '7 hours');
        expect(contentText).toContain('Sleep: 7 hours');
      });
    });

    it('should call onCancel when Cancel is clicked', () => {
      const onSave = vi.fn();
      const onCancel = vi.fn();
      render(<JournalEditForm aiResponse={mockAiResponse} onSave={onSave} onCancel={onCancel} isSaving={false} />);

      fireEvent.click(screen.getByText('Cancel'));
      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('should disable inputs when isSaving is true', () => {
      const onSave = vi.fn();
      const onCancel = vi.fn();
      render(<JournalEditForm aiResponse={mockAiResponse} onSave={onSave} onCancel={onCancel} isSaving={true} />);

      const sleepInput = screen.getByLabelText('Sleep') as HTMLInputElement;
      const painInput = screen.getByLabelText('Pain') as HTMLInputElement;
      expect(sleepInput.disabled).toBe(true);
      expect(painInput.disabled).toBe(true);
    });
  });
});
