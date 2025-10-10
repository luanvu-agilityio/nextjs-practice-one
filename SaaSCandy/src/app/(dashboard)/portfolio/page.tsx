import PageLayout from '@/components/layout/PageLayout';
import PortfolioPage from '@/components/PortfolioPage';

export const metadata = {
  title: 'Pricing Plans | SaaSCandy',
  description: 'Choose the perfect plan that fits your needs and budget.',
};
function Portfolio() {
  return (
    <PageLayout
      title='Portfolio'
      subtitle='Select the ideal plan for your business. From startups to scaling enterprises, we have the perfect solution to support your growth.'
    >
      <PortfolioPage />
    </PageLayout>
  );
}
export default Portfolio;
