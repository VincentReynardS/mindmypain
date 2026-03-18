import { describe, expect, it } from 'vitest';
import { selectMedicationEntries } from '@/lib/journal-entry-ai';
import type { JournalEntry, JsonObject } from '@/types/database';

function makeEntry(
  id: string,
  options: Partial<JournalEntry> = {}
): JournalEntry {
  return {
    id,
    user_id: 'sarah',
    content: 'content',
    transcription: null,
    audio_url: null,
    ai_response: null,
    created_at: '2026-03-15T09:00:00.000Z',
    updated_at: '2026-03-15T09:00:00.000Z',
    entry_type: 'journal',
    status: 'draft',
    tags: [],
    metadata: null,
    previous_status: null,
    ...options,
  };
}

describe('selectMedicationEntries', () => {
  it('keeps legacy medication entries with JSON content and schedules them for backfill', () => {
    const legacyEntry = makeEntry('legacy', {
      content: JSON.stringify({
        'Brand Name': 'Aspirin',
        Dosage: '100mg',
      }),
    });

    const result = selectMedicationEntries([legacyEntry]);

    expect(result.medications.map((entry) => entry.id)).toEqual(['legacy']);
    expect(result.toBackfill).toEqual([{ id: 'legacy', intent: 'medication' }]);
  });

  it('prefers persisted medication intent even when brand and dosage are absent', () => {
    const persistedEntry = makeEntry('persisted', {
      ai_response: {
        _intent: 'medication',
        Notes: 'Take after dinner',
      } as JsonObject,
    });

    const result = selectMedicationEntries([persistedEntry]);

    expect(result.medications.map((entry) => entry.id)).toEqual(['persisted']);
    expect(result.toBackfill).toEqual([]);
  });

  it('separates journal medication mentions from dedicated medication entries', () => {
    const mentionEntry = makeEntry('mention', {
      ai_response: {
        _intent: 'journal',
        Medication: 'Mentioned Panadol in passing',
      } as JsonObject,
    });

    const result = selectMedicationEntries([mentionEntry]);

    expect(result.medications).toEqual([]);
    expect(result.mentions).toEqual([
      {
        entryId: 'mention',
        date: '2026-03-15T09:00:00.000Z',
        medication: 'Mentioned Panadol in passing',
      },
    ]);
  });

  it('does not classify appointment-shaped entries as medications just because they have Reason and Notes', () => {
    const appointmentEntry = makeEntry('appointment-ish', {
      ai_response: {
        Date: '12-04-2026',
        'Practitioner Name': 'Dr. Sharma',
        Reason: 'Fibromyalgia assessment',
        Notes: 'Going to take my list of questions.',
      } as JsonObject,
    });

    const result = selectMedicationEntries([appointmentEntry]);

    expect(result.medications).toEqual([]);
    expect(result.mentions).toEqual([]);
    expect(result.toBackfill).toEqual([]);
  });
});
