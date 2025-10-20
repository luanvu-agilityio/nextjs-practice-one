import { render, screen } from '@testing-library/react';
import ServiceDetailPage from '../index';
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

jest.mock('../../common/Section', () => ({
  __esModule: true,
  default: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className: string;
  }) => <section className={className}>{children}</section>,
}));

describe('ServiceDetailPage', () => {
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
    render(<ServiceDetailPage service={mockService} />);

    expect(screen.getByText('What It')).toBeInTheDocument();
    expect(screen.getByText('Does')).toBeInTheDocument();
    expect(
      screen.getByText(mockService.whatItDoes.description)
    ).toBeInTheDocument();
  });

  it('should render all features', () => {
    render(<ServiceDetailPage service={mockService} />);

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
    render(<ServiceDetailPage service={mockService} />);

    const image = screen.getByAltText('edtech app');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/images/service/service-1.png');
  });

  it('should render features section with proper styling', () => {
    const { container } = render(<ServiceDetailPage service={mockService} />);

    const featuresSection = container.querySelectorAll('section')[1];
    expect(featuresSection.className).toContain('bg-inactive-background');
  });
});
