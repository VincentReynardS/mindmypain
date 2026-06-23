import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

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
});

describe('TeamMemberGlassBox standalone card', () => {
  it('should be a client component', () => {
    expect(teamCardSource).toContain('"use client"');
  });

  it('should have the Book online / Call / Message actions disabled (not rendered)', () => {
    expect(teamCardSource).not.toContain('Book online');
    expect(teamCardSource).not.toContain('mailto:');
    expect(teamCardSource).not.toContain('tel:');
  });

  it('should expose an Edit control', () => {
    expect(teamCardSource).toContain('Edit');
    expect(teamCardSource).toContain('setIsEditing(true)');
  });

  it('should use a colored left border (green when added)', () => {
    expect(teamCardSource).toContain('border-l-4');
    expect(teamCardSource).toContain('border-calm-green');
  });

  it('should not use the undefined calm-primary token', () => {
    expect(teamCardSource).not.toContain('calm-primary');
  });
});
