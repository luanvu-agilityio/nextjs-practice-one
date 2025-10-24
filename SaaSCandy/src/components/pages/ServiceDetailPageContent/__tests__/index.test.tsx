import { render, screen } from '@testing-library/react';
import { ServiceDetailPageContent } from '../index';
import { Service } from '@/types';

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({
    src,
    alt,
    className,
  }: {
    src: string;
    alt: string;
    className: string;
  }) => <img src={src} alt={alt} className={className} />,
}));

jest.mock('@/components/common', () => ({
  __esModule: true,
  Heading: ({ content, ...props }: { content: string }) => (
    <h3 {...props}>{content}</h3>
  ),
  Typography: ({ content, ...props }: { content: string }) => (
    <p {...props}>{content}</p>
  ),
  Section: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className: string;
  }) => <section className={className}>{children}</section>,
}));

describe('ServiceDetailPageContent', () => {
  const mockService: Service = {
    title: 'EdTech App',
    slug: 'edtech-app',
    whatItDoes: {
      description:
        'An educational technology application that helps students learn better.',
      title: '',
      image: '',
    },
    features: [
      {
        id: '1',
        title: 'Interactive Learning',
        description: 'Engage with interactive content',
      },
      {
        id: '2',
        title: 'Progress Tracking',
        description: 'Monitor student progress in real-time',
      },
    ],
    subtitle: '',
    description: '',
    icon: '',
  };

  it('should render service title and description', () => {
    render(<ServiceDetailPageContent service={mockService} />);

    expect(screen.getByText('What It')).toBeInTheDocument();
    expect(screen.getByText('Does')).toBeInTheDocument();
    expect(
      screen.getByText(mockService.whatItDoes.description)
    ).toBeInTheDocument();
  });

  it('should render all features', () => {
    render(<ServiceDetailPageContent service={mockService} />);

    expect(screen.getByText(/Interactive Learning/)).toBeInTheDocument();
    expect(
      screen.getByText(/Engage with interactive content/)
    ).toBeInTheDocument();
    expect(screen.getByText(/Progress Tracking/)).toBeInTheDocument();
    expect(
      screen.getByText(/Monitor student progress in real-time/)
    ).toBeInTheDocument();
  });

  it('should render service image', () => {
    render(<ServiceDetailPageContent service={mockService} />);

    const image = screen.getByAltText('edtech app');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/images/service/service-1.png');
  });

  it('should render features section with proper styling', () => {
    const { container } = render(
      <ServiceDetailPageContent service={mockService} />
    );

    const featuresSection = container.querySelectorAll('section')[1];
    expect(featuresSection.className).toContain('bg-inactive-background');
  });
});
