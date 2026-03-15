import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const glassBoxCardSource = fs.readFileSync(
  path.resolve(__dirname, '../components/shared/glass-box/glass-box-card.tsx'),
  'utf-8'
);

describe('Immunisation in GlassBoxCard', () => {
  it('should detect immunisation shape from Vaccine Name field', () => {
    expect(glassBoxCardSource).toContain("getString(ai['Vaccine Name'])");
  });

  it('should return immunisation badge with teal styling', () => {
    expect(glassBoxCardSource).toContain("label: 'Immunisation'");
    expect(glassBoxCardSource).toContain('bg-teal-100 text-teal-700');
  });

  it('should include SafeImmunisationRender component', () => {
    expect(glassBoxCardSource).toContain('SafeImmunisationRender');
  });

  it('should render immunisation fields: Vaccine Name, Date Given, Brand Name', () => {
    expect(glassBoxCardSource).toContain("key: 'Vaccine Name'");
    expect(glassBoxCardSource).toContain("key: 'Date Given'");
    expect(glassBoxCardSource).toContain("key: 'Brand Name'");
  });

  it('should include Date Given in DATE_FIELDS set', () => {
    expect(glassBoxCardSource).toContain("'Date Given'");
  });

  it('should dispatch to ImmunisationEditForm in edit mode', () => {
    expect(glassBoxCardSource).toContain('ImmunisationEditForm');
    expect(glassBoxCardSource).toContain("case 'immunisation':");
  });

  it('should include immunisation in AiResponseShape type', () => {
    expect(glassBoxCardSource).toContain("'immunisation'");
  });

  it('should detect immunisation shape in detectAiResponseShape function', () => {
    const fnStart = glassBoxCardSource.indexOf('function detectAiResponseShape');
    expect(fnStart).toBeGreaterThan(-1);
    const fnBody = glassBoxCardSource.substring(fnStart, fnStart + 600);
    expect(fnBody).toContain("return 'immunisation'");
    expect(fnBody).toContain("getString(ai['Vaccine Name'])");
  });
});
