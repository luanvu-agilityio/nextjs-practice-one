import DocsContent from '@/components/DocsContent';
import PageLayout from '@/components/layout/PageLayout';

export const metadata = {
  title: 'Pricing Plans | SaaSCandy',
  description: 'Choose the perfect plan that fits your needs and budget.',
};
function DocsPage() {
  return (
    <PageLayout title='Docs' subtitle='Check our intensive docs'>
      <DocsContent />
    </PageLayout>
  );
}
export default DocsPage;
