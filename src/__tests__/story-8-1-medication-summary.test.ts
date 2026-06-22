import { describe, expect, it } from 'vitest';
import {
  groupMedicationEntries,
  isMedicationActive,
  getMedicationCategory,
  findDuplicateActiveMedication,
  formatMedicationLabel,
  mergeMedicationMention,
} from '@/lib/journal-entry-ai';
import type { JournalEntry, JsonObject } from '@/types/database';

function makeMed(id: string, ai: Partial<JsonObject>, options: Partial<JournalEntry> = {}): JournalEntry {
  return {
    id,
    user_id: 'sarah',
    content: 'content',
    transcription: null,
    audio_url: null,
    ai_response: { _intent: 'medication', ...ai } as JsonObject,
    created_at: '2026-06-15T09:00:00.000Z',
    updated_at: '2026-06-15T09:00:00.000Z',
    entry_type: 'journal',
    status: 'approved',
    tags: [],
    metadata: null,
    previous_status: null,
    ...options,
  };
}

describe('getMedicationCategory', () => {
  it('defaults to prescription when Category is absent', () => {
    expect(getMedicationCategory(makeMed('a', { 'Brand Name': 'Lyrica' }))).toBe('prescription');
  });

  it('returns supplement when Category is supplement', () => {
    expect(getMedicationCategory(makeMed('b', { 'Brand Name': 'Vitamin C', Category: 'supplement' }))).toBe('supplement');
  });
});

describe('isMedicationActive', () => {
  it('treats a medication with no stop date as active', () => {
    expect(isMedicationActive(makeMed('a', { 'Brand Name': 'Lyrica' }))).toBe(true);
  });

  it('treats a medication with a Date Stopped as inactive', () => {
    expect(isMedicationActive(makeMed('b', { 'Brand Name': 'Lyrica', 'Date Stopped': '01-05-2026' }))).toBe(false);
  });

  it('honours an explicit Is Active = false flag', () => {
    expect(isMedicationActive(makeMed('c', { 'Brand Name': 'Lyrica', 'Is Active': false }))).toBe(false);
  });
});

describe('groupMedicationEntries', () => {
  it('splits entries into active prescriptions, active supplements, and inactive', () => {
    const entries = [
      makeMed('rx-active', { 'Brand Name': 'Lyrica', Category: 'prescription' }),
      makeMed('supp-active', { 'Brand Name': 'Omega-3', Category: 'supplement' }),
      makeMed('rx-inactive', { 'Brand Name': 'Endone', Category: 'prescription', 'Date Stopped': '01-04-2026' }),
      makeMed('supp-inactive', { 'Brand Name': 'Vitamin D', Category: 'supplement', 'Is Active': false }),
    ];

    const { activePrescriptions, activeSupplements, inactive } = groupMedicationEntries(entries);

    expect(activePrescriptions.map((e) => e.id)).toEqual(['rx-active']);
    expect(activeSupplements.map((e) => e.id)).toEqual(['supp-active']);
    expect(inactive.map((e) => e.id)).toEqual(['rx-inactive', 'supp-inactive']);
  });
});

describe('formatMedicationLabel', () => {
  it('formats as "Brand Dosage (Generic)" when all present', () => {
    expect(
      formatMedicationLabel(makeMed('a', { 'Brand Name': 'Lyrica', Dosage: '75mg', 'Generic Name': 'Pregabalin' }))
    ).toBe('Lyrica 75mg (Pregabalin)');
  });

  it('omits missing parts gracefully', () => {
    expect(formatMedicationLabel(makeMed('a', { 'Brand Name': 'Panadol' }))).toBe('Panadol');
    expect(formatMedicationLabel(makeMed('b', { 'Generic Name': 'Paracetamol' }))).toBe('Paracetamol');
  });
});

describe('findDuplicateActiveMedication', () => {
  const existing = [
    makeMed('lyrica', { 'Brand Name': 'Lyrica', 'Generic Name': 'Pregabalin' }),
    makeMed('endone-stopped', { 'Brand Name': 'Endone', 'Date Stopped': '01-04-2026' }),
  ];

  it('matches an existing active medication by brand name (case-insensitive)', () => {
    const match = findDuplicateActiveMedication({ 'Brand Name': '  lyrica ' }, existing);
    expect(match?.id).toBe('lyrica');
  });

  it('matches by generic name when brand differs', () => {
    const match = findDuplicateActiveMedication({ 'Generic Name': 'pregabalin' }, existing);
    expect(match?.id).toBe('lyrica');
  });

  it('does not match inactive medications', () => {
    const match = findDuplicateActiveMedication({ 'Brand Name': 'Endone' }, existing);
    expect(match).toBeNull();
  });

  it('returns null when there is no match', () => {
    const match = findDuplicateActiveMedication({ 'Brand Name': 'Panadol' }, existing);
    expect(match).toBeNull();
  });

  it('returns null when the incoming medication has no name', () => {
    expect(findDuplicateActiveMedication({ Dosage: '10mg' }, existing)).toBeNull();
  });
});

describe('mergeMedicationMention', () => {
  const existingAi = { _intent: 'medication', 'Brand Name': 'Lyrica', Dosage: '75mg', 'Is Active': true };

  it('stamps Last Mentioned and preserves existing fields for a no-change mention', () => {
    const merged = mergeMedicationMention(existingAi, { 'Brand Name': 'Lyrica' }, '20-06-2026');
    expect(merged['Brand Name']).toBe('Lyrica');
    expect(merged.Dosage).toBe('75mg');
    expect(merged['Last Mentioned']).toBe('20-06-2026');
    expect(merged._intent).toBe('medication');
  });

  it('applies a stop: merges Date Stopped, Stop Reason and Is Active=false', () => {
    const incoming = {
      'Brand Name': 'Lyrica',
      'Is Active': false,
      'Date Stopped': '20-06-2026',
      'Stop Reason': 'Made me drowsy',
    };
    const merged = mergeMedicationMention(existingAi, incoming, '20-06-2026');
    expect(merged['Is Active']).toBe(false);
    expect(merged['Date Stopped']).toBe('20-06-2026');
    expect(merged['Stop Reason']).toBe('Made me drowsy');
  });

  it('the merged stop result is treated as inactive by isMedicationActive', () => {
    const incoming = { 'Brand Name': 'Lyrica', 'Is Active': false, 'Date Stopped': '20-06-2026' };
    const merged = mergeMedicationMention(existingAi, incoming, '20-06-2026');
    const entry = makeMed('lyrica', merged);
    expect(isMedicationActive(entry)).toBe(false);
  });

  it('does not clobber existing values with empty incoming strings', () => {
    const merged = mergeMedicationMention(existingAi, { 'Brand Name': 'Lyrica', Dosage: '' }, '20-06-2026');
    expect(merged.Dosage).toBe('75mg');
  });
});
