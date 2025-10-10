import { ContentBlock } from '@/types/blog-post';
import { Heading, Typography } from '@/components/common';
import Image from 'next/image';

interface ContentRendererProps {
  blocks: ContentBlock[];
  className?: string;
}

function ContentRenderer({ blocks, className = '' }: ContentRendererProps) {
  const renderBlock = (block: ContentBlock) => {
    switch (block.type) {
      case 'heading':
        return (
          <Heading
            key={block.id}
            as={
              `h${block.content.level}` as
                | 'h1'
                | 'h2'
                | 'h3'
                | 'h4'
                | 'h5'
                | 'h6'
            }
            size={block.content.level === 2 ? 'xl' : 'lg'}
            content={block.content.text}
            className='text-gray-900 font-bold mb-4'
          />
        );

      case 'paragraph':
        return (
          <Typography
            key={block.id}
            content={block.content.text}
            className='text-gray-600 mb-4 leading-relaxed'
          />
        );

      case 'list':
        const ListTag = block.content.ordered ? 'ol' : 'ul';
        return (
          <ListTag key={block.id} className='mb-4 pl-6 space-y-2'>
            {block.content.items.map((item: string, index: number) => (
              <li key={index} className='text-gray-600'>
                {item}
              </li>
            ))}
          </ListTag>
        );

      case 'quote':
        return (
          <blockquote
            key={block.id}
            className='border-l-4 border-primary pl-4 py-2 mb-4 italic text-gray-700 bg-gray-50 rounded-r'
          >
            <Typography content={`"${block.content.text}"`} />
            {block.content.author && (
              <cite className='text-sm text-gray-500'>
                — {block.content.author}
              </cite>
            )}
          </blockquote>
        );

      case 'image':
        return (
          <div key={block.id} className='mb-6'>
            <Image
              src={block.content.src}
              alt={block.content.alt}
              width={block.content.width || 800}
              height={block.content.height || 400}
              className='w-full rounded-lg'
            />
            {block.content.caption && (
              <Typography
                content={block.content.caption}
                className='text-sm text-gray-500 text-center mt-2 italic'
              />
            )}
          </div>
        );

      case 'code':
        return (
          <pre
            key={block.id}
            className='bg-gray-900 text-gray-100 p-4 rounded-lg mb-4 overflow-x-auto'
          >
            <code
              className={
                block.content.language
                  ? `language-${block.content.language}`
                  : undefined
              }
            >
              {block.content.code}
            </code>
          </pre>
        );

      default:
        const _exhaustiveCheck: never = block;
        return _exhaustiveCheck;
    }
  };

  return (
    <div className={`prose prose-lg max-w-none ${className}`}>
      {blocks.map(renderBlock)}
    </div>
  );
}

export { ContentRenderer };
