import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import { Button } from '..';

describe('Button', () => {
  it('renders children and is enabled by default', () => {
    render(<Button>Click me</Button>);

    const btn = screen.getByRole('button', { name: /click me/i });
    expect(btn).toBeInTheDocument();
    expect(btn).toBeEnabled();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Press</Button>);

    const btn = screen.getByRole('button', { name: /press/i });
    fireEvent.click(btn);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', () => {
    const handleClick = jest.fn();
    render(
      <Button disabled onClick={handleClick}>
        Disabled
      </Button>
    );

    const btn = screen.getByRole('button', { name: /disabled/i });
    expect(btn).toBeDisabled();
    fireEvent.click(btn);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('forwards ref to the underlying button element', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Button ref={ref}>RefTest</Button>);

    const btn = screen.getByRole('button', { name: /reftest/i });
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    // sanity check - ref points to the same element we found
    expect(ref.current).toBe(btn);
  });

  it('renders variant and size props without throwing', () => {
    // We don't assert on exact classnames since cva output may change.
    // Instead, ensure rendering does not crash and text is present.
    render(
      <div>
        <Button variant='primary' size='small'>
          PrimarySm
        </Button>
        <Button variant='secondary' size='large'>
          SecondaryLg
        </Button>
        <Button variant='tertiary'>Tertiary</Button>
      </div>
    );

    expect(
      screen.getByRole('button', { name: /primarysm/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /secondarylg/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /tertiary/i })
    ).toBeInTheDocument();
  });
});
