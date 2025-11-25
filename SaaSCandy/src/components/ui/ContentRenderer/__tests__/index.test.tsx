import { render } from '@testing-library/react';

import { ContentBlock } from '@/types/blog-post';
import { ContentRenderer } from '..';

const mockBlocks: ContentBlock[] = [
  {
    id: '1',
    type: 'heading',
    content: { level: 2, text: 'Test Heading' },
  },
  {
    id: '2',
    type: 'paragraph',
    content: { text: 'Test paragraph content' },
  },
  {
    id: '3',
    type: 'list',
    content: { ordered: false, items: ['Item 1', 'Item 2', 'Item 3'] },
  },
  {
    id: '4',
    type: 'quote',
    content: { text: 'Test quote', author: 'Test Author' },
  },
  {
    id: '5',
    type: 'image',
    content: {
      src: '/test.jpg',
      alt: 'Test image',
      width: 800,
      height: 400,
      caption: 'Test caption',
    },
  },
  {
    id: '6',
    type: 'code',
    content: { code: 'const test = "hello";', language: 'javascript' },
  },
];

describe('ContentRenderer - Snapshot Tests', () => {
  it('should match snapshot with all block types', () => {
    const { container } = render(<ContentRenderer blocks={mockBlocks} />);
    expect(container).toMatchSnapshot();
  });

  it('should render all content blocks', () => {
    const { container } = render(<ContentRenderer blocks={mockBlocks} />);

    expect(container.querySelector('h2')).toBeInTheDocument();
    expect(container.querySelector('ul')).toBeInTheDocument();
    expect(container.querySelector('blockquote')).toBeInTheDocument();
    expect(container.querySelector('img')).toBeInTheDocument();
    expect(container.querySelector('pre')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <ContentRenderer blocks={mockBlocks} className='custom-class' />
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('custom-class');
  });

  it('ignores unknown block types and does not render them', () => {
    const invalidBlock = {
      id: '7',
      type: 'unknown',
      content: {},
    } as unknown as ContentBlock;
    const { container } = render(
      <ContentRenderer blocks={[...mockBlocks, invalidBlock]} />
    );

    const wrapper = container.firstChild as HTMLElement;
    // the unknown block should not produce an additional child element
    expect(wrapper.children.length).toBe(mockBlocks.length);
  });

  it('covers remaining branches: heading level !=2, ordered list, quote without author, image without caption, code without language', () => {
    const extraBlocks: ContentBlock[] = [
      { id: '7', type: 'heading', content: { level: 3, text: 'H3' } },
      { id: '8', type: 'list', content: { ordered: true, items: ['A', 'B'] } },
      { id: '9', type: 'quote', content: { text: 'No author' } },
      {
        id: '10',
        type: 'image',
        // omit width/height to exercise the fallback expressions (width || 800, height || 400)
        content: { src: '/no-caption.jpg', alt: 'No caption image' },
      },
      { id: '11', type: 'code', content: { code: 'console.log(1);' } },
    ];

    const { container } = render(
      <ContentRenderer blocks={[...mockBlocks, ...extraBlocks]} />
    );

    // heading level 3 should render as h3
    expect(container.querySelector('h3')).toBeInTheDocument();
    // ordered list should render an <ol>
    expect(container.querySelector('ol')).toBeInTheDocument();
    // quote without author: find the blockquote containing our 'No author' text and ensure it has no <cite>
    const blockquotes = Array.from(container.querySelectorAll('blockquote'));
    const noAuthorBlock = blockquotes.find(b =>
      b.textContent?.includes('No author')
    );
    expect(noAuthorBlock).toBeDefined();
    if (noAuthorBlock) {
      expect(noAuthorBlock.querySelector('cite')).toBeNull();
    }
    // image without caption should not render the caption text for that image
    const imgs = Array.from(container.querySelectorAll('img'));
    const noCaptionImg = imgs.find(i =>
      i.getAttribute('src')?.includes('no-caption')
    );
    expect(noCaptionImg).toBeDefined();
    if (noCaptionImg) {
      const parent = noCaptionImg.parentElement;
      expect(parent?.textContent).not.toContain('Test caption');
    }

    // code without language: find the code node that contains our extra snippet and assert it has no language- class
    const codeNodes = Array.from(container.querySelectorAll('pre code'));
    const extraCode = codeNodes.find(c =>
      c.textContent?.includes('console.log(1)')
    );
    expect(extraCode).toBeDefined();
    if (extraCode) {
      expect(extraCode.className).toBe('');
    }
  });
});
