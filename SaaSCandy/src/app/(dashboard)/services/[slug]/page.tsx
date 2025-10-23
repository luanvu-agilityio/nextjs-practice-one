import { notFound } from 'next/navigation';

// Components
import PageLayout from '@/components/layout/PageLayout';
import ServiceDetailPage from '@/components/ServiceDetailPage';

// Helpers
import { getAllServices, getServiceBySlug } from '@/helpers';

interface ServicePageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
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

export default function ServicePage({ params }: Readonly<ServicePageProps>) {
  const service = getServiceBySlug(params.slug);

  if (!service) {
    notFound();
    return null;
  }

  return (
    <PageLayout title={service.title} subtitle={service.subtitle}>
      <ServiceDetailPage service={service} />
    </PageLayout>
  );
}
