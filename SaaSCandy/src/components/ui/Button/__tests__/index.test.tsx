import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../index';

// ============================================
// SNAPSHOT TEST SUITE
// ============================================
describe('Button Component - Snapshots', () => {
  it('renders all variants correctly', () => {
    const { container: primary } = render(
      <Button variant='primary'>Primary</Button>
    );
    expect(primary).toMatchSnapshot();

    const { container: secondary } = render(
      <Button variant='secondary'>Secondary</Button>
    );
    expect(secondary).toMatchSnapshot();

    const { container: tertiary } = render(
      <Button variant='tertiary'>Tertiary</Button>
    );
    expect(tertiary).toMatchSnapshot();
  });

  it('renders all sizes correctly', () => {
    const { container: small } = render(<Button size='small'>Small</Button>);
    expect(small).toMatchSnapshot();

    const { container: large } = render(<Button size='large'>Large</Button>);
    expect(large).toMatchSnapshot();
  });

  it('renders with default props', () => {
    const { container } = render(<Button>Default Button</Button>);
    expect(container).toMatchSnapshot();
  });

  it('renders disabled state', () => {
    const { container } = render(<Button disabled>Disabled</Button>);
    expect(container).toMatchSnapshot();
  });

  it('renders with custom className', () => {
    const { container } = render(
      <Button className='custom-class'>Custom</Button>
    );
    expect(container).toMatchSnapshot();
  });

  it('renders with complex children', () => {
    const { container } = render(
      <Button>
        <span>Icon</span>
        <span>Text</span>
      </Button>
    );
    expect(container).toMatchSnapshot();
  });

  it('renders combined variants and sizes', () => {
    const { container } = render(
      <Button variant='secondary' size='small'>
        Combined
      </Button>
    );
    expect(container).toMatchSnapshot();
  });
});

// ============================================
// INTERACTIVE TEST SUITE
// ============================================
describe('Button Component - Interactive', () => {
  it('handles click events', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>Click me</Button>);
    const button = screen.getByRole('button');

    await user.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('handles multiple clicks', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>Click me</Button>);
    const button = screen.getByRole('button');

    await user.click(button);
    await user.click(button);
    await user.click(button);

    expect(handleClick).toHaveBeenCalledTimes(3);
  });

  it('does not trigger click when disabled', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();

    render(
      <Button onClick={handleClick} disabled>
        Disabled
      </Button>
    );
    const button = screen.getByRole('button');

    await user.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('applies aria attributes for accessibility', () => {
    render(
      <Button aria-label='Custom label' aria-pressed='true'>
        Button
      </Button>
    );
    const button = screen.getByRole('button');

    expect(button).toHaveAttribute('aria-label', 'Custom label');
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('receives focus on tab navigation', async () => {
    const user = userEvent.setup();

    render(<Button>Focusable</Button>);
    const button = screen.getByRole('button');

    await user.tab();
    expect(button).toHaveFocus();
  });

  it('can be activated with keyboard (Enter)', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>Keyboard</Button>);
    const button = screen.getByRole('button');

    button.focus();
    await user.keyboard('{Enter}');

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('can be activated with keyboard (Space)', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>Keyboard</Button>);
    const button = screen.getByRole('button');

    button.focus();
    await user.keyboard(' ');

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('passes additional props to button element', () => {
    render(
      <Button data-testid='custom-button' id='btn-1'>
        Props
      </Button>
    );
    const button = screen.getByRole('button');

    expect(button).toHaveAttribute('data-testid', 'custom-button');
    expect(button).toHaveAttribute('id', 'btn-1');
  });
});
