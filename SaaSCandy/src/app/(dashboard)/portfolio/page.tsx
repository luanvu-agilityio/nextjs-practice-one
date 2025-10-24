import { PageLayout } from '@/components/layout';
import { PortfolioPageContent } from '@/components/pages';

export const metadata = {
  title: 'Pricing Plans | SaaSCandy',
  description: 'Choose the perfect plan that fits your needs and budget.',
};
const PortfolioPage = () => {
  return (
    <PageLayout
      title='Portfolio'
      subtitle='Select the ideal plan for your business. From startups to scaling enterprises, we have the perfect solution to support your growth.'
    >
      <PortfolioPageContent />
    </PageLayout>
  );
};
export default PortfolioPage;
