import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createJournalEntry, updateJournalEntry, approveJournalEntry, processJournalEntry } from '@/app/actions/journal-actions';
import * as smartParser from '@/lib/openai/smart-parser';

// Mock dependencies
const mockFrom = vi.fn();
const mockInsert = vi.fn();
const mockSelect = vi.fn();
const mockSingle = vi.fn();
const mockUpdate = vi.fn();
const mockEq = vi.fn();
const mockFilter = vi.fn();
const mockOrder = vi.fn();
const mockLimit = vi.fn();
const mockMaybeSingle = vi.fn();

// Mock Supabase
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve({
    from: mockFrom,
  })),
}));

// Mock classifyIntent
vi.mock('@/lib/openai/smart-parser', async () => {
  const actual = await vi.importActual<typeof smartParser>('@/lib/openai/smart-parser');
  return {
    ...actual,
    classifyIntent: vi.fn(),
  };
});

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

import { revalidatePath } from 'next/cache';

describe('Journal Server Actions', () => {
  const mockChain: any = {
    eq: vi.fn(),
    filter: vi.fn(),
    order: vi.fn(),
    limit: vi.fn(),
    select: vi.fn(),
    maybeSingle: mockMaybeSingle,
    single: mockSingle,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    const hybridMock = () => {
      const p = Promise.resolve({ data: null, error: null });
      return Object.assign(p, mockChain);
    };

    mockChain.eq.mockImplementation(hybridMock);
    mockChain.filter.mockImplementation(hybridMock);
    mockChain.order.mockImplementation(hybridMock);
    mockChain.limit.mockImplementation(hybridMock);
    mockChain.select.mockImplementation(hybridMock);

    mockFrom.mockReturnValue({
      insert: mockInsert,
      select: mockSelect,
      update: mockUpdate,
    });
    
    mockInsert.mockReturnValue(mockChain);
    mockSelect.mockReturnValue(mockChain);
    mockUpdate.mockReturnValue(mockChain);
  });

  describe('createJournalEntry', () => {
    it('should ALWAYS create a NEW raw_text draft for appointment intent', async () => {
      const { classifyIntent } = await import('@/lib/openai/smart-parser');
      vi.mocked(classifyIntent).mockResolvedValue('appointment');
      mockSingle.mockResolvedValue({ data: { id: 'new-appt-id' }, error: null });

      const result = await createJournalEntry('Met with Dr. Smith', 'user-123');

      expect(result).toBe('new-appt-id');
      expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
        entry_type: 'raw_text',
        status: 'draft'
      }));
      expect(revalidatePath).toHaveBeenCalledWith('/journal');
    });

    it('should APPEND to existing raw_text draft if intent is journal', async () => {
      const { classifyIntent } = await import('@/lib/openai/smart-parser');
      vi.mocked(classifyIntent).mockResolvedValue('journal');

      mockMaybeSingle.mockResolvedValue({
        data: { id: 'existing-id', content: 'Old content', entry_type: 'raw_text' },
        error: null
      });

      const result = await createJournalEntry('New content', 'user-123');

      expect(result).toBe('existing-id');
      expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
        content: 'Old content\n\nNew content',
        entry_type: 'raw_text'
      }));
      expect(revalidatePath).toHaveBeenCalledWith('/journal');
    });

    it('should create NEW raw_text draft if none exists for today', async () => {
      const { classifyIntent } = await import('@/lib/openai/smart-parser');
      vi.mocked(classifyIntent).mockResolvedValue('journal');

      mockMaybeSingle.mockResolvedValue({ data: null, error: null });
      mockSingle.mockResolvedValue({ data: { id: 'new-journal-id' }, error: null });

      const result = await createJournalEntry('First entry of day', 'user-123');

      expect(result).toBe('new-journal-id');
      expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
        entry_type: 'raw_text',
        status: 'draft'
      }));
      expect(revalidatePath).toHaveBeenCalledWith('/journal');
    });
  });

  describe('updateJournalEntry', () => {
    it('should update entry and revalidate path', async () => {
      const id = 'test-id';
      const updates = { content: 'updated content' };

      await updateJournalEntry(id, updates);

      expect(mockFrom).toHaveBeenCalledWith('journal_entries');
      expect(mockUpdate).toHaveBeenCalledWith(updates);
      expect(mockChain.eq).toHaveBeenCalledWith('id', id);
      expect(revalidatePath).toHaveBeenCalledWith('/journal');
    });

    it('should throw error if update fails', async () => {
        mockMaybeSingle.mockResolvedValueOnce({ error: { message: 'DB Error' } });
        // Setting up a failure on a terminal call is better
        mockSingle.mockResolvedValueOnce({ error: { message: 'DB Error' } });
        // For updateJournalEntry, it awaits the chain which resolves via hybridMock
        // So we need to override hybridMock for this one
        mockChain.eq.mockResolvedValueOnce({ error: { message: 'DB Error' } });
        
        await expect(updateJournalEntry('id', {})).rejects.toThrow('DB Error');
    });
  });

  describe('approveJournalEntry', () => {
    it('should set status to approved and revalidate path', async () => {
      const id = 'test-id';

      await approveJournalEntry(id);

      expect(mockFrom).toHaveBeenCalledWith('journal_entries');
      expect(mockUpdate).toHaveBeenCalledWith({ status: 'approved' });
      expect(mockChain.eq).toHaveBeenCalledWith('id', id);
      expect(revalidatePath).toHaveBeenCalledWith('/journal');
    });
  });

  describe('processJournalEntry', () => {
    it('should fall back to synthetic ai_response when parser throws', async () => {
      // processJournalEntry does: from().select().eq().single() for the fetch
      // Override the select call to return a fresh chain that resolves the entry
      mockSelect.mockReturnValueOnce({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { content: 'My pain is bad today', entry_type: 'raw_text' },
            error: null,
          }),
        }),
      });

      // Mock classifyIntent to throw so we hit the catch block
      const { classifyIntent } = await import('@/lib/openai/smart-parser');
      vi.mocked(classifyIntent).mockRejectedValueOnce(new Error('API down'));

      const result = await processJournalEntry('test-id');

      expect(result).toEqual({ success: true });
      // Should update with synthetic fallback response
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          entry_type: 'journal',
          status: 'draft',
          ai_response: expect.objectContaining({
            Note: 'My pain is bad today',
            Feeling: 'My pain is bad today',
            Sleep: null,
            Pain: null,
          }),
        })
      );
      expect(revalidatePath).toHaveBeenCalledWith('/journal');
    });

    it('should fall back to synthetic ai_response when parser (not classifyIntent) throws', async () => {
      // Setup: fetch returns a raw_text entry
      mockSelect.mockReturnValueOnce({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { content: 'I need a Lyrica refill', entry_type: 'raw_text' },
            error: null,
          }),
        }),
      });

      // classifyIntent succeeds with 'medication', but parseMedication will throw
      const { classifyIntent } = await import('@/lib/openai/smart-parser');
      vi.mocked(classifyIntent).mockResolvedValueOnce('medication');

      // Mock parseMedication to throw
      const smartParserModule = await import('@/lib/openai/smart-parser');
      vi.spyOn(smartParserModule, 'parseMedication').mockRejectedValueOnce(new Error('Parser crashed'));

      const result = await processJournalEntry('test-id');

      expect(result).toEqual({ success: true });
      // Should still produce a journal entry with synthetic fallback
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          entry_type: 'journal',
          status: 'draft',
          ai_response: expect.objectContaining({
            Note: 'I need a Lyrica refill',
            Feeling: 'I need a Lyrica refill',
            Sleep: null,
            Pain: null,
          }),
        })
      );
      expect(revalidatePath).toHaveBeenCalledWith('/journal');
    });
  });
});
