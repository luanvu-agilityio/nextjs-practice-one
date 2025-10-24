import { render } from '@testing-library/react';
import { Section } from '../index';

describe('Section', () => {
  it('matches snapshot', () => {
    const { container } = render(
      <Section title='Test Title' subtitle='Test Subtitle'>
        <div>Content</div>
      </Section>
    );
    expect(container).toMatchSnapshot();
  });

  it('renders without title and subtitle', () => {
    const { container } = render(
      <Section>
        <div>Content only</div>
      </Section>
    );
    expect(container.querySelector('section')).toBeInTheDocument();
  });

  it('applies centered class when centered prop is true', () => {
    const { container } = render(
      <Section title='Title' centered>
        <div>Content</div>
      </Section>
    );
    expect(container.querySelector('.text-center')).toBeInTheDocument();
  });
});
