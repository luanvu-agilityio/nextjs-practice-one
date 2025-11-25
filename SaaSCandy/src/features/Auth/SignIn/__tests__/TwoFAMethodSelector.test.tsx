import { render, screen, fireEvent } from '@testing-library/react';
import { TwoFAMethodSelector } from '../TwoFAMethodSelector';

jest.mock('@/components/ui', () => ({
  Heading: ({ content }: { content: string }) => <h3>{content}</h3>,
  Button: ({ children, ...props }: { children: React.ReactNode }) => (
    <button {...props}>{children}</button>
  ),
  Input: (props: Record<string, unknown>) => <input {...props} />,
}));

jest.mock('@/constants/messages', () => ({
  AUTH_MESSAGES: {
    SIGN_IN: {
      choose2FAMethodTitle: 'Choose 2FA Method',
      verifyViaEmail: 'Verify via Email',
      verifyViaSMS: 'Verify via SMS',
      phonePlaceholder: 'Phone Number',
    },
  },
}));

describe('TwoFAMethodSelector', () => {
  it('renders heading and buttons', () => {
    render(
      <TwoFAMethodSelector
        userPhone=''
        setUserPhone={jest.fn()}
        loading={false}
        handleSelect2FAMethod={jest.fn()}
        handleSms2FAVerify={jest.fn()}
      />
    );
    expect(screen.getByText('Choose 2FA Method')).toBeInTheDocument();
    expect(screen.getByText('Verify via Email')).toBeInTheDocument();
    expect(screen.getByText('Verify via SMS')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Phone Number')).toBeInTheDocument();
  });

  it('calls handleSelect2FAMethod when email button clicked', () => {
    const handleSelect2FAMethod = jest.fn();
    render(
      <TwoFAMethodSelector
        userPhone=''
        setUserPhone={jest.fn()}
        loading={false}
        handleSelect2FAMethod={handleSelect2FAMethod}
        handleSms2FAVerify={jest.fn()}
      />
    );
    fireEvent.click(screen.getByText('Verify via Email'));
    expect(handleSelect2FAMethod).toHaveBeenCalledWith('email');
  });

  it('calls handleSms2FAVerify when SMS button clicked', () => {
    const handleSms2FAVerify = jest.fn();
    render(
      <TwoFAMethodSelector
        userPhone=''
        setUserPhone={jest.fn()}
        loading={false}
        handleSelect2FAMethod={jest.fn()}
        handleSms2FAVerify={handleSms2FAVerify}
      />
    );
    fireEvent.click(screen.getByText('Verify via SMS'));
    expect(handleSms2FAVerify).toHaveBeenCalled();
  });

  it('calls setUserPhone on input change', () => {
    const setUserPhone = jest.fn();
    render(
      <TwoFAMethodSelector
        userPhone=''
        setUserPhone={setUserPhone}
        loading={false}
        handleSelect2FAMethod={jest.fn()}
        handleSms2FAVerify={jest.fn()}
      />
    );
    fireEvent.change(screen.getByPlaceholderText('Phone Number'), {
      target: { value: '1234567890' },
    });
    expect(setUserPhone).toHaveBeenCalledWith('1234567890');
  });
});
