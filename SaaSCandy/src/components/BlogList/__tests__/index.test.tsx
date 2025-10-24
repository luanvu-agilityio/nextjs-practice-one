import { render, screen } from '@testing-library/react';
import { BlogList } from '../index';

// Mock getAllPosts to return a promise
jest.mock('@/helpers', () => ({
  getAllPosts: jest.fn(() =>
    Promise.resolve([
      { slug: 'one', title: 'First', date: '2024-01-01' },
      { slug: 'two', title: 'Second', date: '2024-01-02' },
    ])
  ),
}));

jest.mock('../../BlogCard', () => ({
  BlogCard: (props: { slug: string; title: string; date: string }) => (
    <div data-testid='blog-card'>{props.title}</div>
  ),
}));

describe('BlogList', () => {
  it('renders blog cards for posts', async () => {
    // Await the async component
    const component = await BlogList();

    // Render the resolved component
    render(component);

    const cards = screen.getAllByTestId('blog-card');
    expect(cards).toHaveLength(2);
    expect(cards[0]).toHaveTextContent('First');
    expect(cards[1]).toHaveTextContent('Second');
  });

  it('passes correct props to BlogCard', async () => {
    const component = await BlogList();
    render(component);

    const cards = screen.getAllByTestId('blog-card');
    expect(cards[0]).toHaveTextContent('First');
    expect(cards[1]).toHaveTextContent('Second');
  });
});
