'use client';

import { useState } from 'react';

// Components
import { Heading, Typography, Button, Section } from '@/components/common';

// Constants
import { docsCategories, sampleContent } from '@/constants/docs';

const DocsContent = () => {
  const [activeSection, setActiveSection] = useState('quick-start');

  return (
    <Section className='bg-white'>
      <div className='max-w-[1296px] mx-auto'>
        <div className='grid grid-cols-1 lg:grid-cols-4 gap-8'>
          {/* Sidebar Navigation */}
          <div className='lg:col-span-1'>
            <div className='sticky top-8 space-y-6'>
              <div className='bg-gray-50 rounded-lg p-6'>
                <Heading
                  as='h3'
                  size='lg'
                  content='Documentation'
                  className='text-primary mb-4'
                />

                <nav className='space-y-4'>
                  {docsCategories.map((category, index) => (
                    <div key={index}>
                      <Typography
                        className='text-gray-background font-semibold text-sm uppercase tracking-wide mb-2'
                        content={category.title}
                      />
                      <ul className='space-y-1'>
                        {category.items.map((item, itemIndex) => (
                          <li key={itemIndex}>
                            <button
                              onClick={() =>
                                setActiveSection(item.href.replace('#', ''))
                              }
                              className={`text-left w-full p-2 rounded text-sm transition-colors ${
                                activeSection === item.href.replace('#', '')
                                  ? 'bg-blue-50 text-blue-600 font-medium'
                                  : 'text-gray-background hover:text-primary hover:bg-gray-50'
                              }`}
                            >
                              {item.title}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </nav>
              </div>

              {/* Help Section */}
              <div className='bg-blue-50 rounded-lg p-6'>
                <Heading
                  as='h4'
                  size='md'
                  content='Need Help?'
                  className='text-primary mb-3'
                />
                <Typography
                  className='text-gray-background text-sm mb-4'
                  content="Can't find what you're looking for? Get in touch with our support team."
                />
                <Button variant='primary' size='small'>
                  Contact Support
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className='lg:col-span-3'>
            <div className='bg-white rounded-lg border border-gray-200 p-8'>
              {sampleContent[activeSection as keyof typeof sampleContent] ? (
                <div>
                  <Heading
                    as='h2'
                    size='xl'
                    content={
                      sampleContent[activeSection as keyof typeof sampleContent]
                        .title
                    }
                    className='text-primary mb-6'
                  />

                  <div className='prose prose-lg max-w-none'>
                    <Typography className='text-gray-700 whitespace-pre-line leading-relaxed'>
                      {
                        sampleContent[
                          activeSection as keyof typeof sampleContent
                        ].content
                      }
                    </Typography>
                  </div>

                  {/* Code Example */}
                  <div className='mt-8 bg-gray-900 rounded-lg p-6'>
                    <div className='flex items-center justify-between mb-4'>
                      <Typography className='text-white font-medium'>
                        Example Code
                      </Typography>
                      <Button variant='secondary' size='small'>
                        Copy
                      </Button>
                    </div>
                    <pre className='text-green-400 text-sm'>
                      <code>{`import { SaaSCandy } from '@saascandy/sdk';

const client = new SaaSCandy({
  apiKey: 'your-api-key',
  environment: 'production'
});

// Initialize your app
client.init().then(() => {
  console.log('SaaSCandy initialized successfully!');
});`}</code>
                    </pre>
                  </div>

                  {/* Navigation */}
                  <div className='flex justify-between items-center mt-12 pt-6 border-t border-gray-200'>
                    <Button variant='secondary'>← Previous</Button>
                    <Button variant='primary'>Next →</Button>
                  </div>
                </div>
              ) : (
                <div className='text-center py-12'>
                  <Typography
                    className='text-gray-500'
                    content='Select a topic from the sidebar to view documentation.'
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
};

export { DocsContent };
