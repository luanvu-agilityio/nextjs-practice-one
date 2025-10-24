import { PageLayout } from '@/components/layout';
import { ServicePageContent } from '@/components/pages';

export const metadata = {
  title: 'Services | SaaSCandy',
  description: 'Choose the perfect plan that fits your needs and budget.',
};

const ServicePage = () => {
  return (
    <PageLayout
      title='Services'
      subtitle="Choose the perfect plan that fits your needs. Whether you're just getting started or scaling up, we've got you covered."
    >
      <ServicePageContent />
    </PageLayout>
  );
};
export default ServicePage;
