import { PageLayout } from '@/components/layout';
import { ContactPageContent } from '@/components/pages';

export const metadata = {
  title: 'Pricing Plans | SaaSCandy',
  description: 'Choose the perfect plan that fits your needs and budget.',
};

const ContactPage = () => {
  return (
    <PageLayout
      title='Contact Us'
      subtitle='Send us a message or reach out via traditional contact to inquire you with a comprehensive understanding of the best trends.'
    >
      <ContactPageContent />
    </PageLayout>
  );
};
export default ContactPage;
