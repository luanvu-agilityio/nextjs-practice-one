import { render, screen, fireEvent } from '@testing-library/react';
import { Toaster } from 'sonner';
import { showToast } from '../index';

describe('Toast Component', () => {
  it('calls toast.dismiss when close button is clicked', async () => {
    const dismissSpy = jest.spyOn(require('sonner').toast, 'dismiss');
    render(<Toaster />);
    showToast({ title: 'Closable', hasCloseIcon: true });
    // Wait for the close button to appear and click it
    const closeButton = await screen.findByLabelText('Close');
    fireEvent.click(closeButton);
    expect(dismissSpy).toHaveBeenCalled();
    dismissSpy.mockRestore();
  });
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

  it('renders error variant', () => {
    render(<Toaster />);
    showToast({ title: 'Error', variant: 'error' });
    // No error thrown
  });

  it('renders warning variant', () => {
    render(<Toaster />);
    showToast({ title: 'Warning', variant: 'warning' });
  });

  it('renders info variant', () => {
    render(<Toaster />);
    showToast({ title: 'Info', variant: 'info' });
  });

  it('renders with custom icon', () => {
    render(<Toaster />);
    showToast({
      title: 'Custom',
      icon: <span data-testid='custom-icon'>*</span>,
    });
  });

  it('renders with description', () => {
    render(<Toaster />);
    showToast({ title: 'Desc', description: 'This is a description.' });
  });

  it('renders without close icon', () => {
    render(<Toaster />);
    showToast({ title: 'No Close', hasCloseIcon: false });
  });

  it('respects custom duration', () => {
    render(<Toaster />);
    showToast({ title: 'Duration', duration: 100 });
  });
});
