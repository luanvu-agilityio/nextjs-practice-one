import { render, screen } from '@testing-library/react';
import { ForgotPasswordPageContent } from '../index';
import React from 'react';

// Mock dependencies
jest.mock('next/navigation', () => ({
  usePathname: () => '/auth/forgot-password',
}));

jest.mock('@/components/common', () => ({
  Heading: ({
    content,
    className,
  }: {
    content: string;
    className?: string;
  }) => (
    <h2 data-testid='heading' className={className}>
      {content}
    </h2>
  ),
}));

jest.mock('@/components/common/Breadcrumb', () => ({
  Breadcrumb: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <nav data-testid='breadcrumb' className={className}>
      {children}
    </nav>
  ),
  BreadcrumbList: ({ children }: { children: React.ReactNode }) => (
    <ol>{children}</ol>
  ),
  BreadcrumbItem: ({ children }: { children: React.ReactNode }) => (
    <li>{children}</li>
  ),
  BreadcrumbLink: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
  BreadcrumbSeparator: () => <span>/</span>,
  BreadcrumbPage: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <span className={className}>{children}</span>,
}));

jest.mock('@/components/form', () => ({
  ForgotPasswordForm: () => <form data-testid='forgot-password-form'></form>,
}));

jest.mock('@/icons/Logo', () => ({
  LogoIcon: ({ className }: { className?: string }) => (
    <svg data-testid='logo-icon' className={className}></svg>
  ),
}));

jest.mock('@/constants', () => ({
  AUTH_MESSAGES: {
    SIGN_IN: { title: 'Forgot Password' },
  },
  ROUTES: {
    HOME: '/',
  },
}));

jest.mock('@/utils', () => ({
  extractBreadcrumbs: (_pathname: string) => [
    { label: 'Home', href: '/', isActive: false },
    { label: 'Forgot Password', href: '/auth/forgot-password', isActive: true },
  ],
}));

describe('ForgotPasswordPageContent', () => {
  it('renders heading, logo, breadcrumbs, and form', () => {
    render(<ForgotPasswordPageContent />);
    expect(screen.getByTestId('heading')).toHaveTextContent('Forgot Password');
    expect(screen.getByTestId('logo-icon')).toBeInTheDocument();
    expect(screen.getByTestId('breadcrumb')).toBeInTheDocument();
    expect(screen.getByTestId('forgot-password-form')).toBeInTheDocument();
  });

  it('renders correct breadcrumb items', () => {
    render(<ForgotPasswordPageContent />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    screen.getAllByText('Forgot Password').forEach(element => {
      expect(element).toBeInTheDocument();
    });
  });

  it('renders logo link to home', () => {
    render(<ForgotPasswordPageContent />);

    const logoLink = screen.getByRole('link', {
      name: (content, _element) =>
        content.includes('SaaS') && content.includes('Candy'),
    });
    expect(logoLink).toHaveAttribute('href', '/');
  });
});
