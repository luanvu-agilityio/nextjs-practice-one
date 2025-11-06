import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock the PrivacyPageContent used by the page so test stays focused
jest.mock('@/components', () => ({
  PrivacyPageContent: () => <div>PRIVACY-MOCK</div>,
}));

import PrivacyPage, { metadata } from '../page';

describe('Privacy page', () => {
  it('exports metadata with expected title and description', () => {
    expect(metadata).toBeDefined();
    expect(metadata.title).toBe('Privacy Term | SaaSCandy');
    expect(metadata.description).toBe('Read our Privacy Term and Conditions');
  });

  it('renders the PrivacyPageContent inside a main element', () => {
    render(<PrivacyPage />);
    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
    expect(screen.getByText('PRIVACY-MOCK')).toBeInTheDocument();
  });
});
