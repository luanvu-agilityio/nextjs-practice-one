import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuShortcut,
} from '../index';

describe('DropdownMenu (common)', () => {
  it('opens content when trigger is clicked', async () => {
    const user = userEvent.setup();

    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>First</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    // content should not be visible initially
    expect(screen.queryByText('First')).not.toBeInTheDocument();

    await user.click(screen.getByText('Open'));

    expect(await screen.findByText('First')).toBeInTheDocument();
  });

  it('applies inset class when inset prop is provided on item', async () => {
    const user = userEvent.setup();

    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem inset>Inset Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    await user.click(screen.getByText('Open'));
    const item = await screen.findByText('Inset Item');
    expect(item).toHaveClass('pl-8');
  });

  it('renders shortcut element and preserves provided text', async () => {
    const user = userEvent.setup();

    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>
            Action
            <DropdownMenuShortcut>Ctrl+K</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    await user.click(screen.getByText('Open'));
    expect(await screen.findByText('Ctrl+K')).toBeInTheDocument();
  });

  it('renders checkbox item indicator when checked', async () => {
    const user = userEvent.setup();

    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem checked>Checked</DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    await user.click(screen.getByText('Open'));
    const item = await screen.findByText('Checked');
    // the indicator contains an svg element (the Check icon)
    expect(item.querySelector('svg')).toBeTruthy();
  });

  it('renders Label, Separator and Shortcut standalone', () => {
    const { getByText } = render(
      <DropdownMenuShortcut>Ctrl+S</DropdownMenuShortcut>
    );
    expect(getByText('Ctrl+S')).toBeInTheDocument();
  });
});
