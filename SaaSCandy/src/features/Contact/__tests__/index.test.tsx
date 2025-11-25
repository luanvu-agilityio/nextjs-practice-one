// Lightweight mock for the UI module used by ContactPageContent. We avoid
// calling the real module to prevent side-effects during tests (timers,
// providers, or Next-specific code).
jest.mock('@/components/ui', () => ({
  __esModule: true,
  Section: ({ children }: { children?: React.ReactNode }) => (
    <section>{children}</section>
  ),
  Heading: ({
    content,
    children,
  }: {
    content?: React.ReactNode;
    children?: React.ReactNode;
  }) => <h4>{content ?? children}</h4>,
  Button: ({
    children,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    children?: React.ReactNode;
  }) => <button {...props}>{children}</button>,
  InputController: ({ placeholder }: { placeholder?: string }) => (
    <input placeholder={placeholder} />
  ),
  Typography: ({ children }: { children?: React.ReactNode }) => (
    <p>{children}</p>
  ),
  showToast: jest.fn(),
}));

// Mock react-hook-form so handleSubmit will invoke the provided submit handler
// with test data and register returns a noop (so uncontrolled inputs won't block
// validation in tests).
jest.mock('react-hook-form', () => ({
  useForm: () => ({
    control: { register: () => ({}) },
    handleSubmit: (fn: (...args: unknown[]) => unknown) => () =>
      // Provide filled data to simulate a successful form submit
      fn({
        name: 'John Doe',
        email: 'john@example.com',
        projectName: 'Test Project',
        projectType: 'web-development',
        message: 'Test message',
      }),
    reset: () => {
      // clear typical form fields used by the component so tests observing
      // reset behavior see cleared values
      const name = document.querySelector(
        'input[placeholder="Enter your name"]'
      ) as HTMLInputElement | null;
      const email = document.querySelector(
        'input[placeholder="Enter your email"]'
      ) as HTMLInputElement | null;
      const project = document.querySelector(
        'input[placeholder="Enter project name"]'
      ) as HTMLInputElement | null;
      const message = document.querySelector(
        'textarea[placeholder="Briefly describe your requirements"]'
      ) as HTMLTextAreaElement | null;
      if (name) name.value = '';
      if (email) email.value = '';
      if (project) project.value = '';
      if (message) message.value = '';
      const select = document.getElementById(
        'contact-project-type'
      ) as HTMLSelectElement | null;
      if (select) select.value = '';
    },
    formState: { errors: {} },
  }),
}));

// jsdom (older versions) may not implement requestSubmit — polyfill it so
// user-event clicks that rely on it succeed in this test environment.
// Ensure requestSubmit is available on the HTMLFormElement prototype in the
// test environment. jsdom versions used by this project may not implement it.
const applyRequestSubmitPolyfill = () => {
  const install = () => {
    if (typeof HTMLFormElement === 'undefined') return;
    const proto = HTMLFormElement.prototype as unknown as Record<
      string,
      unknown
    >;
    if (typeof proto.requestSubmit === 'function') return;

    Object.defineProperty(HTMLFormElement.prototype, 'requestSubmit', {
      value: function (this: HTMLFormElement) {
        const evt = new Event('submit', { bubbles: true, cancelable: true });
        return this.dispatchEvent(evt);
      },
      configurable: true,
      writable: true,
    });
  };

  try {
    install();
  } catch {
    // If the global isn't ready yet, schedule a microtask to try again.
    setTimeout(install, 0);
  }
};

applyRequestSubmitPolyfill();

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContactPageContent } from '../index';

describe('ContactPage Component', () => {
  // increase timeout for this suite because we use fake timers and async flows
  jest.setTimeout(10000);

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

    // submit the form (use fireEvent.submit to avoid jsdom requestSubmit issues)
    const form = submitButton.closest('form') as HTMLFormElement;
    fireEvent.submit(form);
    // button should be disabled while submitting (may be async due to state updates)
    await waitFor(() => expect(submitButton).toBeDisabled(), { timeout: 1000 });

    // Wait for the mocked showToast to be called (indicates success)
    const mockedCommon = jest.requireMock('@/components/ui');
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
        // form reset is mocked; ensure the submit button is re-enabled
        expect(submitButton).not.toBeDisabled();
      },
      { timeout: 3000 }
    );
  });

  it('shows error toast when submission throws during success toast', async () => {
    const user = userEvent.setup();

    // Arrange: make the first call to showToast throw, subsequent calls succeed
    const mockedCommon = jest.requireMock('@/components/ui');
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

    // Act: submit the form (avoid requestSubmit not-implemented in jsdom)
    const form = submitButton.closest('form') as HTMLFormElement;
    fireEvent.submit(form);

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
    const mockedCommon = jest.requireMock('@/components/ui');
    mockedCommon.showToast.mockImplementationOnce(() => {
      throw new Error('simulated failure');
    });
    mockedCommon.showToast.mockImplementation(() => {});

    // Determine expected friendly message for the error thrown below
    const { getFriendlyMessage } = jest.requireActual(
      '@/components/ui/ErrorMessage'
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

    // Act: submit the form (avoid requestSubmit not-implemented in jsdom)
    const form = submitButton.closest('form') as HTMLFormElement;
    fireEvent.submit(form);

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
