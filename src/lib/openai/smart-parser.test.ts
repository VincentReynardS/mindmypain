import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateClinicalSummary, parseMedication, parseScript, classifyIntent, parseAppointment } from './smart-parser';

// Hoist the mock function so it's available in vi.mock
const { mockCreate } = vi.hoisted(() => {
  return { mockCreate: vi.fn() };
});

vi.mock('openai', () => {
  const MockOpenAI = vi.fn();
  MockOpenAI.prototype.chat = {
    completions: {
      create: mockCreate,
    },
  };
  return { default: MockOpenAI };
});

describe('smart-parser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('classifyIntent', () => {
    it('should classify an appointment intent', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: JSON.stringify({ intent: 'appointment' }) } }],
      });
      const result = await classifyIntent('I have a doctor appointment tomorrow');
      expect(result).toBe('appointment');
    });

    it('should classify a medication intent', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: JSON.stringify({ intent: 'medication' }) } }],
      });
      const result = await classifyIntent('I took 500mg of aspirin');
      expect(result).toBe('medication');
    });

    it('should fall back to journal if unclear', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: JSON.stringify({ intent: 'journal' }) } }],
      });
      const result = await classifyIntent('Need to call my mom');
      expect(result).toBe('journal');
    });

    it('should fall back to journal on API failure', async () => {
      mockCreate.mockRejectedValueOnce(new Error('API Error'));
      const result = await classifyIntent('asdfghjkl gibberish');
      expect(result).toBe('journal');
    });
  });

  describe('parseJournal', () => {
    it('should parse text into journal format with health fields', async () => {
      const mockResponse = {
        Sleep: '8 hours',
        Pain: '7',
        Feeling: 'Tired but okay',
        Action: 'Take a walk',
        Grateful: 'My dog',
        Medication: 'Panadol in morning',
        Mood: 'Ok',
        Note: null
      };

      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify(mockResponse),
            },
          },
        ],
      });

      const { parseJournal } = await import('./smart-parser');
      const result = await parseJournal('Today is Monday. Slept 8 hours. Pain is 7 out of 10. Feeling tired but okay. I can take a walk to feel better. Grateful for my dog. Took Panadol in morning. Mood is ok.');

      expect(result).toEqual(mockResponse);
      expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
        model: 'gpt-4o',
        response_format: { type: 'json_object' },
      }));
    });

    it('should parse text with a Note field for catch-all content', async () => {
      const mockResponse = {
        Sleep: null,
        Pain: null,
        Feeling: null,
        Action: null,
        Grateful: null,
        Medication: null,
        Mood: null,
        Note: 'Need to buy groceries and call my mom'
      };

      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify(mockResponse),
            },
          },
        ],
      });

      const { parseJournal } = await import('./smart-parser');
      const result = await parseJournal('Need to buy groceries and call my mom');

      expect(result.Note).toBe('Need to buy groceries and call my mom');
    });

    it('should throw error for empty input', async () => {
      const { parseJournal } = await import('./smart-parser');
      await expect(parseJournal('')).rejects.toThrow('Input text cannot be empty');
    });

    it('should return synthetic fallback response on API errors', async () => {
      mockCreate.mockRejectedValueOnce(new Error('API Error'));

      const { parseJournal } = await import('./smart-parser');
      const result = await parseJournal('some test content');

      expect(result.Note).toBe('some test content');
      expect(result.Feeling).toBe('some test content');
      expect(result.Sleep).toBeNull();
      expect(result.Pain).toBeNull();
      expect(result.Mood).toBeNull();
      expect(result.Appointments).toBeNull();
      expect(result.Scripts).toBeNull();
    });

    it('should preserve raw text in Note when AI returns all-null fields', async () => {
      const allNullResponse = {
        Sleep: null, Pain: null, Feeling: null, Action: null,
        Grateful: null, Medication: null, Mood: null, Note: null,
        Appointments: [], Scripts: [],
      };

      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: JSON.stringify(allNullResponse) } }],
      });

      const { parseJournal } = await import('./smart-parser');
      const result = await parseJournal('Just testing the app today');

      expect(result.Note).toBe('Just testing the app today');
    });

    it('should NOT override Note when AI returns at least one populated field', async () => {
      const partialResponse = {
        Sleep: null, Pain: '5', Feeling: null, Action: null,
        Grateful: null, Medication: null, Mood: null, Note: null,
        Appointments: [], Scripts: [],
      };

      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: JSON.stringify(partialResponse) } }],
      });

      const { parseJournal } = await import('./smart-parser');
      const result = await parseJournal('Pain is about 5 today');

      expect(result.Pain).toBe('5');
      expect(result.Note).toBeNull();
    });

    it('should truncate Feeling to 500 chars in fallback', async () => {
      mockCreate.mockRejectedValueOnce(new Error('API Error'));

      const longText = 'x'.repeat(600);
      const { parseJournal } = await import('./smart-parser');
      const result = await parseJournal(longText);

      expect(result.Feeling).toHaveLength(500);
      expect(result.Note).toBe(longText);
    });
  });

  describe('parseAppointment', () => {
    it('should parse text into appointment format using Zod validation', async () => {
      const mockResponse = {
        Date: '2026-02-22',
        'Practitioner Name': 'Dr. Smith',
        'Visit Type': 'Follow-up',
        Reason: 'Knee pain',
        'Admin Needs': ['Referral']
      };

      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify(mockResponse),
            },
          },
        ],
      });

      const result = await parseAppointment('I have a follow-up with Dr. Smith tomorrow for my knee pain. Need a referral.');

      expect(result).toEqual(mockResponse);
      expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
        model: 'gpt-4o',
        response_format: { type: 'json_object' },
      }));
    });

    it('should strip unrecognized keys during Zod validation', async () => {
      const invalidResponse = {
        'Visit Type': 'Follow-up',
        SomeRandomKey: 'hello'
      };

      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify(invalidResponse),
            },
          },
        ],
      });

      // Zod should strip SomeRandomKey
      const result = await parseAppointment('hello');
      expect(result).toEqual({ 'Visit Type': 'Follow-up' });
    });
  });

  describe('parseMedication', () => {
    it('should parse medication with exact keys', async () => {
      const mockResponse = {
        'Brand Name': 'Advil',
        Dosage: '200mg',
        Reason: 'Headache'
      };
      mockCreate.mockResolvedValueOnce({ choices: [{ message: { content: JSON.stringify(mockResponse) } }] });
      const result = await parseMedication('Took Advil 200mg for headache');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('parseScript', () => {
    it('should parse scripts and referrals', async () => {
      const mockResponse = {
        Name: 'Physiotherapy Referral',
        Filled: false
      };
      mockCreate.mockResolvedValueOnce({ choices: [{ message: { content: JSON.stringify(mockResponse) } }] });
      const result = await parseScript('Got a physio referral today');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('clinical summary', () => {
    it('should generate a clinical summary with correct structure', async () => {
      const mockResponse = {
        chief_complaint: 'Right knee pain',
        medication_review: 'Taking Lyrica',
        patient_goal: 'Reduce pain'
      };

      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: JSON.stringify(mockResponse) } }],
      });

      const result = await generateClinicalSummary('My knee hurts and I take Lyrica');

      expect(result).toEqual(mockResponse);
    });

    it('should throw error for empty input', async () => {
      await expect(generateClinicalSummary('')).rejects.toThrow('Input text cannot be empty');
    });
  });
});
