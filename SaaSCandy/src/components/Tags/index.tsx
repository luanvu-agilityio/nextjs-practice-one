import { Heading } from '../common';

interface TagsProps {
  tags: string[];
  className?: string;
}

function Tags({ tags, className = '' }: TagsProps) {
  return (
    <div className={`${className}`}>
      <Heading
        as='h3'
        className='font-semibold text-gray-900 mb-3'
        content='Tags'
      />
      <ul className='space-y-1'>
        {tags.map(tag => (
          <li key={tag}>
            <span className='text-sm text-gray-600 capitalize'>- {tag}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export { Tags };
