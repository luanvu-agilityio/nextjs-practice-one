import { render } from '@testing-library/react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
} from '../index';

describe('DropdownMenu', () => {
  it('matches snapshot', () => {
    const { container } = render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Settings</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    expect(container).toMatchSnapshot();
  });

  it('renders Label with inset', () => {
    const { getByText } = render(
      <DropdownMenuLabel inset>LabelInset</DropdownMenuLabel>
    );
    expect(getByText('LabelInset')).toBeInTheDocument();
  });

  it('renders Separator', () => {
    const { container } = render(<DropdownMenuSeparator />);
    expect(container.firstChild).toHaveClass('bg-gray-background');
  });

  it('renders Shortcut', () => {
    const { getByText } = render(
      <DropdownMenuShortcut>Ctrl+S</DropdownMenuShortcut>
    );
    expect(getByText('Ctrl+S')).toBeInTheDocument();
  });
});
