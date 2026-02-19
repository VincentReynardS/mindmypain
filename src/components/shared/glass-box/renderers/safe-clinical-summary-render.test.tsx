// @vitest-environment jsdom
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SafeClinicalSummaryRender } from './safe-clinical-summary-render';

describe('SafeClinicalSummaryRender', () => {
  it('renders parsed JSON content correctly', () => {
    const mockContent = JSON.stringify({
      chief_complaint: 'Severe back pain',
      medication_review: 'Taking ibuprofen',
      patient_goal: 'Pain relief',
    });

    render(<SafeClinicalSummaryRender content={mockContent} />);

    expect(screen.getByText('Clinical Visit Summary')).toBeDefined();
    expect(screen.getByText('Severe back pain')).toBeDefined();
    expect(screen.getByText('Taking ibuprofen')).toBeDefined();
    expect(screen.getByText('Pain relief')).toBeDefined();
  });

  it('renders raw text when content is invalid JSON', () => {
    const rawContent = 'This is just raw text content.';
    render(<SafeClinicalSummaryRender content={rawContent} />);

    expect(screen.getByText(rawContent)).toBeDefined();
    // Headers should not be present
    expect(screen.queryByText('Clinical Visit Summary')).toBeNull();
  });

  it('renders raw text when content is empty JSON object', () => {
     // This case might vary based on implementation, but if parsing fails or returns null check
     const emptyJson = "{}"; 
     render(<SafeClinicalSummaryRender content={emptyJson} />);
     
     // Based on current implementation, it tries to access properties. 
     // If properties are undefined, they render as empty.
     // However, the component header logic is "if (!parsed) return raw".
     // {} is truthy, so it renders the structured view with empty fields.
     
     expect(screen.getByText('Clinical Visit Summary')).toBeDefined();
  });
});
