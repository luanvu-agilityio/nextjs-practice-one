import { render } from '@testing-library/react';
import { ContentRenderer } from '@/components/ContentRenderer';
import { ContentBlock } from '@/types/blog-post';

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
});
