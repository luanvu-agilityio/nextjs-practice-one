import { z } from 'zod';
import {
  signInSchema,
  signUpSchema,
  changePasswordSchema,
} from '../validation';
import { generateBreadcrumbs } from '../breadcrumb';
import { extractBreadcrumbs, handleSocialAuth } from '../auth';

// Mock auth-client
jest.mock('@/lib/auth-client', () => ({
  signIn: {
    social: jest.fn(),
  },
}));

describe('validation.ts', () => {
  describe('signInSchema', () => {
    it('should validate correct sign in data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
      };
      expect(() => signInSchema.parse(validData)).not.toThrow();
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123',
      };
      expect(() => signInSchema.parse(invalidData)).toThrow(z.ZodError);
    });
  });

  describe('signUpSchema', () => {
    it('should validate correct sign up data', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123',
      };
      expect(() => signUpSchema.parse(validData)).not.toThrow();
    });

    it('should reject weak password', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'weak',
      };
      expect(() => signUpSchema.parse(invalidData)).toThrow(z.ZodError);
    });
  });

  describe('changePasswordSchema', () => {
    it('should validate matching passwords', () => {
      const validData = {
        currentPassword: 'oldPass123',
        newPassword: 'newPass123',
        confirmPassword: 'newPass123',
      };
      expect(() => changePasswordSchema.parse(validData)).not.toThrow();
    });

    it('should reject mismatched passwords', () => {
      const invalidData = {
        currentPassword: 'oldPass123',
        newPassword: 'newPass123',
        confirmPassword: 'differentPass',
      };
      expect(() => changePasswordSchema.parse(invalidData)).toThrow(z.ZodError);
    });
  });
});

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
