import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseAgenda, generateClinicalSummary, parseMedication, parseScript, classifyIntent, parseAppointment } from './smart-parser';

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
  });

  describe('parseDailyJournal', () => {
    it('should parse text into daily journal format', async () => {
      const mockResponse = {
        Sleep: '8 hours',
        Pain: '7',
        Feeling: 'Tired but okay',
        Action: 'Take a walk',
        Grateful: 'My dog',
        Medication: 'Panadol in morning',
        Mood: 'Ok'
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

      const { parseDailyJournal } = await import('./smart-parser');
      const result = await parseDailyJournal('Today is Monday. Slept 8 hours. Pain is 7 out of 10. Feeling tired but okay. I can take a walk to feel better. Grateful for my dog. Took Panadol in morning. Mood is ok.');

      expect(result).toEqual(mockResponse);
      expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
        model: 'gpt-4o',
        response_format: { type: 'json_object' },
      }));
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

  describe('parseJournal', () => {
    it('should parse text into journal items', async () => {
      const mockResponse = {
        agenda_items: [
          { category: 'Clinical', item: 'Knee pain' },
          { category: 'Admin', item: 'Buy milk' }
        ],
        questions: ['Is this normal?']
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

      const result = await parseAgenda('My knee hurts and I need milk. Is this normal?');

      expect(result).toEqual(mockResponse);
      expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
        model: 'gpt-4o',
        response_format: { type: 'json_object' },
      }));
    });

    it('should throw error for empty input', async () => {
      await expect(parseAgenda('')).rejects.toThrow('Input text cannot be empty');
    });

    it('should handle API errors for agenda parsing', async () => {
      mockCreate.mockRejectedValueOnce(new Error('API Error'));

      await expect(parseAgenda('test')).rejects.toThrow('Failed to parse agenda from text');
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
