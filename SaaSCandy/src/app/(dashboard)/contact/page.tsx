import PageLayout from '@/components/layout/PageLayout';
import ContactPage from '@/components/ContactPage';

export const metadata = {
  title: 'Pricing Plans | SaaSCandy',
  description: 'Choose the perfect plan that fits your needs and budget.',
};

function Contact() {
  return (
    <PageLayout
      title='Contact Us'
      subtitle='Send us a message or reach out via traditional contact to inquire you with a comprehensive understanding of the best trends.'
    >
      <ContactPage />
    </PageLayout>
  );
}
export default Contact;
