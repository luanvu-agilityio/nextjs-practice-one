import { generateBreadcrumbs } from '../breadcrumb';

// Mock auth-client
jest.mock('@/lib/auth-client', () => ({
  signIn: {
    social: jest.fn(),
  },
}));

describe('breadcrumb.ts', () => {
  describe('generateBreadcrumbs', () => {
    it('should generate breadcrumbs for root path', () => {
      const result = generateBreadcrumbs('/');
      expect(result).toEqual([{ label: 'Home', href: '/' }]);
    });

    it('should generate breadcrumbs for nested path', () => {
      const result = generateBreadcrumbs('/products/electronics');
      expect(result).toEqual([
        { label: 'Home', href: '/' },
        { label: 'Products', href: '/products', isActive: false },
        { label: 'Electronics', href: undefined, isActive: true },
      ]);
    });

    it('should handle single segment path', () => {
      const result = generateBreadcrumbs('/about');
      expect(result).toEqual([
        { label: 'Home', href: '/' },
        { label: 'About', href: undefined, isActive: true },
      ]);
    });
  });
});
