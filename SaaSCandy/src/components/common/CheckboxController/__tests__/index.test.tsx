import { render, screen, fireEvent } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { CheckboxController } from '../index';

jest.mock('@/components/common/Typography', () => ({
  Typography: ({
    children,
    className,
  }: { children: React.ReactNode } & Record<string, unknown>) => (
    <span className={className as string}>{children}</span>
  ),
}));

interface TestFormData {
  testCheckbox: boolean;
}

const TestWrapper = ({ error }: { error?: string }) => {
  const { control } = useForm<TestFormData>({
    defaultValues: { testCheckbox: false },
  });

  if (error) {
    control._formState.errors = {
      testCheckbox: { type: 'manual', message: error },
    };
  }

  return (
    <CheckboxController
      name='testCheckbox'
      control={control}
      label='Accept terms'
    />
  );
};

describe('CheckboxController', () => {
  it('renders correctly', () => {
    const { container } = render(<TestWrapper />);
    expect(container).toMatchSnapshot();
  });

  it('renders with error message', () => {
    render(<TestWrapper error='This field is required' />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('handles checkbox toggle', () => {
    render(<TestWrapper />);
    const checkbox = screen.getByRole('checkbox');

    expect(checkbox).not.toBeChecked();
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });
});
