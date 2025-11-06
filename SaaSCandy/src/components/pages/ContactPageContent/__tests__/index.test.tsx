// Mock showToast while keeping other actual exports from the module
jest.mock('@/components/common', () => {
  const actual = jest.requireActual('@/components/common');
  return {
    ...actual,
    showToast: jest.fn(),
  };
});

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContactPageContent } from '../index';

describe('ContactPage Component', () => {
  // increase timeout for this suite because we use fake timers and async flows
  jest.setTimeout(10000);
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

    // Wait for the mocked showToast to be called (indicates success)
    const mockedCommon = jest.requireMock('@/components/common');
    await waitFor(
      () =>
        expect(mockedCommon.showToast).toHaveBeenCalledWith(
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
    const mockedCommon = jest.requireMock('@/components/common');
    mockedCommon.showToast.mockImplementationOnce(() => {
      throw new Error('simulated failure');
    });
    mockedCommon.showToast.mockImplementation(() => {});

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
        expect(mockedCommon.showToast).toHaveBeenCalledWith(
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
    const mockedCommon = jest.requireMock('@/components/common');
    mockedCommon.showToast.mockImplementationOnce(() => {
      throw new Error('simulated failure');
    });
    mockedCommon.showToast.mockImplementation(() => {});

    // Determine expected friendly message for the error thrown below
    const { getFriendlyMessage } = jest.requireActual(
      '@/components/common/ErrorMessage'
    );
    const expectedDesc = getFriendlyMessage(new Error('simulated failure'));

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
        expect(mockedCommon.showToast).toHaveBeenCalledWith(
          expect.objectContaining({
            variant: 'error',
            title: 'Failed to Send Message',
            description: expectedDesc,
          })
        ),
      { timeout: 4000 }
    );
  });
});
