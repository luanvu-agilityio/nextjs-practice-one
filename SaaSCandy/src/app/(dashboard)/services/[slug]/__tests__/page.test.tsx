import { notFound } from 'next/navigation';
import { getAllServices, getServiceBySlug } from '@/helpers';
import {
  generateStaticParams,
  generateMetadata,
  default as ServicePage,
} from '../page';

jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
}));

jest.mock('@/helpers', () => ({
  getAllServices: jest.fn(),
  getServiceBySlug: jest.fn(),
}));

jest.mock('@/components/layout/PageLayout', () => ({
  MockPageLayout: ({
    title,
    subtitle,
    children,
  }: {
    title: string;
    subtitle: string;
    children: React.ReactNode;
  }) => {
    return (
      <div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
        {children}
      </div>
    );
  },
}));

jest.mock('@/components/pages', () => ({
  ServiceDetailPageContent: ({ service }: { service: { title: string } }) => {
    return <div data-testid='service-detail'>{service.title}</div>;
  },
}));

const mockGetAllServices = getAllServices as jest.MockedFunction<
  typeof getAllServices
>;
const mockGetServiceBySlug = getServiceBySlug as jest.MockedFunction<
  typeof getServiceBySlug
>;
const mockNotFound = notFound as unknown as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('generateStaticParams', () => {
  it('should return params for all services', async () => {
    mockGetAllServices.mockReturnValue([
      {
        slug: 'foo',
        title: '',
        subtitle: '',
        description: '',
        whatItDoes: {
          title: '',
          description: '',
          image: '',
        },
        features: [],
        icon: '',
      },
      {
        slug: 'bar',
        title: '',
        subtitle: '',
        description: '',
        whatItDoes: {
          title: '',
          description: '',
          image: '',
        },
        features: [],
        icon: '',
      },
    ]);
    const result = await generateStaticParams();
    expect(result).toEqual([{ slug: 'foo' }, { slug: 'bar' }]);
    expect(mockGetAllServices).toHaveBeenCalled();
  });
});

describe('generateMetadata', () => {
  it('should return not found metadata when service missing', async () => {
    mockGetServiceBySlug.mockReturnValue(null);
    const result = await generateMetadata({ params: { slug: 'missing' } });
    expect(result).toEqual({
      title: 'Service Not Found | SaaSCandy',
    });
  });

  it('should return metadata when service found', async () => {
    mockGetServiceBySlug.mockReturnValue({
      title: 'My Service',
      description: 'desc',
      slug: '',
      subtitle: '',
      whatItDoes: {
        title: '',
        description: '',
        image: '',
      },
      features: [],
      icon: '',
    });
    const result = await generateMetadata({ params: { slug: 'my-service' } });
    expect(result).toEqual({
      title: 'My Service | SaaSCandy',
      description: 'desc',
    });
  });
});

describe('ServicePage', () => {
  it('should call notFound when service is missing', () => {
    mockGetServiceBySlug.mockReturnValue(null);
    const result = ServicePage({ params: { slug: 'missing' } });
    expect(mockGetServiceBySlug).toHaveBeenCalledWith('missing');
    expect(mockNotFound).toHaveBeenCalled();
    expect(result).toBeNull();
  });
});
