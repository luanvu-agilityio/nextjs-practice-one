import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AccountPageContent from '../index';
import { useSession } from '@/lib/auth-client';

jest.mock('@/lib/auth-client');
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    refresh: jest.fn(),
  }),
}));

describe('AccountPageContent Component', () => {
  const mockSession = {
    user: {
      name: 'John Doe',
      email: 'john@example.com',
      image: null,
    },
  };

  beforeEach(() => {
    (useSession as jest.Mock).mockReturnValue({
      data: mockSession,
      isPending: false,
    });
  });

  it('matches snapshot', () => {
    const { container } = render(<AccountPageContent />);
    expect(container).toMatchSnapshot();
  });

  it('opens edit profile modal when button clicked', async () => {
    const user = userEvent.setup();
    const { getByText } = render(<AccountPageContent />);

    const editButton = getByText('Edit Profile');
    await user.click(editButton);
  });
});
