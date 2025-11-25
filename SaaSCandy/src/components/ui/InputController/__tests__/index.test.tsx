import { useForm } from 'react-hook-form';
import { InputController } from '..';
import { fireEvent, render, screen } from '@testing-library/react';

describe('InputController Component', () => {
  const TestWrapper = ({
    transformValueOnChange,
  }: {
    transformValueOnChange?: (value: string) => string | undefined;
  }) => {
    const { control } = useForm({ defaultValues: { testField: '' } });

    return (
      <InputController
        label='Test Input'
        name='testField'
        control={control}
        transformValueOnChange={transformValueOnChange}
      />
    );
  };

  it('matches snapshot', () => {
    const { container } = render(<TestWrapper />);
    expect(container).toMatchSnapshot();
  });

  it('handles input change and transformation', () => {
    const transform = (value: string) => value.toUpperCase();
    render(<TestWrapper transformValueOnChange={transform} />);

    const input = screen.getByLabelText('Test Input');
    fireEvent.change(input, { target: { value: 'hello' } });

    expect(input).toHaveValue('HELLO');
  });

  it('does not update value if transformValueOnChange returns undefined', () => {
    render(<TestWrapper transformValueOnChange={() => undefined} />);
    const input = screen.getByLabelText('Test Input');
    fireEvent.change(input, { target: { value: 'hello' } });
    expect(input).toHaveValue('');
  });
});
