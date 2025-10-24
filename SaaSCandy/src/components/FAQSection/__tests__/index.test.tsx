import { render, screen, fireEvent } from '@testing-library/react';
import { FAQSection } from '@/components/FAQSection';

jest.mock('@/constants', () => ({
  faqData: [
    { question: 'What is SaaSCandy?', answer: 'SaaSCandy is a platform.' },
    { question: 'How to get started?', answer: 'Sign up and start building.' },
    {
      question: 'What are the pricing plans?',
      answer: 'We offer flexible pricing.',
    },
  ],
}));

describe('FAQSection - Interactive Tests', () => {
  it('should render all FAQ items', () => {
    render(<FAQSection />);

    expect(screen.getByText('What is SaaSCandy?')).toBeInTheDocument();
    expect(screen.getByText('How to get started?')).toBeInTheDocument();
    expect(screen.getByText('What are the pricing plans?')).toBeInTheDocument();
  });

  it('should show first FAQ answer by default', () => {
    render(<FAQSection />);

    expect(screen.getByText('SaaSCandy is a platform.')).toBeInTheDocument();
  });

  it('should toggle FAQ answer when clicked', () => {
    render(<FAQSection />);

    const secondQuestion = screen.getByText('How to get started?');
    fireEvent.click(secondQuestion);

    expect(screen.getByText('Sign up and start building.')).toBeInTheDocument();
    expect(
      screen.queryByText('SaaSCandy is a platform.')
    ).not.toBeInTheDocument();
  });

  it('should close FAQ when clicking same item', () => {
    render(<FAQSection />);

    const firstQuestion = screen.getByText('What is SaaSCandy?');
    fireEvent.click(firstQuestion);

    expect(
      screen.queryByText('SaaSCandy is a platform.')
    ).not.toBeInTheDocument();
  });
});
