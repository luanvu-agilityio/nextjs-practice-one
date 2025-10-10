import { render, screen } from '@testing-library/react';
import { Divider } from '..';

describe('Divider', () => {
  it('renders match snapshot', () => {
    const { container } = render(<Divider />);
    expect(container).toMatchSnapshot();
  });

  it('renders with default props', () => {
    render(<Divider />);

    const text = screen.getByText('OR');
    expect(text).toBeInTheDocument();
    expect(text).toHaveClass('text-sm', 'text-gray-500', 'font-medium');
  });

  it('renders with custom text', () => {
    render(<Divider text='AND' />);

    const text = screen.getByText('AND');
    expect(text).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<Divider className='custom-class' />);

    const divider = container.firstChild as HTMLElement;
    expect(divider).toHaveClass('custom-class');
  });
});
