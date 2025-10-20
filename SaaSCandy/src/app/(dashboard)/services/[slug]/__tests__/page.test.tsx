// Service Detail Page Tests
import ServicePage, {
  generateMetadata,
} from '@/app/(dashboard)/services/[slug]/page';
import { getServiceBySlug } from '@/helpers';

jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
}));

jest.mock('@/helpers', () => ({
  getAllServices: jest.fn(),
  getServiceBySlug: jest.fn(),
}));

jest.mock('@/components/layout/PageLayout', () => {
  return function MockPageLayout({
    title,
    subtitle,
    children,
  }: {
    title: string;
    subtitle: string;
    children: React.ReactNode;
  }) {
    return (
      <div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
        {children}
      </div>
    );
  };
});

jest.mock('@/components/ServiceDetailPage', () => {
  return function MockServiceDetailPage({
    service,
  }: {
    service: { title: string };
  }) {
    return <div data-testid='service-detail'>{service.title}</div>;
  };
});

const mockGetServiceBySlug = getServiceBySlug as jest.MockedFunction<
  typeof getServiceBySlug
>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('generateMetadata', () => {
  it('should return not found metadata when service missing', async () => {
    mockGetServiceBySlug.mockReturnValue(null);

    const result = await generateMetadata({ params: { slug: 'missing' } });

    expect(result).toEqual({
      title: 'Service Not Found | SaaSCandy',
    });
  });
});
