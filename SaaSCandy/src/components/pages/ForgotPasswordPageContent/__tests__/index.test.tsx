import { render, screen } from '@testing-library/react';
import * as ForgotModule from '../index';
import React from 'react';

// Mock dependencies used by the simplified component
jest.mock('@/components/common', () => ({
  Heading: ({ content }: { content: string }) => (
    <h1 data-testid='heading'>{content}</h1>
  ),
  Typography: ({ children }: { children: React.ReactNode }) => (
    <p data-testid='typography'>{children}</p>
  ),
}));

jest.mock('@/components/form', () => ({
  ForgotPasswordForm: () => <form data-testid='forgot-password-form'></form>,
}));

describe('ForgotPasswordPageContent', () => {
  it('renders heading, description, and form', () => {
    expect(ForgotModule.ForgotPasswordPageContent).toBeDefined();
    expect(ForgotModule.default).toBeDefined();
    render(<ForgotModule.ForgotPasswordPageContent />);
    expect(screen.getByTestId('heading')).toHaveTextContent(
      'Forgot your password?'
    );
    expect(screen.getByTestId('typography')).toHaveTextContent(
      "Enter your email and we'll send you a link to reset your password."
    );
    expect(screen.getByTestId('forgot-password-form')).toBeInTheDocument();
  });
});
