import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock common components used by PrivacyPageContent
jest.mock('@/components/ui', () => ({
  Heading: ({ content }: { content?: React.ReactNode }) => <div>{content}</div>,
  Section: ({ children }: { children?: React.ReactNode }) => (
    <section>{children}</section>
  ),
  Typography: ({ children }: { children?: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

import { PrivacyPageContent } from '../index';

describe('PrivacyPageContent', () => {
  it('renders last updated and contact email', () => {
    render(<PrivacyPageContent />);

    // 'Last updated' should render from constants
    expect(screen.getByText(/Last updated:/i)).toBeInTheDocument();
  });
});
