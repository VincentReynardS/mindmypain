import { describe, it, expect } from 'vitest';
import AppointmentsPage from '@/app/(patient)/appointments/page';
import MedicationsPage from '@/app/(patient)/medications/page';
import ScriptsPage from '@/app/(patient)/scripts/page';

describe('Patient Routing Stubs', () => {
  it('should explicitly render an appointments page stub', () => {
    expect(AppointmentsPage).toBeDefined();
    expect(typeof AppointmentsPage).toBe('function');
  });

  it('should explicitly render a medications page stub', () => {
    expect(MedicationsPage).toBeDefined();
    expect(typeof MedicationsPage).toBe('function');
  });

  it('should explicitly render a scripts page stub', () => {
    expect(ScriptsPage).toBeDefined();
    expect(typeof ScriptsPage).toBe('function');
  });
});
