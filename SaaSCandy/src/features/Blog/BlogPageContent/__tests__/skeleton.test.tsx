import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock the components module so BlogCardSkeleton is a simple testable node
jest.mock('@/features/Blog', () => ({
  __esModule: true,
  BlogCardSkeleton: () => <div data-testid='blog-skeleton' />,
  // Make BlogList suspend by throwing a Promise so Suspense fallback renders
  BlogList: () => {
    // throw a never-resolving promise to simulate suspense
    throw new Promise(() => {});
  },
}));

import { BlogPageContent } from '..';

describe('BlogPageContent skeleton fallback', () => {
  it('renders six BlogCardSkeleton items in the fallback', () => {
    render(<BlogPageContent />);
    const items = screen.getAllByTestId('blog-skeleton');
    expect(items).toHaveLength(6);
  });
});
