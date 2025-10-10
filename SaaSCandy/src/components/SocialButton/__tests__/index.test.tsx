import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SocialButton from '../index';

// Mock icon component
const MockIcon = ({ className }: { className?: string }) => (
  <svg data-testid='mock-icon' className={className}>
    <path />
  </svg>
);

describe('SocialButton - Snapshot', () => {
  it('matches snapshot', () => {
    const { container } = render(
      <SocialButton provider='google' icon={MockIcon}>
        Continue with Google
      </SocialButton>
    );
    expect(container).toMatchSnapshot();
  });
});

describe('SocialButton - Interactive', () => {
  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();

    render(
      <SocialButton provider='google' icon={MockIcon} onClick={handleClick}>
        Continue with Google
      </SocialButton>
    );

    const button = screen.getByRole('button', { name: /sign in with google/i });
    await user.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
