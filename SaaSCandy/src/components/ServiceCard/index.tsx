import { ReactNode } from 'react';

// Components
import { Heading, Typography } from '../common';

interface Doc {
  icon: ReactNode;
  title: string;
  description: string;
}

interface DocCardProps {
  index: number;
  doc: Doc;
}

function ServiceCard({ index, doc }: Readonly<DocCardProps>) {
  const { icon, title, description } = doc;
  return (
    <div
      key={index}
      className='text-center space-y-7.5 border border-blue-border-color rounded-5xl py-8'
    >
      <div
        className='w-20 h-20 rounded-full flex items-center justify-center mx-auto'
        style={{ backgroundColor: 'rgba(146,172,242,0.3)' }}
      >
        {icon}
      </div>
      <Heading as='h4' size='lg' content={title} className='text-white' />
      <Typography
        content={description}
        className='text-white opacity-50 font-medium text-lg'
      />
    </div>
  );
}
export default ServiceCard;
