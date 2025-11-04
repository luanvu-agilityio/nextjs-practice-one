import { render, screen, waitFor } from '@testing-library/react';
import { LazySection } from '../index';

// Mock IntersectionObserver
const mockIntersectionObserver = jest.fn();
const mockObserve = jest.fn();
const mockDisconnect = jest.fn();

describe('LazySection', () => {
  beforeEach(() => {
    mockIntersectionObserver.mockImplementation(() => ({
      observe: mockObserve,
      disconnect: mockDisconnect,
      unobserve: jest.fn(),
      takeRecords: jest.fn(),
      root: null,
      rootMargin: '',
      thresholds: [],
    }));

    globalThis.IntersectionObserver =
      mockIntersectionObserver as jest.MockedClass<typeof IntersectionObserver>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render children correctly', () => {
    render(
      <LazySection>
        <div data-testid='child-content'>Test Content</div>
      </LazySection>
    );

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should render title and subtitle when provided', () => {
    render(
      <LazySection title='Test Title' subtitle='Test Subtitle'>
        <div>Content</div>
      </LazySection>
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
  });

  it('should not render title/subtitle section when not provided', () => {
    const { container } = render(
      <LazySection>
        <div>Content</div>
      </LazySection>
    );

    const headingElements = container.querySelectorAll('h2');
    expect(headingElements.length).toBe(0);
  });

  it('should apply custom className to section', () => {
    const { container } = render(
      <LazySection className='custom-class'>
        <div>Content</div>
      </LazySection>
    );

    const section = container.querySelector('section');
    expect(section).toHaveClass('custom-class');
  });

  it('should apply custom containerClassName to inner container', () => {
    const { container } = render(
      <LazySection containerClassName='custom-container-class'>
        <div>Content</div>
      </LazySection>
    );

    const innerDiv = container.querySelector(String.raw`.max-w-\[1296px\]`);
    expect(innerDiv).toHaveClass('custom-container-class');
  });

  it('should apply centered styling when centered prop is true', () => {
    const { container } = render(
      <LazySection title='Test' centered>
        <div>Content</div>
      </LazySection>
    );

    const headerDiv = container.querySelector('.text-center');
    expect(headerDiv).toBeInTheDocument();
  });

  it('should not initialize IntersectionObserver when bgImageUrl is not provided', () => {
    render(
      <LazySection>
        <div>Content</div>
      </LazySection>
    );

    expect(mockIntersectionObserver).not.toHaveBeenCalled();
    expect(mockObserve).not.toHaveBeenCalled();
  });

  it('should initialize IntersectionObserver when bgImageUrl is provided', () => {
    render(
      <LazySection bgImageUrl='/test-image.jpg'>
        <div>Content</div>
      </LazySection>
    );

    expect(mockIntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      { threshold: 0.1 }
    );
    expect(mockObserve).toHaveBeenCalled();
  });

  it('should apply background image when element intersects', async () => {
    let intersectionCallback: IntersectionObserverCallback = () => {};

    mockIntersectionObserver.mockImplementation(callback => {
      intersectionCallback = callback;
      return {
        observe: mockObserve,
        disconnect: mockDisconnect,
        unobserve: jest.fn(),
        takeRecords: jest.fn(),
        root: null,
        rootMargin: '',
        thresholds: [],
      };
    });

    const { container } = render(
      <LazySection bgImageUrl='/test-bg.jpg'>
        <div>Content</div>
      </LazySection>
    );

    const section = container.querySelector('section');

    // Simulate intersection
    const mockEntry: Partial<IntersectionObserverEntry> = {
      isIntersecting: true,
      target: section as Element,
    };

    intersectionCallback(
      [mockEntry as IntersectionObserverEntry],
      {} as IntersectionObserver
    );

    await waitFor(() => {
      expect(section).toHaveStyle({ backgroundImage: "url('/test-bg.jpg')" });
    });

    expect(mockDisconnect).toHaveBeenCalled();
  });

  it('should not apply background image when element does not intersect', () => {
    let intersectionCallback: IntersectionObserverCallback = () => {};

    mockIntersectionObserver.mockImplementation(callback => {
      intersectionCallback = callback;
      return {
        observe: mockObserve,
        disconnect: mockDisconnect,
        unobserve: jest.fn(),
        takeRecords: jest.fn(),
        root: null,
        rootMargin: '',
        thresholds: [],
      };
    });

    const { container } = render(
      <LazySection bgImageUrl='/test-bg.jpg'>
        <div>Content</div>
      </LazySection>
    );

    const section = container.querySelector('section');

    // Simulate non-intersection
    const mockEntry: Partial<IntersectionObserverEntry> = {
      isIntersecting: false,
      target: section as Element,
    };

    intersectionCallback(
      [mockEntry as IntersectionObserverEntry],
      {} as IntersectionObserver
    );

    expect(section).not.toHaveStyle({ backgroundImage: "url('/test-bg.jpg')" });
    expect(mockDisconnect).not.toHaveBeenCalled();
  });

  it('should disconnect observer on unmount', () => {
    const { unmount } = render(
      <LazySection bgImageUrl='/test-bg.jpg'>
        <div>Content</div>
      </LazySection>
    );

    unmount();

    expect(mockDisconnect).toHaveBeenCalled();
  });

  it('should apply background size, repeat, and position styles when bgImageUrl provided', () => {
    const { container } = render(
      <LazySection bgImageUrl='/test-bg.jpg'>
        <div>Content</div>
      </LazySection>
    );

    const section = container.querySelector('section');
    expect(section).toHaveStyle({
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
    });
  });

  it('should match snapshot with all props', () => {
    const { container } = render(
      <LazySection
        title='Full Props Test'
        subtitle='This is a subtitle'
        className='custom-section'
        containerClassName='custom-container'
        centered
        bgImageUrl='/bg-image.jpg'
        style={{ padding: '20px' }}
      >
        <div>Child content</div>
      </LazySection>
    );

    expect(container).toMatchSnapshot();
  });

  it('should match snapshot with minimal props', () => {
    const { container } = render(
      <LazySection>
        <div>Minimal content</div>
      </LazySection>
    );

    expect(container).toMatchSnapshot();
  });
});
