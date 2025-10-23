import { extractBreadcrumbs, generateBreadcrumbs } from '../breadcrumb';
import { handleSocialAuth } from '../social-auth';

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

describe('auth.ts', () => {
  describe('extractBreadcrumbs', () => {
    it('should extract and format auth-related breadcrumbs', () => {
      const result = extractBreadcrumbs('/auth/signin');
      expect(result[1].label).toBe('Auth');
    });

    it('should handle account paths', () => {
      const result = extractBreadcrumbs('/account/settings');
      expect(result[1].label).toBe('Account');
    });
  });

  describe('handleSocialAuth', () => {
    beforeEach(() => {
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      (console.error as jest.Mock).mockRestore();
    });

    it('should call signIn.social with correct params', async () => {
      const { signIn } = await import('@/lib/auth-client');
      const mockSocial = signIn.social as jest.Mock;

      await handleSocialAuth('Google', 'signin');

      expect(mockSocial).toHaveBeenCalledWith({
        provider: 'google',
        callbackURL: '/',
      });
    });

    it('should throw error on failure', async () => {
      const { signIn } = await import('@/lib/auth-client');
      const mockSocial = signIn.social as jest.Mock;
      mockSocial.mockRejectedValueOnce(new Error('Auth failed'));

      await expect(handleSocialAuth('Google', 'signin')).rejects.toThrow(
        'Auth failed'
      );
    });
  });
});
