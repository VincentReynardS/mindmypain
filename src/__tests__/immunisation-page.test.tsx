import { describe, expect, it } from 'vitest';
import { selectImmunisationEntries } from '@/lib/journal-entry-ai';
import type { JournalEntry, JsonObject } from '@/types/database';

function makeEntry(id: string, aiResponse: Record<string, unknown>): JournalEntry {
  return {
    id,
    user_id: 'sarah',
    content: 'content',
    transcription: null,
    audio_url: null,
    ai_response: aiResponse as JsonObject,
    created_at: '2026-03-15T09:00:00.000Z',
    updated_at: '2026-03-15T09:00:00.000Z',
    entry_type: 'journal',
    status: 'draft',
    tags: [],
    metadata: null,
    previous_status: null,
  };
}

describe('selectImmunisationEntries', () => {
  it('keeps legacy immunisation entries with Vaccine Name even when Brand Name is also present', () => {
    const entries = [
      makeEntry('legacy-immunisation', {
        'Vaccine Name': 'COVID-19 Booster',
        'Brand Name': 'Pfizer',
      }),
      makeEntry('medication', {
        'Brand Name': 'Panadol',
        'Generic Name': 'Paracetamol',
      }),
    ];

    const result = selectImmunisationEntries(entries);

    expect(result.immunisations.map((entry) => entry.id)).toEqual(['legacy-immunisation']);
    expect(result.toBackfill).toEqual([{ id: 'legacy-immunisation', intent: 'immunisation' }]);
  });

  it('prefers persisted _intent for already-classified immunisation entries', () => {
    const entries = [
      makeEntry('persisted', {
        _intent: 'immunisation',
        'Vaccine Name': 'Influenza',
        'Brand Name': 'Fluad',
      }),
      makeEntry('journal', {
        _intent: 'journal',
        'Vaccine Name': 'Should not show',
      }),
    ];

    const result = selectImmunisationEntries(entries);

    expect(result.immunisations.map((entry) => entry.id)).toEqual(['persisted']);
    expect(result.toBackfill).toEqual([]);
  });
});
