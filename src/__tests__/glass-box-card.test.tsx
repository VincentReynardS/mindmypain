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

  it('should render Add labels for draft primary action', () => {
    expect(glassBoxCardSource).toContain('{isSaving ? "Adding..." : "Add"}');
  });

  it('should render Added label for approved status in UI', () => {
    expect(glassBoxCardSource).toContain('{isApproved ? "Added" : "Draft"}');
  });

  it('should have Type Config for different entry types', () => {
    expect(glassBoxCardSource).toContain('TYPE_CONFIG');
    expect(glassBoxCardSource).toContain('journal');
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
  });

  it('should not import removed clinical summary components', () => {
    expect(glassBoxCardSource).not.toContain('SafeClinicalSummaryRender');
    expect(glassBoxCardSource).not.toContain('ClinicalSummaryEditForm');
  });

  it('should detect ai_response shapes for edit dispatch', () => {
    expect(glassBoxCardSource).toContain('detectAiResponseShape');
    expect(glassBoxCardSource).toContain("'medication'");
    expect(glassBoxCardSource).toContain("'appointment'");
    expect(glassBoxCardSource).toContain("'script'");
  });

  it('should accept onUpdateAiResponse prop', () => {
    expect(glassBoxCardSource).toContain('onUpdateAiResponse');
  });

  it('should always show Edit button including for approved entries', () => {
    expect(glassBoxCardSource).toContain("setIsEditing(true)");
  });

  it('should keep explicit touch target sizing on buttons', () => {
    expect(glassBoxCardSource).toContain("minHeight: '44px'");
    expect(glassBoxCardSource).toContain("minHeight: '40px'");
  });
  it('should render script array status in list', () => {
    expect(glassBoxCardSource).toContain("script.Filled ? 'Filled' : 'To Be Filled'");
    expect(glassBoxCardSource).toContain("bg-calm-green-soft");
    expect(glassBoxCardSource).toContain("bg-calm-blue-soft");
  });

  it('should render script entry shape status', () => {
    expect(glassBoxCardSource).toContain("aiResponse.Filled ? 'Filled' : 'To Be Filled'");
  });
});
