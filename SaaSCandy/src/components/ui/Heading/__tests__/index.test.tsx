import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

// Components
import { Heading } from '..';

describe('Heading', () => {
  const defaultProps = {
    as: 'h1' as const,
  };

  it('renders match snapshot', () => {
    const { container } = render(
      <Heading {...defaultProps} content='Test Heading' />
    );

    expect(container).toMatchSnapshot();
  });

  it('renders with default props', () => {
    render(<Heading {...defaultProps} content='Test Heading' />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Test Heading');
    expect(heading.tagName).toBe('H1');
  });

  it('renders different heading tags', () => {
    const { rerender } = render(<Heading as='h2' content='H2 Heading' />);
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();

    rerender(<Heading as='h3' content='H3 Heading' />);
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();

    rerender(<Heading as='h6' content='H6 Heading' />);
    expect(screen.getByRole('heading', { level: 6 })).toBeInTheDocument();
  });

  it('overrides size with explicit size prop', () => {
    render(<Heading as='h1' size='lg' content='Small H1' />);

    const heading = screen.getByRole('heading');
    expect(heading).toHaveClass(' text-4xl');
  });

  it('applies custom className', () => {
    render(<Heading as='h1' className='custom-class' content='Custom' />);

    const heading = screen.getByRole('heading');
    expect(heading).toHaveClass('custom-class');
  });

  it('applies accessibility attributes', () => {
    render(<Heading as='h2' content='Accessible Heading' />);

    const heading = screen.getByRole('heading');
    expect(heading).toHaveAttribute('aria-level', '2');
  });

  it('renders with ReactNode children', () => {
    render(
      <Heading
        as='h1'
        content={
          <>
            <span>Complex</span> <strong>Content</strong>
          </>
        }
      />
    );

    const heading = screen.getByRole('heading');

    expect(heading).toHaveTextContent('Complex Content');
    expect(heading.querySelector('span')).toBeInTheDocument();
    expect(heading.querySelector('strong')).toBeInTheDocument();
  });
});
