// @vitest-environment jsdom
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SafeClinicalSummaryRender } from './safe-clinical-summary-render';

describe('SafeClinicalSummaryRender', () => {
  it('renders string fields correctly', () => {
    const aiResponse = {
      chief_complaint: 'Severe back pain',
      medication_review: 'Taking ibuprofen',
      patient_goal: 'Pain relief',
    };

    render(<SafeClinicalSummaryRender aiResponse={aiResponse} />);

    expect(screen.getByText('Severe back pain')).toBeDefined();
    expect(screen.getByText('Taking ibuprofen')).toBeDefined();
    expect(screen.getByText('Pain relief')).toBeDefined();
  });

  it('renders nested object fields as flattened human-readable text', () => {
    const aiResponse = {
      chief_complaint: 'Worsening pain',
      medication_review: { current: [{ name: 'Lyrica', dose: '150mg' }], concern: 'Declining efficacy' },
      patient_goal: 'Better pain management',
    };

    render(<SafeClinicalSummaryRender aiResponse={aiResponse} />);

    expect(screen.getByText('Worsening pain')).toBeDefined();
    expect(screen.getByText('Better pain management')).toBeDefined();
    // Nested object rendered as flattened readable text, not raw JSON
    expect(screen.getByText(/Lyrica/)).toBeDefined();
    expect(screen.getByText(/Declining efficacy/)).toBeDefined();
    expect(screen.queryByText(/\{/)).toBeNull(); // No raw JSON braces
  });

  it('omits fields that are null or empty', () => {
    const aiResponse = {
      chief_complaint: 'Back pain',
      medication_review: null,
      patient_goal: '',
    };

    render(<SafeClinicalSummaryRender aiResponse={aiResponse} />);

    expect(screen.getByText('Back pain')).toBeDefined();
    expect(screen.queryByText('Medication Review')).toBeNull();
    expect(screen.queryByText('Patient Goal')).toBeNull();
  });
});
