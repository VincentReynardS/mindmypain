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
  });

  it('should implement approve logic', () => {
    expect(glassBoxCardSource).toContain('handleApprove');
    expect(glassBoxCardSource).toContain('onApprove(entry.id)');
  });

  it('should have Type Config for different entry types', () => {
    expect(glassBoxCardSource).toContain('TYPE_CONFIG');
    expect(glassBoxCardSource).toContain('journal');
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

  it('should import shape-aware editor forms', () => {
    expect(glassBoxCardSource).toContain('JournalEditForm');
    expect(glassBoxCardSource).toContain('MedicationEditForm');
    expect(glassBoxCardSource).toContain('AppointmentEditForm');
    expect(glassBoxCardSource).toContain('ScriptEditForm');
    expect(glassBoxCardSource).toContain('ClinicalSummaryEditForm');
  });

  it('should detect ai_response shapes for edit dispatch', () => {
    expect(glassBoxCardSource).toContain('detectAiResponseShape');
    expect(glassBoxCardSource).toContain("'medication'");
    expect(glassBoxCardSource).toContain("'appointment'");
    expect(glassBoxCardSource).toContain("'script'");
    expect(glassBoxCardSource).toContain("'clinical_summary'");
  });

  it('should accept onUpdateAiResponse prop', () => {
    expect(glassBoxCardSource).toContain('onUpdateAiResponse');
  });

  it('should always show Edit button including for approved entries', () => {
    expect(glassBoxCardSource).toContain("setIsEditing(true)");
  });

  it('should have 44px minimum touch targets on buttons', () => {
    expect(glassBoxCardSource).toContain("minHeight: '44px'");
  });
});
