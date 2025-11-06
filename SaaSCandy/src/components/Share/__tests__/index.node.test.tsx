/**
 * @jest-environment node
 */

import React from 'react';

// Import the component factory (not rendering to DOM in node env)
import { Share } from '../index';

// Provide the same mocks but as simple placeholders so the JSX tree contains the mocked component types
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
  } & React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
    return React.createElement(
      'a',
      props as React.AnchorHTMLAttributes<HTMLAnchorElement>,
      children
    );
  },
}));

jest.mock('lucide-react', () => ({
  Facebook: () =>
    React.createElement('svg', { 'data-testid': 'facebook-icon' }),
  Twitter: () => React.createElement('svg', { 'data-testid': 'twitter-icon' }),
  Linkedin: () =>
    React.createElement('svg', { 'data-testid': 'linkedin-icon' }),
}));

jest.mock('@/components/common', () => ({
  Heading: ({ content }: { content: string }) =>
    React.createElement('h3', null, content),
}));

function findByType(
  node: React.ReactNode,
  type: React.ElementType
): React.ReactElement[] {
  const found: React.ReactElement[] = [];
  if (!node) return found;
  if (Array.isArray(node)) {
    for (const n of node) {
      found.push(...findByType(n, type));
    }
    return found;
  }
  const el = node as React.ReactElement;
  if (el.type === type) found.push(el);
  const children = (el.props as { children?: React.ReactNode })?.children;
  if (children) {
    if (Array.isArray(children)) {
      for (const c of children) {
        found.push(...findByType(c, type));
      }
    } else {
      found.push(...findByType(children, type));
    }
  }
  return found;
}

import LinkMock from 'next/link';

describe('Share (node environment) - server side shareUrl behavior', () => {
  it('uses provided url when no DOM/window present', () => {
    const el = Share({ url: 'https://example.com', title: 'Test' });

    const links = findByType(el, LinkMock as unknown as React.ElementType);
    expect(links.length).toBeGreaterThan(0);
    const fb = links.find(l => {
      const props = l.props as { href?: string } | undefined;
      return (
        typeof props?.href === 'string' && props.href.includes('facebook.com')
      );
    });
    expect(fb).toBeDefined();
    const fbHref = (fb!.props as { href?: string }).href;
    expect(fbHref).toBeDefined();
    expect(fbHref).toContain(encodeURIComponent('https://example.com'));
  });
});
