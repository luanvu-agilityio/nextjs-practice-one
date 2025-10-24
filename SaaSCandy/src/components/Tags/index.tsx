import { Heading } from '@/components/common';

interface TagsProps {
  tags: string[];
  className?: string;
}

const Tags = ({ tags, className = '' }: TagsProps) => {
  return (
    <div className={`${className}`}>
      <Heading
        as='h3'
        className='font-semibold text-gray-900 mb-2 sm:mb-3 text-lg sm:text-xl'
        content='Tags'
      />
      <ul className='space-y-1'>
        {tags.map(tag => (
          <li key={tag}>
            <span className='text-xs sm:text-sm text-gray-600 capitalize'>
              - {tag}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export { Tags };
