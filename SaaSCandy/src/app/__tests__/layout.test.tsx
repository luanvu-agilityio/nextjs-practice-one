import { render } from '@testing-library/react';
import RootLayout, * as LayoutModule from '../layout';

describe('RootLayout', () => {
  it('renders children inside RootLayoutClient', () => {
    const { getByText } = render(
      <RootLayout>
        <div>Test Child</div>
      </RootLayout>
    );
    expect(getByText('Test Child')).toBeInTheDocument();
  });

  it('exports metadata', () => {
    expect(LayoutModule.metadata).toBeDefined();
  });

  it('exports viewport', () => {
    expect(LayoutModule.viewport).toBeDefined();
  });
});
