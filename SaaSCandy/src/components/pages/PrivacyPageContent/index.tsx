'use client';

import Link from 'next/link';

// Components
import { Heading, Section, Typography } from '@/components/common';

// Constants
import { privacyContent } from '@/constants';

const PrivacyPageContent = () => {
  return (
    <div className='max-w-4xl mx-auto px-4 py-12'>
      <header className='text-center mb-4'>
        <Heading
          as='h2'
          size='3xl'
          content='Privacy Policy'
          className='text-5xl sm:text-6xl'
        />
        <Typography className='text-lg text-gray-background mt-2 font-bold'>
          Last updated: {privacyContent.updated}
        </Typography>
      </header>

      {privacyContent.sections.map(section => (
        <Section
          key={section.id}
          title={section.title}
          className='py-4 sm:py-4'
          headerClassName='mb-4 sm:mb-4'
        >
          {section.paragraphs?.map((p, idx) => (
            <Typography key={idx} className='text-lg mb-3'>
              {p}
            </Typography>
          ))}

          {section.listItems && section.ordered && (
            <ol className='list-decimal pl-5 space-y-2 text-lg'>
              {section.listItems.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ol>
          )}

          {section.listItems && !section.ordered && (
            <ul className='list-disc pl-5 space-y-2 text-lg'>
              {section.listItems.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          )}

          {section.id === 'contact' && (
            <Typography className='text-lg mt-3'>
              <Link
                href={`mailto:${privacyContent.contactEmail}`}
                className='text-primary'
              >
                {privacyContent.contactEmail}
              </Link>
            </Typography>
          )}
        </Section>
      ))}

      <footer className='mt-8 text-sm text-gray-background'>
        <Typography className='text-lg'>
          This policy may be updated from time to time. We will post any changes
          on this page with a revised “last updated” date.
        </Typography>
      </footer>
    </div>
  );
};

export { PrivacyPageContent };
