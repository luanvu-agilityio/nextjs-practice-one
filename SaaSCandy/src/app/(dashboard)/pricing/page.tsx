import { PageLayout } from '@/components/layout';
import { PricingPageContent } from '@/components/pages';

export const metadata = {
  title: 'Pricing Plans | SaaSCandy',
  description: 'Choose the perfect plan that fits your needs and budget.',
};

const PricingPage = () => {
  return (
    <PageLayout
      title='Pricing'
      subtitle="Choose the perfect plan that fits your needs. Whether you're just getting started or scaling up, we've got you covered."
    >
      <PricingPageContent />
    </PageLayout>
  );
};
export default PricingPage;
