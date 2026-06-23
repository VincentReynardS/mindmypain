import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';
import { selectTeamMemberEntries } from '@/lib/journal-entry-ai';
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

describe('selectTeamMemberEntries', () => {
  it('selects only entries with _intent === "team"', () => {
    const entries = [
      makeEntry('team-1', {
        _intent: 'team',
        Profession: 'General Practitioner',
        Name: 'Dr Sarah Smith',
      }),
      makeEntry('appt', {
        _intent: 'appointment',
        'Practitioner Name': 'Dr Jones',
      }),
      makeEntry('journal', { _intent: 'journal', Note: 'Felt good today' }),
    ];

    const result = selectTeamMemberEntries(entries);

    expect(result.teamMembers.map((e) => e.id)).toEqual(['team-1']);
  });

  it('ignores entries without ai_response', () => {
    const entry = makeEntry('no-ai', {});
    entry.ai_response = null;
    const result = selectTeamMemberEntries([entry]);
    expect(result.teamMembers).toEqual([]);
  });
});

describe('Team page', () => {
  it('exists at the (patient)/team route', () => {
    const pagePath = path.resolve(__dirname, '../app/(patient)/team/page.tsx');
    expect(fs.existsSync(pagePath)).toBe(true);
  });

  it('renders the "Team" header and "Your active teams." subheader', () => {
    const source = fs.readFileSync(
      path.resolve(__dirname, '../app/(patient)/team/page.tsx'),
      'utf-8'
    );
    expect(source).toContain('Team');
    expect(source).toContain('Your active teams.');
    expect(source).toContain('TeamMemberGlassBox');
  });
});
