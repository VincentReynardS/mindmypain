import { describe, expect, it } from 'vitest';
import { getPersistedIntent, normalizeImmunisationAiResponse, withPersistedIntent } from '@/lib/journal-entry-ai';

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
});
