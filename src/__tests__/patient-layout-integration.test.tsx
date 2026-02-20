import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Patient Layout Integration', () => {
  it('should integrate PatientBottomNav', () => {
    const source = fs.readFileSync(path.resolve(__dirname, '../app/(patient)/layout.tsx'), 'utf-8');
    expect(source).toContain('PatientBottomNav');
    expect(source).toContain('import { PatientBottomNav } from "@/components/patient/bottom-nav"');
  });

  it('should have adequate padding for scrolling content', () => {
    const source = fs.readFileSync(path.resolve(__dirname, '../app/(patient)/layout.tsx'), 'utf-8');
    // pb-[calc(5rem+env(safe-area-inset-bottom))] for the nav bar accounting for iOS home indicator
    expect(source).toMatch(/pb-\[calc\(5rem\+env\(safe-area-inset-bottom\)\)\]/);
  });
});
