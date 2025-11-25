import { ContentBlock } from '@/types/blog-post';
import { Heading, Typography } from '@/components/ui';
import Image from 'next/image';

interface ContentRendererProps {
  blocks: ContentBlock[];
  className?: string;
}

const ContentRenderer = ({
  blocks,
  className = '',
}: Readonly<ContentRendererProps>) => {
  const renderBlock = (block: ContentBlock) => {
    switch (block.type) {
      case 'heading':
        return (
          <Heading
            key={block.id}
            as={`h${block.content.level}`}
            size={block.content.level === 2 ? 'xl' : 'lg'}
            content={block.content.text}
            className='text-gray-primary font-bold mb-3 sm:mb-4 text-xl sm:text-2xl lg:text-3xl'
          />
        );

      case 'paragraph':
        return (
          <Typography
            key={block.id}
            content={block.content.text}
            className='text-gray-background mb-3 sm:mb-4 leading-relaxed text-sm sm:text-xs lg:text-lg'
          />
        );

      case 'list': {
        const ListTag = block.content.ordered ? 'ol' : 'ul';
        return (
          <ListTag
            key={block.id}
            className='mb-3 sm:mb-4 pl-4 sm:pl-6 space-y-1 sm:space-y-2'
          >
            {block.content.items.map((item: string, index: number) => (
              <li
                key={index}
                className='text-gray-background text-sm sm:text-xs'
              >
                {item}
              </li>
            ))}
          </ListTag>
        );
      }

      case 'quote':
        return (
          <blockquote
            key={block.id}
            className='border-l-4 border-primary pl-3 sm:pl-4 py-2 mb-3 sm:mb-4 italic text-gray-foreground bg-inactive-background rounded-r'
          >
            <Typography
              content={`"${block.content.text}"`}
              className='text-sm sm:text-xs'
            />
            {block.content.author && (
              <cite className='text-xs sm:text-sm text-gray-background'>
                — {block.content.author}
              </cite>
            )}
          </blockquote>
        );

      case 'image':
        return (
          <div key={block.id} className='mb-4 sm:mb-6'>
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
                className='text-xs sm:text-sm text-gray-background text-center mt-2 italic'
              />
            )}
          </div>
        );

      case 'code':
        return (
          <pre
            key={block.id}
            className='bg-primary text-inactive-background p-3 sm:p-4 rounded-lg mb-3 sm:mb-4 overflow-x-auto text-xs sm:text-sm'
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
        return null;
    }
  };

  return (
    <div
      className={`prose prose-sm sm:prose-base lg:prose-lg max-w-none ${className}`}
    >
      {blocks.map(renderBlock)}
    </div>
  );
};

export { ContentRenderer };
