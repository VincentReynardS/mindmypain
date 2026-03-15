import { describe, expect, it } from 'vitest';
import { getPersistedIntent, isJournalReflectionEntry, normalizeImmunisationAiResponse, withPersistedIntent } from '@/lib/journal-entry-ai';
import type { JournalEntry } from '@/types/database';

function makeEntry(overrides: Partial<JournalEntry>): JournalEntry {
  return {
    id: 'entry-1',
    user_id: 'sarah',
    created_at: '2026-03-15T08:00:00.000Z',
    updated_at: '2026-03-15T08:00:00.000Z',
    content: 'Default journal content',
    transcription: null,
    audio_url: null,
    status: 'draft',
    entry_type: 'journal',
    ai_response: null,
    tags: [],
    metadata: null,
    previous_status: null,
    ...overrides,
  };
}

describe('journal-entry-ai utilities', () => {
  it('downgrades persisted intent to journal when a parser safety-net produced a journal shape', () => {
    expect(getPersistedIntent('immunisation', true)).toBe('journal');
    expect(getPersistedIntent('immunisation', false)).toBe('immunisation');
  });

  it('attaches _intent to the saved ai_response', () => {
    expect(withPersistedIntent({ Note: 'hello' }, 'journal')).toEqual({
      Note: 'hello',
      _intent: 'journal',
    });
  });

  it('normalizes immunisation dates and rejects invalid ones', () => {
    expect(
      normalizeImmunisationAiResponse({
        'Vaccine Name': 'Tetanus',
        'Date Given': '2026-03-15',
        'Brand Name': 'Boostrix',
      })
    ).toEqual({
      'Vaccine Name': 'Tetanus',
      'Date Given': '15-03-2026',
      'Brand Name': 'Boostrix',
    });

    expect(() =>
      normalizeImmunisationAiResponse({
        'Date Given': 'sometime last week',
      })
    ).toThrow('Date Given must be a valid dd-mm-yyyy date');
  });

  it('keeps only journal entries in the dedicated journal view', () => {
    expect(
      isJournalReflectionEntry(makeEntry({
        id: 'journal-1',
        content: 'Today I felt calmer after my walk.',
        ai_response: { Note: 'Today I felt calmer after my walk.', _intent: 'journal' },
      }))
    ).toBe(true);

    expect(
      isJournalReflectionEntry(makeEntry({
        id: 'med-1',
        content: 'Need a refill for prednisone.',
        ai_response: { 'Brand Name': 'Prednisone', _intent: 'medication' },
      }))
    ).toBe(false);
  });

  it('keeps raw reflections but excludes obvious medical raw drafts', () => {
    expect(
      isJournalReflectionEntry(makeEntry({
        id: 'raw-journal',
        content: 'I am exhausted and frustrated today.',
        entry_type: 'raw_text',
        ai_response: null,
      }))
    ).toBe(true);

    expect(
      isJournalReflectionEntry(makeEntry({
        id: 'raw-medical',
        content: 'Need a doctor appointment and medication refill.',
        entry_type: 'raw_text',
        ai_response: null,
      }))
    ).toBe(false);
  });
});
