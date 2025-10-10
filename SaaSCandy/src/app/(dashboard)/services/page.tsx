import PageLayout from '@/components/layout/PageLayout';
import ServicePage from '@/components/ServicePage';

export const metadata = {
  title: 'Services | SaaSCandy',
  description: 'Choose the perfect plan that fits your needs and budget.',
};

function Service() {
  return (
    <PageLayout
      title='Services'
      subtitle="Choose the perfect plan that fits your needs. Whether you're just getting started or scaling up, we've got you covered."
    >
      <ServicePage />
    </PageLayout>
  );
}
export default Service;
