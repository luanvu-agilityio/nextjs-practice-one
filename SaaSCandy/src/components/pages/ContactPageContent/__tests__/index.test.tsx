import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// Mock the common module's showToast so we can control it in tests.
// Use a module factory to merge the real exports but replace showToast with a jest.fn.
jest.mock('@/components/common', () => {
  const actual = jest.requireActual('@/components/common');
  return {
    ...actual,
    showToast: jest.fn(() => 0 as unknown as string | number),
  };
});
import * as Common from '@/components/common';
// Mock ErrorMessage so we can spy/mock getFriendlyMessage safely
jest.mock('@/components/common/ErrorMessage', () => {
  const actual = jest.requireActual('@/components/common/ErrorMessage');
  return {
    ...actual,
    getFriendlyMessage: jest.fn((err: unknown) =>
      actual.getFriendlyMessage(err)
    ),
  };
});
import * as ErrorMessageModule from '@/components/common/ErrorMessage';
import { ContactPageContent } from '../index';

describe('ContactPage Component', () => {
  // increase timeout for this suite because we use fake timers and async flows
  jest.setTimeout(10000);
  beforeEach(() => {
    // ensure showToast is a spy we can control per-test
    jest.restoreAllMocks();
    // showToast is provided by our module mock as a jest.fn; ensure default impl
    (Common.showToast as jest.Mock).mockImplementation(
      () => 0 as unknown as string | number
    );
  });
  it('matches snapshot', () => {
    const { container } = render(<ContactPageContent />);
    expect(container).toMatchSnapshot();
  });

  it('renders contact info and images', () => {
    render(<ContactPageContent />);

    // Contact blocks
    expect(screen.getByText(/Email Us/i)).toBeInTheDocument();
    expect(screen.getByText(/^Address$/i)).toBeInTheDocument();
    expect(screen.getByText(/info@saascandy.com/i)).toBeInTheDocument();

    // Map image alt text
    const mapImg = screen.getByAltText('Company address');
    expect(mapImg).toBeInTheDocument();
  });

  it('submits form with valid data and shows success toast', async () => {
    const user = userEvent.setup();

    render(<ContactPageContent />);

    // Fill fields
    await user.type(screen.getByPlaceholderText('Enter your name'), 'John Doe');
    await user.type(
      screen.getByPlaceholderText('Enter your email'),
      'john@example.com'
    );
    await user.type(
      screen.getByPlaceholderText('Enter project name'),
      'Test Project'
    );
    await user.type(
      screen.getByPlaceholderText('Briefly describe your requirements'),
      'Test message'
    );

    const submitButton = screen.getByRole('button', { name: /submit/i });

    // select a project type (required by validation)
    const projectSelect = screen.getByLabelText('Project*');
    await user.selectOptions(projectSelect, 'web-development');

    // click the submit button
    await user.click(submitButton);
    // button should be disabled while submitting
    expect(submitButton).toBeDisabled();

    // Wait for the showToast spy to be called (indicates success)
    await waitFor(
      () =>
        expect(Common.showToast).toHaveBeenCalledWith(
          expect.objectContaining({
            variant: 'success',
            title: 'Message Sent Successfully!',
          })
        ),
      { timeout: 3000 }
    );

    // After success, form should be reset and submit button re-enabled
    await waitFor(
      () => {
        const nameInput = screen.getByPlaceholderText('Enter your name');
        expect((nameInput as HTMLInputElement).value).toBe('');
        expect(submitButton).not.toBeDisabled();
      },
      { timeout: 3000 }
    );
  });

  it('shows error toast when submission throws during success toast', async () => {
    const user = userEvent.setup();

    // Arrange: make the first call to showToast throw, subsequent calls succeed
    (Common.showToast as jest.Mock).mockImplementationOnce(() => {
      throw new Error('simulated failure');
    });
    (Common.showToast as jest.Mock).mockImplementation(
      () => 0 as unknown as string | number
    );

    render(<ContactPageContent />);

    // Fill fields
    await user.type(screen.getByPlaceholderText('Enter your name'), 'John Doe');
    await user.type(
      screen.getByPlaceholderText('Enter your email'),
      'john@example.com'
    );
    await user.type(
      screen.getByPlaceholderText('Enter project name'),
      'Test Project'
    );
    await user.type(
      screen.getByPlaceholderText('Briefly describe your requirements'),
      'Test message'
    );

    const submitButton = screen.getByRole('button', { name: /submit/i });

    // select a project type (required by validation)
    const projectSelect = screen.getByLabelText('Project*');
    await user.selectOptions(projectSelect, 'web-development');

    // Act: click submit
    await user.click(submitButton);

    // Assert: error toast called
    await waitFor(
      () =>
        expect(Common.showToast).toHaveBeenCalledWith(
          expect.objectContaining({
            variant: 'error',
            title: 'Failed to Send Message',
          })
        ),
      { timeout: 4000 }
    );

    // submit button should be re-enabled after failure
    await waitFor(() => expect(submitButton).not.toBeDisabled(), {
      timeout: 4000,
    });
  });

  it('uses getFriendlyMessage result in error toast description', async () => {
    const user = userEvent.setup();

    // Arrange: make the first call to showToast throw so catch path runs
    (Common.showToast as jest.Mock).mockImplementationOnce(() => {
      throw new Error('simulated failure');
    });
    (Common.showToast as jest.Mock).mockImplementation(
      () => 0 as unknown as string | number
    );

    // Determine expected friendly message for the error thrown below
    const expectedDesc = ErrorMessageModule.getFriendlyMessage(
      new Error('simulated failure')
    );

    render(<ContactPageContent />);

    // Fill fields
    await user.type(screen.getByPlaceholderText('Enter your name'), 'John Doe');
    await user.type(
      screen.getByPlaceholderText('Enter your email'),
      'john@example.com'
    );
    await user.type(
      screen.getByPlaceholderText('Enter project name'),
      'Test Project'
    );
    await user.type(
      screen.getByPlaceholderText('Briefly describe your requirements'),
      'Test message'
    );

    const submitButton = screen.getByRole('button', { name: /submit/i });

    // select a project type (required by validation)
    const projectSelect = screen.getByLabelText('Project*');
    await user.selectOptions(projectSelect, 'web-development');

    // Act: click submit
    await user.click(submitButton);

    // Assert: error toast called with friendly message derived from getFriendlyMessage
    await waitFor(
      () =>
        expect(Common.showToast).toHaveBeenCalledWith(
          expect.objectContaining({
            variant: 'error',
            title: 'Failed to Send Message',
            description: expectedDesc,
          })
        ),
      { timeout: 4000 }
    );
  });

  it('falls back to default message when getFriendlyMessage returns empty', async () => {
    const user = userEvent.setup();

    // Make getFriendlyMessage return empty string so OR falls back
    jest
      .spyOn(ErrorMessageModule, 'getFriendlyMessage')
      .mockReturnValueOnce('');

    // Ensure showToast throws so we test the catch->fallback path
    (Common.showToast as jest.Mock).mockImplementationOnce(() => {
      throw new Error('boom');
    });

    render(<ContactPageContent />);

    // Fill fields
    await user.type(screen.getByPlaceholderText('Enter your name'), 'John Doe');
    await user.type(
      screen.getByPlaceholderText('Enter your email'),
      'john@example.com'
    );
    await user.type(
      screen.getByPlaceholderText('Enter project name'),
      'Test Project'
    );
    await user.type(
      screen.getByPlaceholderText('Briefly describe your requirements'),
      'Test message'
    );

    const submitButton = screen.getByRole('button', { name: /submit/i });
    const projectSelect = screen.getByLabelText('Project*');
    await user.selectOptions(projectSelect, 'web-development');

    await user.click(submitButton);
    await waitFor(
      () =>
        expect(Common.showToast).toHaveBeenCalledWith(
          expect.objectContaining({
            variant: 'error',
            title: 'Failed to Send Message',
            description: 'Please try again or contact us directly.',
          })
        ),
      { timeout: 4000 }
    );
  });
});
