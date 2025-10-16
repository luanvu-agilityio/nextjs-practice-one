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
      className='text-center space-y-4 sm:space-y-6 lg:space-y-7.5 border border-blue-border-color rounded-3xl sm:rounded-4xl lg:rounded-5xl py-6 px-4 sm:py-8 sm:px-6'
    >
      <div
        className='w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 rounded-full flex items-center justify-center mx-auto'
        style={{ backgroundColor: 'rgba(146,172,242,0.3)' }}
      >
        {icon}
      </div>
      <Heading
        as='h4'
        size='lg'
        content={title}
        className='text-white text-lg sm:text-xl lg:text-2xl'
      />
      <Typography
        content={description}
        className='text-white opacity-50 font-medium  sm:text-lg px-2'
      />
    </div>
  );
}
export default ServiceCard;
