import { render, screen } from '@testing-library/react';
import { Share } from '../index';

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, ...props }: { children: React.ReactNode }) => (
    <a {...props}>{children}</a>
  ),
}));

jest.mock('lucide-react', () => ({
  Facebook: ({ className }: { className?: string }) => (
    <svg data-testid='facebook-icon' className={className} />
  ),
  Twitter: ({ className }: { className?: string }) => (
    <svg data-testid='twitter-icon' className={className} />
  ),
  Linkedin: ({ className }: { className?: string }) => (
    <svg data-testid='linkedin-icon' className={className} />
  ),
}));

jest.mock('@/components/ui', () => ({
  Heading: ({
    className,
    content,
  }: {
    className?: string;
    content: string;
  }) => (
    <h3 data-testid='heading' className={className}>
      {content}
    </h3>
  ),
}));

describe('Share', () => {
  it('renders heading and all share links', () => {
    render(<Share url='https://example.com' title='Test Title' />);
    expect(screen.getByTestId('heading')).toHaveTextContent('Share');
    expect(screen.getByText('Facebook')).toBeInTheDocument();
    expect(screen.getByText('Twitter')).toBeInTheDocument();
    expect(screen.getByText('LinkedIn')).toBeInTheDocument();
    expect(screen.getByTestId('facebook-icon')).toBeInTheDocument();
    expect(screen.getByTestId('twitter-icon')).toBeInTheDocument();
    expect(screen.getByTestId('linkedin-icon')).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    render(
      <Share
        className='custom-class'
        url='https://example.com'
        title='Test Title'
      />
    );
    expect(screen.getByTestId('heading').parentElement).toHaveClass(
      'custom-class'
    );
  });

  it('uses window.location.href when no url prop provided (client)', () => {
    render(<Share title='Test Title' />);

    const twitterLink = screen.getByText('Twitter').closest('a');
    expect(twitterLink).toHaveAttribute(
      'href',
      expect.stringContaining(encodeURIComponent(window.location.href))
    );
  });
});
