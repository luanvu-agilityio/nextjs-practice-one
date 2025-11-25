import { notFound } from 'next/navigation';

// Components
import { PageLayout } from '@/components/layout';

// Helpers
import { getAllServices, getServiceBySlug } from '@/helpers';
import { ServiceDetailPageContent } from '@/features';

interface ServicePageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const services = getAllServices();
  return services.map(service => ({
    slug: service.slug,
  }));
}

export async function generateMetadata({ params }: ServicePageProps) {
  const service = getServiceBySlug(params.slug);

  if (!service) {
    return {
      title: 'Service Not Found | SaaSCandy',
    };
  }

  return {
    title: `${service.title} | SaaSCandy`,
    description: service.description,
  };
}

const ServicePage = ({ params }: Readonly<ServicePageProps>) => {
  const service = getServiceBySlug(params.slug);

  if (!service) {
    notFound();
    return null;
  }

  return (
    <PageLayout title={service.title} subtitle={service.subtitle}>
      <ServiceDetailPageContent service={service} />
    </PageLayout>
  );
};
export default ServicePage;
