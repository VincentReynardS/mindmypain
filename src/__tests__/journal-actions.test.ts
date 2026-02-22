import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createJournalEntry, updateJournalEntry, approveJournalEntry } from '@/app/actions/journal-actions';
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
    it('should ALWAYS create a NEW record for appointment intent', async () => {
      const { classifyIntent } = await import('@/lib/openai/smart-parser');
      vi.mocked(classifyIntent).mockResolvedValue('appointment');
      mockSingle.mockResolvedValue({ data: { id: 'new-appt-id' }, error: null });

      const result = await createJournalEntry('Met with Dr. Smith', 'user-123');

      expect(result).toBe('new-appt-id');
      expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
        entry_type: 'raw_text',
        status: 'approved'
      }));
      expect(revalidatePath).toHaveBeenCalledWith('/journal');
    });

    it('should APPEND to existing journal entry if intent is journal', async () => {
      const { classifyIntent } = await import('@/lib/openai/smart-parser');
      vi.mocked(classifyIntent).mockResolvedValue('journal');
      
      mockMaybeSingle.mockResolvedValue({ 
        data: { id: 'existing-id', content: 'Old content', entry_type: 'journal' }, 
        error: null 
      });

      const result = await createJournalEntry('New content', 'user-123');

      expect(result).toBe('existing-id');
      expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
        content: 'Old content\n\nNew content',
        entry_type: 'journal'
      }));
      expect(revalidatePath).toHaveBeenCalledWith('/journal');
    });

    it('should create NEW journal entry if none exists for today', async () => {
      const { classifyIntent } = await import('@/lib/openai/smart-parser');
      vi.mocked(classifyIntent).mockResolvedValue('journal');
      
      mockMaybeSingle.mockResolvedValue({ data: null, error: null });
      mockSingle.mockResolvedValue({ data: { id: 'new-journal-id' }, error: null });

      const result = await createJournalEntry('First entry of day', 'user-123');

      expect(result).toBe('new-journal-id');
      expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
        entry_type: 'journal',
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
});
