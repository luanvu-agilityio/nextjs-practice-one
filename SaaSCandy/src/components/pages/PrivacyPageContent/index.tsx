'use client';

import Link from 'next/link';

import { Heading, Typography } from '@/components/common';

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

const Section = ({ title, children }: SectionProps) => (
  <section className='py-6'>
    <Heading as='h2' size='md' className='mb-3' content={title} />
    <div className='prose max-w-none text-gray-700'>{children}</div>
  </section>
);

const PrivacyPageContent = () => {
  const updated = 'November 4, 2025';

  return (
    <div className='max-w-4xl mx-auto px-4 py-12'>
      <header className='text-center mb-8'>
        <Heading
          as='h1'
          size='xl'
          content='Privacy Policy'
          className='text-3xl sm:text-4xl'
        />
        <Typography className='text-sm text-gray-500 mt-2'>
          Last updated: {updated}
        </Typography>
      </header>

      <Section title='Introduction'>
        <Typography>
          SaaSCandy respects your privacy. This Privacy Policy explains what
          information we collect, why we collect it, and how you can manage your
          information. By using our services you agree to the collection and use
          of information in accordance with this policy.
        </Typography>
      </Section>

      <Section title='Information We Collect'>
        <ul className='list-disc pl-5 space-y-2'>
          <li>
            <strong>Personal information:</strong> name, email address, profile
            and account details you provide when you sign up.
          </li>
          <li>
            <strong>Usage data:</strong> pages visited, features used,
            timestamps and diagnostic data collected automatically to help us
            improve the product.
          </li>
          <li>
            <strong>Third-party data:</strong> data returned by services you
            connect (for example, OAuth providers) when you choose to link an
            account.
          </li>
        </ul>
      </Section>

      <Section title='How We Use Your Information'>
        <ol className='list-decimal pl-5 space-y-2'>
          <li>To provide and maintain the service.</li>
          <li>To communicate with you about your account and updates.</li>
          <li>To monitor and analyze usage to improve performance.</li>
          <li>To protect against fraud, abuse and security incidents.</li>
        </ol>
      </Section>

      <Section title='Data Retention'>
        <Typography>
          We retain personal data only as long as necessary for the purposes set
          out in this policy, or as required by law. When data is no longer
          necessary we will securely delete or anonymize it.
        </Typography>
      </Section>

      <Section title='Third-party Services & Cookies'>
        <Typography className='mb-2'>
          We use third-party services to power parts of the product (email,
          analytics, payments). Those services have their own privacy policies —
          links are provided below where applicable.
        </Typography>
        <ul className='list-disc pl-5 space-y-2'>
          <li>
            <strong>Analytics:</strong> we use analytics to understand usage and
            improve the product. You can opt out through your browser or account
            settings where available.
          </li>
          <li>
            <strong>Payments:</strong> payments are processed by PCI-compliant
            providers and we do not store full payment card numbers on our
            systems.
          </li>
        </ul>
      </Section>

      <Section title='Security'>
        <Typography>
          We implement reasonable administrative, technical and physical
          safeguards to protect your information. However, no method of
          transmission over the internet or electronic storage is completely
          secure — please use strong, unique passwords and two-factor
          authentication where supported.
        </Typography>
      </Section>

      <Section title='Your Choices & Rights'>
        <ul className='list-disc pl-5 space-y-2'>
          <li>
            <strong>Access & Correction:</strong> you can access and update your
            account information via your account settings.
          </li>
          <li>
            <strong>Deletion:</strong> you may request that we delete your
            account and personal data — contact us using the address below.
          </li>
          <li>
            <strong>Marketing:</strong> you can opt out of marketing emails via
            the unsubscribe link in the message or in account settings.
          </li>
        </ul>
      </Section>

      <Section title='Contact'>
        <Typography>
          If you have questions, requests, or concerns about this policy, please
          contact us at{' '}
          <Link
            href='mailto:privacy@saascandy.example'
            className='text-primary'
          >
            privacy@saascandy.example
          </Link>
          .
        </Typography>
      </Section>

      <footer className='mt-8 text-sm text-gray-500'>
        <Typography>
          This policy may be updated from time to time. We will post any changes
          on this page with a revised “last updated” date.
        </Typography>
      </footer>
    </div>
  );
};

export { PrivacyPageContent };
