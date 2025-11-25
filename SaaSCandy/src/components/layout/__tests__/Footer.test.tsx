import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Minimal mocks for common components used by Footer
jest.mock('@/components/ui', () => ({
  Button: ({ children }: { children?: React.ReactNode }) => (
    <button>{children}</button>
  ),
  Heading: ({ content }: { content?: React.ReactNode }) => <div>{content}</div>,
  IconButton: ({ children }: { children?: React.ReactNode }) => (
    <div>{children}</div>
  ),
  Typography: ({ children }: { children?: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

jest.mock('@/icons/Logo', () => ({ LogoIcon: () => <span>Logo</span> }));
jest.mock('lucide-react', () => ({
  ChevronDown: ({ className }: { className?: string }) => (
    <span className={className}>v</span>
  ),
}));

import { Footer } from '../index';

describe('Footer', () => {
  it('renders basic content and toggles mobile sections', async () => {
    render(<Footer />);

    // fixed CTA text should be present
    expect(screen.getByText(/Get This Template/i)).toBeInTheDocument();

    // mobile accordion button (Services) should exist; clicking opens items
    const servicesBtn = screen.getAllByText(/Services/i)[0];
    expect(servicesBtn).toBeDefined();
    fireEvent.click(servicesBtn);

    // after clicking, one of the service links should be visible
    await waitFor(() =>
      expect(screen.getByText(/EdTech Apps/i)).toBeInTheDocument()
    );
  });
});
