import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseAgenda } from './smart-parser';

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

  it('should parse text into agenda items', async () => {
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
      model: 'gpt-5.2',
      response_format: { type: 'json_object' },
    }));
  });

  it('should throw error for empty input', async () => {
    await expect(parseAgenda('')).rejects.toThrow('Input text cannot be empty');
  });

  it('should handle API errors', async () => {
    mockCreate.mockRejectedValueOnce(new Error('API Error'));

    await expect(parseAgenda('test')).rejects.toThrow('Failed to parse agenda from text');
  });
});
