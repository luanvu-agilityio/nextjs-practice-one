import { render } from '@testing-library/react';
import { Tags } from '../index';

describe('Tags Component', () => {
  const mockTags = ['javascript', 'react', 'typescript'];

  it('matches snapshot', () => {
    const { container } = render(<Tags tags={mockTags} />);
    expect(container).toMatchSnapshot();
  });

  it('renders all tags correctly', () => {
    const { getByText } = render(<Tags tags={mockTags} />);

    mockTags.forEach(tag => {
      expect(getByText(`- ${tag}`)).toBeInTheDocument();
    });
  });
});
