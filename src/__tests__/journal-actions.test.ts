import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createJournalEntry, updateJournalEntry, approveJournalEntry, processJournalEntry, updateJournalAiResponse, updateScriptOrReferralEntry, archiveJournalEntry, restoreJournalEntry, permanentlyDeleteJournalEntry, bulkDeleteArchivedEntries } from '@/app/actions/journal-actions';
import * as smartParser from '@/lib/openai/smart-parser';

// Mock dependencies
const mockFrom = vi.fn();
const mockInsert = vi.fn();
const mockSelect = vi.fn();
const mockSingle = vi.fn();
const mockMaybeSingle = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();

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
  type MockChain = {
    eq: ReturnType<typeof vi.fn>;
    neq: ReturnType<typeof vi.fn>;
    in: ReturnType<typeof vi.fn>;
    filter: ReturnType<typeof vi.fn>;
    order: ReturnType<typeof vi.fn>;
    limit: ReturnType<typeof vi.fn>;
    select: ReturnType<typeof vi.fn>;
    maybeSingle: typeof mockMaybeSingle;
    single: typeof mockSingle;
  };

  const mockChain: MockChain = {
    eq: vi.fn(),
    neq: vi.fn(),
    in: vi.fn(),
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
    mockChain.neq.mockImplementation(hybridMock);
    mockChain.in.mockImplementation(hybridMock);
    mockChain.filter.mockImplementation(hybridMock);
    mockChain.order.mockImplementation(hybridMock);
    mockChain.limit.mockImplementation(hybridMock);
    mockChain.select.mockImplementation(hybridMock);
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });

    mockFrom.mockReturnValue({
      insert: mockInsert,
      select: mockSelect,
      update: mockUpdate,
      delete: mockDelete,
    });
    mockDelete.mockReturnValue(mockChain);
    
    mockInsert.mockReturnValue(mockChain);
    mockSelect.mockReturnValue(mockChain);
    mockUpdate.mockReturnValue(mockChain);
  });

  describe('createJournalEntry', () => {
    it('should create a NEW raw_text draft when no same-day draft exists', async () => {
      mockSingle.mockResolvedValue({ data: { id: 'new-appt-id' }, error: null });
      mockMaybeSingle.mockResolvedValueOnce({ data: null, error: null });

      const result = await createJournalEntry('Met with Dr. Smith', 'user-123');

      expect(result).toBe('new-appt-id');
      expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
        entry_type: 'raw_text',
        status: 'draft'
      }));
      expect(revalidatePath).toHaveBeenCalledWith('/journal');
    });

    it('should APPEND to existing raw_text draft for same-day raw_text input', async () => {
      mockMaybeSingle.mockResolvedValue({
        data: { id: 'existing-id', content: 'Old content' },
        error: null,
      });

      const result = await createJournalEntry('New content', 'user-123');

      expect(result).toBe('existing-id');
      expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
        content: 'Old content\n\nNew content'
      }));
      expect(revalidatePath).toHaveBeenCalledWith('/journal');
    });

    it('should NOT merge into existing processed journal draft', async () => {
      mockMaybeSingle.mockResolvedValue({ data: null, error: null });
      mockSingle.mockResolvedValue({ data: { id: 'new-journal-id' }, error: null });

      const result = await createJournalEntry('New content', 'user-123');

      expect(result).toBe('new-journal-id');
      expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
        entry_type: 'raw_text',
        status: 'draft',
      }));
      expect(revalidatePath).toHaveBeenCalledWith('/journal');
    });

    it('should NOT merge into a processed appointment entry', async () => {
      // Query returns an appointment that was processed (entry_type='journal' but appointment-shaped ai_response)
      mockMaybeSingle.mockResolvedValue({ data: null, error: null });
      mockSingle.mockResolvedValue({ data: { id: 'new-journal-id' }, error: null });

      const result = await createJournalEntry('I slept 7 hours', 'user-123');

      // Should create a new entry, not merge into the appointment
      expect(result).toBe('new-journal-id');
      expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
        entry_type: 'raw_text',
        status: 'draft',
      }));
    });

    it('should create NEW raw_text draft if none exists for today', async () => {
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

    it('should fall back to synthetic ai_response when parser returns only non-meaningful values', async () => {
      mockSelect.mockReturnValueOnce({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { content: 'Need a referral please', entry_type: 'raw_text' },
            error: null,
          }),
        }),
      });

      const { classifyIntent } = await import('@/lib/openai/smart-parser');
      vi.mocked(classifyIntent).mockResolvedValueOnce('script');

      const smartParserModule = await import('@/lib/openai/smart-parser');
      vi.spyOn(smartParserModule, 'parseScript').mockResolvedValueOnce({ Filled: false });

      const result = await processJournalEntry('test-id');

      expect(result).toEqual({ success: true });
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          entry_type: 'journal',
          status: 'draft',
          ai_response: expect.objectContaining({
            Note: 'Need a referral please',
            Sleep: null,
            Pain: null,
          }),
        })
      );
      expect(revalidatePath).toHaveBeenCalledWith('/journal');
    });

    it('should preserve parser response when it contains meaningful values', async () => {
      mockSelect.mockReturnValueOnce({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { content: 'Need a physio referral', entry_type: 'raw_text' },
            error: null,
          }),
        }),
      });

      const { classifyIntent } = await import('@/lib/openai/smart-parser');
      vi.mocked(classifyIntent).mockResolvedValueOnce('script');

      const smartParserModule = await import('@/lib/openai/smart-parser');
      vi.spyOn(smartParserModule, 'parseScript').mockResolvedValueOnce({
        Name: 'Physio referral',
        Filled: false,
      });

      const result = await processJournalEntry('test-id');

      expect(result).toEqual({ success: true });
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          entry_type: 'journal',
          status: 'draft',
          ai_response: expect.objectContaining({
            Name: 'Physio referral',
            Filled: false,
          }),
        })
      );
      expect(revalidatePath).toHaveBeenCalledWith('/journal');
    });

    it('should not attempt journal-merge when intent is non-journal with sparse parser output', async () => {
      mockSelect.mockReturnValueOnce({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'raw-entry-id',
              user_id: 'user-123',
              created_at: '2026-03-05T08:00:00Z',
              status: 'draft',
              content: 'Need follow-up soon',
              entry_type: 'raw_text',
            },
            error: null,
          }),
        }),
      });

      const { classifyIntent } = await import('@/lib/openai/smart-parser');
      vi.mocked(classifyIntent).mockResolvedValueOnce('appointment');

      const smartParserModule = await import('@/lib/openai/smart-parser');
      vi.spyOn(smartParserModule, 'parseAppointment').mockResolvedValueOnce({
        Reason: 'Need follow-up soon',
      } as never);

      const result = await processJournalEntry('raw-entry-id');

      expect(result).toEqual({ success: true });
      expect(mockChain.limit).not.toHaveBeenCalled();
      expect(mockDelete).not.toHaveBeenCalled();
      expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
        entry_type: 'journal',
        status: 'draft',
        ai_response: expect.objectContaining({
          Reason: 'Need follow-up soon',
        }),
      }));
      expect(mockChain.eq).toHaveBeenCalledWith('id', 'raw-entry-id');
    });

    it('should merge into existing same-day journal draft when organized result is journal-shaped', async () => {
      // 1) Fetch current raw entry
      mockSelect.mockReturnValueOnce({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'raw-entry-id',
              user_id: 'user-123',
              created_at: '2026-03-05T08:00:00Z',
              status: 'draft',
              content: 'I slept for 7 hours',
              entry_type: 'raw_text',
            },
            error: null,
          }),
        }),
      });

      // 2) Intent + parser returns journal-shape
      const { classifyIntent } = await import('@/lib/openai/smart-parser');
      vi.mocked(classifyIntent).mockResolvedValueOnce('journal');

      const smartParserModule = await import('@/lib/openai/smart-parser');
      vi.spyOn(smartParserModule, 'parseJournal')
        .mockResolvedValueOnce({
          Sleep: '7 hours',
          Pain: null,
          Feeling: null,
          Action: null,
          Grateful: null,
          Medication: null,
          Mood: null,
          Note: null,
          Appointments: [],
          Scripts: [],
        } as never)
        .mockResolvedValueOnce({
          Sleep: '7 hours',
          Pain: null,
          Feeling: null,
          Action: null,
          Grateful: null,
          Medication: null,
          Mood: null,
          Note: 'Merged note',
          Appointments: [],
          Scripts: [],
        } as never);

      // 3) Existing same-day journal candidate for merge
      mockChain.limit.mockResolvedValueOnce({
        data: [{
          id: 'existing-journal-id',
          content: "At Adrian's appointment, 180 Cash, add to finance section.",
          status: 'draft',
          ai_response: { Sleep: null, Pain: null, Note: 'Finance reminder' },
        }],
        error: null,
      });

      const result = await processJournalEntry('raw-entry-id');

      expect(result).toEqual({ success: true });
      expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
        content: "At Adrian's appointment, 180 Cash, add to finance section.\n\nI slept for 7 hours",
        entry_type: 'journal',
        status: 'draft',
        ai_response: expect.objectContaining({ Note: 'Merged note' }),
      }));
      expect(mockChain.eq).toHaveBeenCalledWith('id', 'existing-journal-id');
      expect(mockDelete).toHaveBeenCalled();
      expect(mockChain.eq).toHaveBeenCalledWith('id', 'raw-entry-id');
      expect(revalidatePath).toHaveBeenCalledWith('/journal');
    });

    it('should merge into existing same-day approved journal entry and keep it approved', async () => {
      // 1) Fetch current raw entry
      mockSelect.mockReturnValueOnce({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'raw-entry-id',
              user_id: 'user-123',
              created_at: '2026-03-05T08:00:00Z',
              status: 'draft',
              content: 'I slept for 7 hours',
              entry_type: 'raw_text',
            },
            error: null,
          }),
        }),
      });

      // 2) Intent + parser returns journal-shape
      const { classifyIntent } = await import('@/lib/openai/smart-parser');
      vi.mocked(classifyIntent).mockResolvedValueOnce('journal');

      const smartParserModule = await import('@/lib/openai/smart-parser');
      vi.spyOn(smartParserModule, 'parseJournal')
        .mockResolvedValueOnce({
          Sleep: '7 hours',
          Pain: null,
          Feeling: null,
          Action: null,
          Grateful: null,
          Medication: null,
          Mood: null,
          Note: null,
          Appointments: [],
          Scripts: [],
        } as never)
        .mockResolvedValueOnce({
          Sleep: '7 hours',
          Pain: null,
          Feeling: null,
          Action: null,
          Grateful: null,
          Medication: null,
          Mood: null,
          Note: 'Merged into approved',
          Appointments: [],
          Scripts: [],
        } as never);

      // 3) Existing same-day approved journal candidate for merge
      mockChain.limit.mockResolvedValueOnce({
        data: [{
          id: 'approved-journal-id',
          content: 'Older approved journal content.',
          status: 'approved',
          ai_response: { Sleep: '8', Note: 'Earlier note' },
        }],
        error: null,
      });

      const result = await processJournalEntry('raw-entry-id');

      expect(result).toEqual({ success: true });
      expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
        content: 'Older approved journal content.\n\nI slept for 7 hours',
        entry_type: 'journal',
        status: 'approved',
        ai_response: expect.objectContaining({ Note: 'Merged into approved' }),
      }));
      expect(mockChain.eq).toHaveBeenCalledWith('id', 'approved-journal-id');
      expect(mockDelete).toHaveBeenCalled();
      expect(mockChain.eq).toHaveBeenCalledWith('id', 'raw-entry-id');
    });

    it('should not run synthetic fallback if merge target update succeeds but source delete fails', async () => {
      mockSelect.mockReturnValueOnce({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'raw-entry-id',
              user_id: 'user-123',
              created_at: '2026-03-05T08:00:00Z',
              status: 'draft',
              content: 'I slept for 7 hours',
              entry_type: 'raw_text',
            },
            error: null,
          }),
        }),
      });

      const { classifyIntent } = await import('@/lib/openai/smart-parser');
      vi.mocked(classifyIntent).mockResolvedValueOnce('journal');

      const smartParserModule = await import('@/lib/openai/smart-parser');
      vi.spyOn(smartParserModule, 'parseJournal')
        .mockResolvedValueOnce({
          Sleep: '7 hours',
          Pain: null,
          Feeling: null,
          Action: null,
          Grateful: null,
          Medication: null,
          Mood: null,
          Note: null,
          Appointments: [],
          Scripts: [],
        } as never)
        .mockResolvedValueOnce({
          Sleep: '7 hours',
          Pain: null,
          Feeling: null,
          Action: null,
          Grateful: null,
          Medication: null,
          Mood: null,
          Note: 'Merged note',
          Appointments: [],
          Scripts: [],
        } as never);

      mockChain.limit.mockResolvedValueOnce({
        data: [{
          id: 'existing-journal-id',
          content: 'Existing note',
          status: 'draft',
          ai_response: { Sleep: null, Note: 'Existing note' },
        }],
        error: null,
      });

      const deleteEq = vi.fn()
        .mockResolvedValueOnce({ data: null, error: { message: 'Delete failed' } })
        .mockResolvedValueOnce({ data: null, error: null });
      mockDelete
        .mockReturnValueOnce({ eq: deleteEq })
        .mockReturnValueOnce({ eq: deleteEq });

      const result = await processJournalEntry('raw-entry-id');

      expect(result).toEqual({ success: true });
      expect(mockUpdate).toHaveBeenCalledTimes(1);
      expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
        content: 'Existing note\n\nI slept for 7 hours',
        entry_type: 'journal',
        status: 'draft',
      }));
      expect(mockDelete).toHaveBeenCalledTimes(2);
      expect(deleteEq).toHaveBeenCalledWith('id', 'raw-entry-id');
    });

    it('should not merge into appointment-shaped same-day entries', async () => {
      // 1) Fetch current raw entry
      mockSelect.mockReturnValueOnce({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'raw-entry-id',
              user_id: 'user-123',
              created_at: '2026-03-05T08:00:00Z',
              status: 'draft',
              content: 'I slept for 7 hours',
              entry_type: 'raw_text',
            },
            error: null,
          }),
        }),
      });

      // 2) Intent + parser returns journal-shape
      const { classifyIntent } = await import('@/lib/openai/smart-parser');
      vi.mocked(classifyIntent).mockResolvedValueOnce('journal');
      const smartParserModule = await import('@/lib/openai/smart-parser');
      vi.spyOn(smartParserModule, 'parseJournal').mockResolvedValueOnce({
        Sleep: '7 hours',
        Pain: null,
        Feeling: null,
        Action: null,
        Grateful: null,
        Medication: null,
        Mood: null,
        Note: null,
        Appointments: [],
        Scripts: [],
      } as never);

      // 3) Same-day candidates exist but all appointment-shaped
      mockChain.limit.mockResolvedValueOnce({
        data: [{
          id: 'appointment-id',
          content: 'Need to meet Dr. Chen',
          status: 'draft',
          ai_response: { Date: 'next Tuesday', 'Practitioner Name': 'Dr. Chen' },
        }],
        error: null,
      });

      const result = await processJournalEntry('raw-entry-id');

      expect(result).toEqual({ success: true });
      // Falls back to regular "update this row" path
      expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
        entry_type: 'journal',
        status: 'draft',
      }));
      expect(mockChain.eq).toHaveBeenCalledWith('id', 'raw-entry-id');
    });
  });

  describe('updateJournalAiResponse', () => {
    it('should update both ai_response and content columns', async () => {
      const aiResponse = { Sleep: '8 hours', Pain: '3/10', Feeling: 'Good', Action: null, Grateful: null, Medication: null, Mood: 'Good', Note: null, Appointments: null, Scripts: null };
      const contentText = 'Sleep: 8 hours\nPain: 3/10\nMood: Good\nFeeling: Good';

      await updateJournalAiResponse('entry-123', aiResponse, contentText);

      expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
        ai_response: aiResponse,
        content: contentText,
      }));
      expect(revalidatePath).toHaveBeenCalledWith('/journal');
      expect(revalidatePath).toHaveBeenCalledWith('/appointments');
      expect(revalidatePath).toHaveBeenCalledWith('/medications');
      expect(revalidatePath).toHaveBeenCalledWith('/scripts');
    });

    it('should NOT change entry status', async () => {
      const aiResponse = { Sleep: '8 hours' };
      await updateJournalAiResponse('entry-123', aiResponse, 'Sleep: 8 hours');

      // The update call should NOT contain a status field
      const updateArg = mockUpdate.mock.calls[0][0];
      expect(updateArg).not.toHaveProperty('status');
    });

    it('should throw on Supabase error', async () => {
      const hybridError = () => {
        const p = Promise.resolve({ data: null, error: { message: 'DB error' } });
        return Object.assign(p, { eq: vi.fn().mockReturnValue(p) });
      };
      mockUpdate.mockReturnValue(hybridError());

      await expect(updateJournalAiResponse('entry-123', {}, '')).rejects.toThrow('DB error');
    });
  });
  describe('updateScriptOrReferralEntry', () => {
    it('should update nested Scripts array for virtual IDs', async () => {
      // Mock the select call for virtual ID branch
      mockSingle.mockResolvedValueOnce({
        data: {
          ai_response: {
            Scripts: [{ Name: 'Panadol', Filled: false }, { Name: 'Nurofen', Filled: false }]
          }
        },
        error: null
      });

      await updateScriptOrReferralEntry('realId123_script_1', true);

      expect(mockFrom).toHaveBeenCalledWith('journal_entries');
      expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
        ai_response: expect.objectContaining({
          Scripts: [{ Name: 'Panadol', Filled: false }, { Name: 'Nurofen', Filled: true }]
        })
      }));
      expect(mockChain.eq).toHaveBeenCalledWith('id', 'realId123');
      expect(revalidatePath).toHaveBeenCalledWith('/scripts');
      expect(revalidatePath).toHaveBeenCalledWith('/journal');
    });

    it('should update content JSON for legacy/flat script entries', async () => {
      // Setup legacy fetch
      mockSingle.mockResolvedValueOnce({
        data: {
          content: '{"Name":"Panadol","Filled":false,"Reason":"Pain"}',
          ai_response: { Name: 'Panadol', Filled: false, Reason: 'Pain' }
        },
        error: null
      });

      await updateScriptOrReferralEntry('legacy-id-123', true);

      expect(mockFrom).toHaveBeenCalledWith('journal_entries');
      expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
        content: '{"Name":"Panadol","Filled":true,"Reason":"Pain"}',
        ai_response: expect.objectContaining({ Filled: true })
      }));
      expect(mockChain.eq).toHaveBeenCalledWith('id', 'legacy-id-123');
      expect(revalidatePath).toHaveBeenCalledWith('/scripts');
      expect(revalidatePath).toHaveBeenCalledWith('/journal');
    });

    it('should handle invalid JSON gracefully for legacy entries', async () => {
      mockSingle.mockResolvedValueOnce({
        data: {
          content: 'Not a JSON'
        },
        error: null
      });

      await updateScriptOrReferralEntry('legacy-id-456', true);

      expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
        content: '{"Filled":true}'
      }));
    });
  });

  describe('archiveJournalEntry', () => {
    it('should save current status to previous_status and set archived', async () => {
      // First call: select().eq().single() to fetch current status
      mockSelect.mockReturnValueOnce({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { status: 'approved' },
            error: null,
          }),
        }),
      });

      await archiveJournalEntry('entry-1');

      expect(mockFrom).toHaveBeenCalledWith('journal_entries');
      expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
        status: 'archived',
        previous_status: 'approved',
      }));
      expect(revalidatePath).toHaveBeenCalledWith('/journal');
      expect(revalidatePath).toHaveBeenCalledWith('/medications');
      expect(revalidatePath).toHaveBeenCalledWith('/appointments');
      expect(revalidatePath).toHaveBeenCalledWith('/scripts');
    });
  });

  describe('restoreJournalEntry', () => {
    it('should restore previous_status and clear column', async () => {
      mockSelect.mockReturnValueOnce({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { previous_status: 'approved' },
            error: null,
          }),
        }),
      });

      await restoreJournalEntry('entry-1');

      expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
        status: 'approved',
        previous_status: null,
      }));
      expect(revalidatePath).toHaveBeenCalledWith('/journal');
    });

    it('should default to draft if previous_status is null', async () => {
      mockSelect.mockReturnValueOnce({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { previous_status: null },
            error: null,
          }),
        }),
      });

      await restoreJournalEntry('entry-2');

      expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
        status: 'draft',
        previous_status: null,
      }));
    });
  });

  describe('permanentlyDeleteJournalEntry', () => {
    it('should hard delete a single entry', async () => {
      await permanentlyDeleteJournalEntry('entry-1');

      expect(mockFrom).toHaveBeenCalledWith('journal_entries');
      expect(mockDelete).toHaveBeenCalled();
      expect(mockChain.eq).toHaveBeenCalledWith('id', 'entry-1');
      expect(revalidatePath).toHaveBeenCalledWith('/journal');
    });
  });

  describe('bulkDeleteArchivedEntries', () => {
    it('should hard delete all archived entries for user', async () => {
      await bulkDeleteArchivedEntries('user-123');

      expect(mockFrom).toHaveBeenCalledWith('journal_entries');
      expect(mockDelete).toHaveBeenCalled();
      expect(mockChain.eq).toHaveBeenCalledWith('user_id', 'user-123');
      expect(mockChain.eq).toHaveBeenCalledWith('status', 'archived');
      expect(revalidatePath).toHaveBeenCalledWith('/journal');
    });
  });
});
