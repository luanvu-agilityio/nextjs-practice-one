import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserMenu from '../index';
import { useSession } from '@/lib/auth-client';

jest.mock('@/lib/auth-client');
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}));

describe('UserMenu Component', () => {
  const mockSession = {
    user: {
      name: 'John Doe',
      email: 'john@example.com',
      image: null,
    },
  };

  beforeEach(() => {
    (useSession as jest.Mock).mockReturnValue({ data: mockSession });
  });

  it('matches snapshot', () => {
    const { container } = render(<UserMenu />);
    expect(container).toMatchSnapshot();
  });

  it('opens dropdown menu when clicked', async () => {
    const user = userEvent.setup();
    const { getByRole, getByText } = render(<UserMenu />);

    const trigger = getByRole('button', { name: /user menu/i });
    await user.click(trigger);

    expect(getByText('Account Details')).toBeInTheDocument();
    expect(getByText('Sign Out')).toBeInTheDocument();
  });
});
