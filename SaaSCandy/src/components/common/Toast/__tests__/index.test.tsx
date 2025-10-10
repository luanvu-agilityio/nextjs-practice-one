import { render, screen, fireEvent } from '@testing-library/react';
import { Toaster } from 'sonner';
import { showToast } from '../index';

describe('Toast Component', () => {
  it('matches snapshot for success variant', () => {
    const { container } = render(
      <>
        <Toaster />
        <button
          onClick={() => showToast({ title: 'Success', variant: 'success' })}
        >
          Show Toast
        </button>
      </>
    );

    fireEvent.click(screen.getByText('Show Toast'));
    expect(container).toMatchSnapshot();
  });
});
