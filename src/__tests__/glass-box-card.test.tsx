import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

// Load source file for static analysis
const glassBoxCardSource = fs.readFileSync(
  path.resolve(__dirname, '../components/shared/glass-box/glass-box-card.tsx'),
  'utf-8'
);

describe('GlassBoxCard Component', () => {
  it('should export GlassBoxCard as a named function', async () => {
    const mod = await import('@/components/shared/glass-box/glass-box-card');
    expect(mod.GlassBoxCard).toBeDefined();
    expect(typeof mod.GlassBoxCard).toBe('function');
  });

  it('should use "use client" directive', () => {
    expect(glassBoxCardSource).toContain('"use client"');
  });

  it('should use Calm design tokens', () => {
    expect(glassBoxCardSource).toContain('bg-calm-surface-raised');
    expect(glassBoxCardSource).toContain('text-calm-text');
    expect(glassBoxCardSource).toContain('border-calm-border');
    expect(glassBoxCardSource).toContain('border-calm-primary');
  });

  it('should implement edit mode logic', () => {
    expect(glassBoxCardSource).toContain('isEditing');
    expect(glassBoxCardSource).toContain('setIsEditing');
    expect(glassBoxCardSource).toContain('textarea'); // Uses textarea for editing
  });

  it('should implement approve logic', () => {
    expect(glassBoxCardSource).toContain('handleApprove');
    expect(glassBoxCardSource).toContain('onApprove(entry.id)');
  });

  it('should implement update logic', () => {
    expect(glassBoxCardSource).toContain('handleSave');
    expect(glassBoxCardSource).toContain('onUpdate(entry.id, editedContent)');
  });

  it('should have Type Config for different entry types', () => {
    expect(glassBoxCardSource).toContain('TYPE_CONFIG');
    expect(glassBoxCardSource).toContain('agendas');
    expect(glassBoxCardSource).toContain('clinical_summary');
    expect(glassBoxCardSource).toContain('insight_card');
  });

  it('should display entry content', () => {
    expect(glassBoxCardSource).toContain('{entry.content}');
  });

  it('should use badges for entry type', () => {
    expect(glassBoxCardSource).toContain('entry_type');
    expect(glassBoxCardSource).toContain('badgeClass');
  });
});
