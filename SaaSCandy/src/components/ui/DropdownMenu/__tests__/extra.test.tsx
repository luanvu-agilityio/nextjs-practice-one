import React from 'react';
import { render } from '@testing-library/react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '../index';

describe('DropdownMenu - extra branches', () => {
  it('applies inset class to item when inset prop is true', () => {
    const { getByText } = render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem inset>InsetItem</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    const el = getByText('InsetItem');
    // class contains the utility used for inset
    expect(el.className).toEqual(expect.stringContaining('pl-8'));
  });

  it('renders checkbox item indicator (svg) when checked', () => {
    const { getByText } = render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem checked>Checked</DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    expect(getByText('Checked')).toBeInTheDocument();
    // the Check icon should render as an SVG inside the itemIndicator (Radix may portal content)
    expect(document.body.querySelector('svg')).toBeTruthy();
  });

  it('renders sub trigger with chevron icon', () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Inner</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    // ChevronRight icon should render (Radix portals content to document.body; assert there)
    expect(document.body.querySelector('svg')).toBeTruthy();
  });

  it('applies inset class to SubTrigger when inset prop is true', () => {
    const { getByText } = render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger inset>MoreInset</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Inner</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    const el = getByText('MoreInset');
    expect(el.className).toEqual(expect.stringContaining('pl-8'));
  });

  it('applies inset class to Label when inset prop is true', () => {
    const { getByText } = render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel inset>LabelInset</DropdownMenuLabel>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    const label = getByText('LabelInset');
    expect(label.className).toEqual(expect.stringContaining('pl-8'));
  });
});
