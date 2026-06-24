/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TeamMemberGlassBox } from '@/components/patient/team-member-glass-box';
import type { JournalEntry } from '@/types/database';

const glassBoxCardSource = fs.readFileSync(
  path.resolve(__dirname, '../components/shared/glass-box/glass-box-card.tsx'),
  'utf-8'
);

const teamCardSource = fs.readFileSync(
  path.resolve(__dirname, '../components/patient/team-member-glass-box.tsx'),
  'utf-8'
);

describe('Care Team in GlassBoxCard', () => {
  it('should include team in AiResponseShape type and BADGE_CONFIG', () => {
    expect(glassBoxCardSource).toContain("'team'");
    expect(glassBoxCardSource).toContain("label: 'Care Team'");
  });

  it('should include SafeTeamMemberRender and dispatch to it', () => {
    expect(glassBoxCardSource).toContain('SafeTeamMemberRender');
    expect(glassBoxCardSource).toContain("case 'team': return <SafeTeamMemberRender");
  });

  it('should dispatch to TeamMemberEditForm in edit mode', () => {
    expect(glassBoxCardSource).toContain('TeamMemberEditForm');
    expect(glassBoxCardSource).toContain("case 'team':");
  });

  it('should render team fields: Profession, Name, Address, Email, Phone', () => {
    expect(glassBoxCardSource).toContain("key: 'Profession'");
    expect(glassBoxCardSource).toContain("key: 'Name'");
    expect(glassBoxCardSource).toContain("key: 'Address'");
    expect(glassBoxCardSource).toContain("key: 'Email'");
    expect(glassBoxCardSource).toContain("key: 'Phone'");
  });

  it('should not use the undefined calm-primary token in the team renderer', () => {
    // SafeTeamMemberRender is the last Safe*Render before parseJournalRecord.
    const start = glassBoxCardSource.indexOf('function SafeTeamMemberRender');
    const end = glassBoxCardSource.indexOf('function parseJournalRecord');
    const teamRenderer = glassBoxCardSource.slice(start, end);
    expect(teamRenderer).not.toContain('calm-primary');
  });
});

describe('TeamMemberGlassBox standalone card (source guards)', () => {
  it('should be a client component', () => {
    expect(teamCardSource).toContain('"use client"');
  });

  it('should have the Book online / Call / Message actions disabled (not rendered)', () => {
    expect(teamCardSource).not.toContain('Book online');
    expect(teamCardSource).not.toContain('mailto:');
    expect(teamCardSource).not.toContain('tel:');
  });

  it('should use a colored left border (green when added)', () => {
    expect(teamCardSource).toContain('border-l-4');
    expect(teamCardSource).toContain('border-calm-green');
  });

  it('should not use the undefined calm-primary token', () => {
    expect(teamCardSource).not.toContain('calm-primary');
  });
});

function makeTeamEntry(overrides: Partial<JournalEntry> = {}): JournalEntry {
  return {
    id: 'team-1',
    user_id: 'sarah',
    content: 'Profession: General Practitioner\nName: Dr Sarah Smith',
    transcription: null,
    audio_url: null,
    ai_response: {
      _intent: 'team',
      Profession: 'General Practitioner',
      Name: 'Dr Sarah Smith',
      Phone: '0400 000 000',
    },
    created_at: '2026-03-15T09:00:00.000Z',
    updated_at: '2026-03-15T09:00:00.000Z',
    entry_type: 'journal',
    status: 'draft',
    tags: [],
    metadata: null,
    previous_status: null,
    ...overrides,
  };
}

describe('TeamMemberGlassBox edit persistence (H1 regression)', () => {
  const onUpdate = vi.fn().mockResolvedValue(undefined);
  const onApprove = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => vi.clearAllMocks());

  it('renders provider fields from ai_response', () => {
    render(<TeamMemberGlassBox entry={makeTeamEntry()} onUpdate={onUpdate} onApprove={onApprove} />);
    expect(screen.getByText('Dr Sarah Smith')).toBeTruthy();
    expect(screen.getByText('General Practitioner')).toBeTruthy();
  });

  it('persists edits as a structured ai_response object (not a content-only string)', async () => {
    render(<TeamMemberGlassBox entry={makeTeamEntry()} onUpdate={onUpdate} onApprove={onApprove} />);

    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Dr Jane Doe' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => expect(onUpdate).toHaveBeenCalledTimes(1));

    const [id, aiResponse, contentText] = onUpdate.mock.calls[0];
    expect(id).toBe('team-1');
    // ai_response must be an object so the renderer (which prefers ai_response) reflects the edit
    expect(typeof aiResponse).toBe('object');
    expect((aiResponse as Record<string, unknown>).Name).toBe('Dr Jane Doe');
    // _intent must NOT leak into the persisted payload (M3)
    expect((aiResponse as Record<string, unknown>)._intent).toBeUndefined();
    // content is a human-readable mirror, not JSON
    expect(contentText).toContain('Name: Dr Jane Doe');
    expect(contentText).not.toContain('_intent');
  });

  it('clears emptied fields to null rather than dropping them', async () => {
    render(<TeamMemberGlassBox entry={makeTeamEntry()} onUpdate={onUpdate} onApprove={onApprove} />);

    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    fireEvent.change(screen.getByLabelText('Phone'), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => expect(onUpdate).toHaveBeenCalledTimes(1));
    const aiResponse = onUpdate.mock.calls[0][1] as Record<string, unknown>;
    expect(aiResponse.Phone).toBeNull();
  });
});
