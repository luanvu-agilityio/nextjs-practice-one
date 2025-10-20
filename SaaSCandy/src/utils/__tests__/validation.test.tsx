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
});
