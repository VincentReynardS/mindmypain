import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateJournalEntry, approveJournalEntry } from '@/app/actions/journal-actions';

// Mock dependencies
const mockFrom = vi.fn();
const mockUpdate = vi.fn();
const mockEq = vi.fn();
const mockSelect = vi.fn();
const mockSingle = vi.fn();

// Chain the mocks
mockFrom.mockReturnValue({
  update: mockUpdate,
  select: mockSelect,
});
mockUpdate.mockReturnValue({
  eq: mockEq,
});
mockEq.mockReturnValue({
    error: null
});
mockSelect.mockReturnValue({
    eq: mockSingle // Approximating structure for select().eq().single() if needed
});

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve({
    from: mockFrom,
  })),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

import { revalidatePath } from 'next/cache';

describe('Journal Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset chain standard return values
    mockFrom.mockReturnValue({ update: mockUpdate });
    mockUpdate.mockReturnValue({ eq: mockEq });
    mockEq.mockResolvedValue({ error: null });
  });

  describe('updateJournalEntry', () => {
    it('should update entry and revalidate path', async () => {
      const id = 'test-id';
      const updates = { content: 'updated content' };

      await updateJournalEntry(id, updates);

      expect(mockFrom).toHaveBeenCalledWith('journal_entries');
      expect(mockUpdate).toHaveBeenCalledWith(updates);
      expect(mockEq).toHaveBeenCalledWith('id', id);
      expect(revalidatePath).toHaveBeenCalledWith('/app/journal');
    });

    it('should throw error if update fails', async () => {
        mockEq.mockResolvedValueOnce({ error: { message: 'DB Error' } });
        
        await expect(updateJournalEntry('id', {})).rejects.toThrow('DB Error');
    });
  });

  describe('approveJournalEntry', () => {
    it('should set status to approved and revalidate path', async () => {
      const id = 'test-id';

      await approveJournalEntry(id);

      expect(mockFrom).toHaveBeenCalledWith('journal_entries');
      expect(mockUpdate).toHaveBeenCalledWith({ status: 'approved' });
      expect(mockEq).toHaveBeenCalledWith('id', id);
      expect(revalidatePath).toHaveBeenCalledWith('/app/journal');
    });
  });
});
