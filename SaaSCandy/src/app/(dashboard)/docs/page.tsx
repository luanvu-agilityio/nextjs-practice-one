import { PageLayout } from '@/components/layout';
import { DocsContent } from '@/features';

export const metadata = {
  title: 'Pricing Plans | SaaSCandy',
  description: 'Choose the perfect plan that fits your needs and budget.',
};

const DocsPage = () => {
  return (
    <PageLayout title='Docs' subtitle='Check our intensive docs'>
      <DocsContent />
    </PageLayout>
  );
};
export default DocsPage;
