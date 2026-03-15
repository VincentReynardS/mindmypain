/**
 * @vitest-environment jsdom
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ImmunisationEditForm } from '@/components/shared/glass-box/editors/immunisation-edit-form';

describe('ImmunisationEditForm', () => {
  it('renders existing immunisation values', () => {
    render(
      <ImmunisationEditForm
        aiResponse={{
          'Vaccine Name': 'COVID-19 Booster',
          'Date Given': '15-03-2026',
          'Brand Name': 'Pfizer',
        }}
        onSave={vi.fn()}
        onCancel={vi.fn()}
        isSaving={false}
      />
    );

    expect((screen.getByLabelText(/vaccine name/i) as HTMLInputElement).value).toBe('COVID-19 Booster');
    expect((screen.getByLabelText(/date given/i) as HTMLInputElement).value).toBe('15-03-2026');
    expect((screen.getByLabelText(/brand name/i) as HTMLInputElement).value).toBe('Pfizer');
  });

  it('normalizes parseable dates to dd-mm-yyyy before saving', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);

    render(
      <ImmunisationEditForm
        aiResponse={{
          'Vaccine Name': 'COVID-19 Booster',
          'Date Given': '2026-03-15',
          'Brand Name': 'Pfizer',
        }}
        onSave={onSave}
        onCancel={vi.fn()}
        isSaving={false}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        {
          'Vaccine Name': 'COVID-19 Booster',
          'Date Given': '15-03-2026',
          'Brand Name': 'Pfizer',
        },
        'Vaccine: COVID-19 Booster\nDate Given: 15-03-2026\nBrand: Pfizer'
      );
    });
  });

  it('blocks save and shows an error for invalid dates', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);

    render(
      <ImmunisationEditForm
        aiResponse={{
          'Vaccine Name': 'Influenza',
          'Date Given': 'not-a-date',
          'Brand Name': 'Fluad',
        }}
        onSave={onSave}
        onCancel={vi.fn()}
        isSaving={false}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect((await screen.findByRole('alert')).textContent).toContain('Date Given must be a valid date in dd-mm-yyyy format.');
    expect(onSave).not.toHaveBeenCalled();
  });

  it('calls onCancel when cancel is pressed', () => {
    const onCancel = vi.fn();

    render(
      <ImmunisationEditForm
        aiResponse={{}}
        onSave={vi.fn()}
        onCancel={onCancel}
        isSaving={false}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
