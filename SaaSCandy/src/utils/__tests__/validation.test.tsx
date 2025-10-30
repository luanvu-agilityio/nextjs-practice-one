import { z } from 'zod';
import {
  signInSchema,
  signUpSchema,
  changePasswordSchema,
} from '../validation';

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

  describe('sms2faSchema', () => {
    it('should validate correct 6-digit code', () => {
      const validData = { code: '123456' };
      expect(() =>
        require('../validation').sms2faSchema.parse(validData)
      ).not.toThrow();
    });
    it('should reject code with non-digits', () => {
      const invalidData = { code: '12a456' };
      expect(() =>
        require('../validation').sms2faSchema.parse(invalidData)
      ).toThrow(z.ZodError);
    });
    it('should reject code with wrong length', () => {
      const invalidData = { code: '12345' };
      expect(() =>
        require('../validation').sms2faSchema.parse(invalidData)
      ).toThrow(z.ZodError);
    });
  });

  describe('joinUsSchema', () => {
    it('should validate correct join us data', () => {
      const validData = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        password: 'Password123',
        agreeTerms: true,
      };
      expect(() =>
        require('../validation').joinUsSchema.parse(validData)
      ).not.toThrow();
    });
    it('should reject if terms not agreed', () => {
      const invalidData = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        password: 'Password123',
        agreeTerms: false,
      };
      expect(() =>
        require('../validation').joinUsSchema.parse(invalidData)
      ).toThrow(z.ZodError);
    });
  });

  describe('contactSchema', () => {
    it('should validate correct contact data', () => {
      const validData = {
        name: 'Jane',
        email: 'jane@example.com',
        projectName: 'My Project',
        projectType: 'Web',
        message: 'This is a valid message.',
      };
      expect(() =>
        require('../validation').contactSchema.parse(validData)
      ).not.toThrow();
    });
    it('should reject short message', () => {
      const invalidData = {
        name: 'Jane',
        email: 'jane@example.com',
        projectName: 'My Project',
        projectType: 'Web',
        message: 'short',
      };
      expect(() =>
        require('../validation').contactSchema.parse(invalidData)
      ).toThrow(z.ZodError);
    });
  });

  describe('editProfileSchema', () => {
    it('should validate correct profile data', () => {
      const validData = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
      };
      expect(() =>
        require('../validation').editProfileSchema.parse(validData)
      ).not.toThrow();
    });
    it('should validate with optional names', () => {
      const validData = {
        email: 'jane@example.com',
      };
      expect(() =>
        require('../validation').editProfileSchema.parse(validData)
      ).not.toThrow();
    });
    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid',
      };
      expect(() =>
        require('../validation').editProfileSchema.parse(invalidData)
      ).toThrow(z.ZodError);
    });
  });

  describe('forgotPasswordSchema', () => {
    it('should validate correct email', () => {
      const validData = { email: 'jane@example.com' };
      expect(() =>
        require('../validation').forgotPasswordSchema.parse(validData)
      ).not.toThrow();
    });
    it('should reject empty email', () => {
      const invalidData = { email: '' };
      expect(() =>
        require('../validation').forgotPasswordSchema.parse(invalidData)
      ).toThrow(z.ZodError);
    });
  });

  describe('resetPasswordSchema', () => {
    it('should validate matching passwords', () => {
      const validData = {
        newPassword: 'Password123',
        confirmPassword: 'Password123',
      };
      expect(() =>
        require('../validation').resetPasswordSchema.parse(validData)
      ).not.toThrow();
    });
    it('should reject non-matching passwords', () => {
      const invalidData = {
        newPassword: 'Password123',
        confirmPassword: 'Password321',
      };
      expect(() =>
        require('../validation').resetPasswordSchema.parse(invalidData)
      ).toThrow(z.ZodError);
    });
    it('should reject short password', () => {
      const invalidData = {
        newPassword: 'short',
        confirmPassword: 'short',
      };
      expect(() =>
        require('../validation').resetPasswordSchema.parse(invalidData)
      ).toThrow(z.ZodError);
    });
  });
});
