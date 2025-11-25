import { render, screen, fireEvent } from '@testing-library/react';
import { DocsContent } from '@/features/Docs';

jest.mock('@/constants/docs', () => ({
  docsCategories: [
    {
      title: 'Getting Started',
      items: [
        { title: 'Quick Start', href: '#quick-start' },
        { title: 'Installation', href: '#installation' },
      ],
    },
  ],
  sampleContent: {
    'quick-start': {
      title: 'Quick Start Guide',
      content: 'This is the quick start content',
    },
    installation: {
      title: 'Installation Guide',
      content: 'This is the installation content',
    },
  },
}));

describe('DocsContent - Interactive Tests', () => {
  it('should render with default active section', () => {
    render(<DocsContent />);

    expect(screen.getByText('Quick Start Guide')).toBeInTheDocument();
    expect(
      screen.getByText('This is the quick start content')
    ).toBeInTheDocument();
  });

  it('should change active section when navigation button clicked', () => {
    render(<DocsContent />);

    const installationButton = screen.getByText('Installation');
    fireEvent.click(installationButton);

    expect(screen.getByText('Installation Guide')).toBeInTheDocument();
    expect(
      screen.getByText('This is the installation content')
    ).toBeInTheDocument();
  });

  it('should highlight active navigation item', () => {
    render(<DocsContent />);

    const quickStartButton = screen.getByText('Quick Start');
    expect(quickStartButton).toHaveClass('bg-blue-50', 'text-blue-600');
  });

  it('should render help section', () => {
    render(<DocsContent />);

    expect(screen.getByText('Need Help?')).toBeInTheDocument();
    expect(screen.getByText('Contact Support')).toBeInTheDocument();
  });
});
