import { fireEvent, render, screen } from '@testing-library/react';
import { IconButton } from '../index';
import { Plus } from 'lucide-react';

describe('IconButton Snapshot Tests', () => {
  it('should match snapshot with primary variant and md size', () => {
    const { container } = render(
      <IconButton variant='primary' size='md'>
        <Plus size={16} />
      </IconButton>
    );
    expect(container).toMatchSnapshot();
  });

  it('should match snapshot with outline variant', () => {
    const { container } = render(
      <IconButton variant='outline' size='md'>
        <Plus size={16} />
      </IconButton>
    );
    expect(container).toMatchSnapshot();
  });

  it('should match snapshot with ghost variant', () => {
    const { container } = render(
      <IconButton variant='ghost' size='md'>
        <Plus size={16} />
      </IconButton>
    );
    expect(container).toMatchSnapshot();
  });

  it('should match snapshot with disabled variant', () => {
    const { container } = render(
      <IconButton variant='disabled' size='md' disabled>
        <Plus size={16} />
      </IconButton>
    );
    expect(container).toMatchSnapshot();
  });

  it('should match snapshot with large size', () => {
    const { container } = render(
      <IconButton variant='primary' size='lg'>
        <Plus size={20} />
      </IconButton>
    );
    expect(container).toMatchSnapshot();
  });
});

describe('IconButton Interactive Tests', () => {
  describe('Ref and Props', () => {
    it('should merge custom className', () => {
      render(
        <IconButton className='custom-class' data-testid='icon-button-class'>
          <Plus size={16} />
        </IconButton>
      );
      const button = screen.getByTestId('icon-button-class');
      expect(button.className).toMatch(/custom-class/);
    });

    it('should support all size variants', () => {
      ['sm', 'md', 'lg'].forEach(size => {
        render(
          <IconButton size={size as any} data-testid={`icon-button-${size}`}>
            <Plus size={16} />
          </IconButton>
        );
        const button = screen.getByTestId(`icon-button-${size}`);
        expect(button).toBeInTheDocument();
      });
    });

    it('should pass additional props', () => {
      render(
        <IconButton
          aria-label='plus-button'
          type='submit'
          data-testid='icon-button-extra'
        >
          <Plus size={16} />
        </IconButton>
      );
      const button = screen.getByTestId('icon-button-extra');
      expect(button).toHaveAttribute('aria-label', 'plus-button');
      expect(button).toHaveAttribute('type', 'submit');
    });
  });
  describe('Click Behavior', () => {
    it('should call onClick handler when clicked', () => {
      const handleClick = jest.fn();
      render(
        <IconButton onClick={handleClick}>
          <Plus size={16} />
        </IconButton>
      );

      const button = screen.getByTestId('icon-button');
      fireEvent.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick when disabled', () => {
      const handleClick = jest.fn();
      render(
        <IconButton onClick={handleClick} disabled>
          <Plus size={16} />
        </IconButton>
      );

      const button = screen.getByTestId('icon-button');
      fireEvent.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should not call onClick when variant is disabled', () => {
      const handleClick = jest.fn();
      render(
        <IconButton onClick={handleClick} variant='disabled' disabled>
          <Plus size={16} />
        </IconButton>
      );

      const button = screen.getByTestId('icon-button');
      fireEvent.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });
  });
});
