import PageLayout from '@/components/layout/PageLayout';
import PricingPage from '@/components/PricingPage';

export const metadata = {
  title: 'Pricing Plans | SaaSCandy',
  description: 'Choose the perfect plan that fits your needs and budget.',
};

function Pricing() {
  return (
    <PageLayout
      title='Pricing'
      subtitle="Choose the perfect plan that fits your needs. Whether you're just getting started or scaling up, we've got you covered."
    >
      <PricingPage />
    </PageLayout>
  );
}
export default Pricing;
