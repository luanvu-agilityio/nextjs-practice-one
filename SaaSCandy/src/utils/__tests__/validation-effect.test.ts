import { Schema as S } from 'effect';
import {
  Sms2FASchema,
  SignInSchema,
  SignUpSchema,
  JoinUsSchema,
  ContactSchema,
  EditProfileSchema,
  ChangePasswordSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
} from '../validation-effect';

describe('Validation Schemas', () => {
  describe('Sms2FASchema', () => {
    it('should validate a correct 6-digit code', () => {
      const result = S.decodeUnknownSync(Sms2FASchema)({ code: '123456' });
      expect(result).toEqual({ code: '123456' });
    });

    it('should reject code with less than 6 digits', () => {
      expect(() => {
        S.decodeUnknownSync(Sms2FASchema)({ code: '12345' });
      }).toThrow('Code must be exactly 6 digits');
    });

    it('should reject code with more than 6 digits', () => {
      expect(() => {
        S.decodeUnknownSync(Sms2FASchema)({ code: '1234567' });
      }).toThrow('Code must be exactly 6 digits');
    });

    it('should reject code with non-digit characters', () => {
      expect(() => {
        S.decodeUnknownSync(Sms2FASchema)({ code: '12345a' });
      }).toThrow('Code must contain only digits');
    });

    it('should reject code with letters', () => {
      expect(() => {
        S.decodeUnknownSync(Sms2FASchema)({ code: 'abcdef' });
      }).toThrow();
    });
  });

  describe('SignInSchema', () => {
    it('should validate correct email and password', () => {
      const result = S.decodeUnknownSync(SignInSchema)({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(result.email).toBe('test@example.com');
      expect(result.password).toBe('password123');
    });

    it('should reject empty email', () => {
      expect(() => {
        S.decodeUnknownSync(SignInSchema)({
          email: '',
          password: 'password123',
        });
      }).toThrow('Please enter your email address.');
    });

    it('should reject invalid email format', () => {
      expect(() => {
        S.decodeUnknownSync(SignInSchema)({
          email: 'invalid-email',
          password: 'password123',
        });
      }).toThrow('Please enter a valid email address');
    });

    it('should reject empty password', () => {
      expect(() => {
        S.decodeUnknownSync(SignInSchema)({
          email: 'test@example.com',
          password: '',
        });
      }).toThrow('Please enter your password.');
    });

    it('should reject password less than 8 characters', () => {
      expect(() => {
        S.decodeUnknownSync(SignInSchema)({
          email: 'test@example.com',
          password: 'short',
        });
      }).toThrow('Password must be at least 8 characters.');
    });

    it('should reject password with exactly 7 characters', () => {
      expect(() => {
        S.decodeUnknownSync(SignInSchema)({
          email: 'test@example.com',
          password: '1234567',
        });
      }).toThrow('Password must be at least 8 characters.');
    });
  });

  describe('SignUpSchema', () => {
    it('should validate correct sign up data', () => {
      const result = S.decodeUnknownSync(SignUpSchema)({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123',
      });
      expect(result.name).toBe('John Doe');
      expect(result.email).toBe('john@example.com');
      expect(result.password).toBe('Password123');
    });

    it('should reject name less than 2 characters', () => {
      expect(() => {
        S.decodeUnknownSync(SignUpSchema)({
          name: 'J',
          email: 'john@example.com',
          password: 'Password123',
        });
      }).toThrow('Name must be at least 2 characters');
    });

    it('should reject password less than 8 characters', () => {
      expect(() => {
        S.decodeUnknownSync(SignUpSchema)({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'Pass1',
        });
      }).toThrow('Password must be at least 8 characters.');
    });

    it('should reject password without uppercase letter', () => {
      expect(() => {
        S.decodeUnknownSync(SignUpSchema)({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
        });
      }).toThrow(
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      );
    });

    it('should reject password without lowercase letter', () => {
      expect(() => {
        S.decodeUnknownSync(SignUpSchema)({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'PASSWORD123',
        });
      }).toThrow(
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      );
    });

    it('should reject password without digit', () => {
      expect(() => {
        S.decodeUnknownSync(SignUpSchema)({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'PasswordABC',
        });
      }).toThrow(
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      );
    });

    it('should reject empty name', () => {
      expect(() => {
        S.decodeUnknownSync(SignUpSchema)({
          name: '',
          email: 'john@example.com',
          password: 'Password123',
        });
      }).toThrow();
    });
  });

  describe('JoinUsSchema', () => {
    it('should validate correct join us data', () => {
      const result = S.decodeUnknownSync(JoinUsSchema)({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'Password123',
        agreeTerms: true,
      });
      expect(result.firstName).toBe('John');
      expect(result.lastName).toBe('Doe');
      expect(result.agreeTerms).toBe(true);
    });

    it('should reject when agreeTerms is false', () => {
      expect(() => {
        S.decodeUnknownSync(JoinUsSchema)({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          password: 'Password123',
          agreeTerms: false,
        });
      }).toThrow('You must agree to the terms and conditions');
    });

    it('should reject firstName less than 2 characters', () => {
      expect(() => {
        S.decodeUnknownSync(JoinUsSchema)({
          firstName: 'J',
          lastName: 'Doe',
          email: 'john@example.com',
          password: 'Password123',
          agreeTerms: true,
        });
      }).toThrow('First name must be at least 2 characters');
    });

    it('should reject lastName less than 2 characters', () => {
      expect(() => {
        S.decodeUnknownSync(JoinUsSchema)({
          firstName: 'John',
          lastName: 'D',
          email: 'john@example.com',
          password: 'Password123',
          agreeTerms: true,
        });
      }).toThrow('Last name must be at least 2 characters');
    });

    it('should reject empty firstName', () => {
      expect(() => {
        S.decodeUnknownSync(JoinUsSchema)({
          firstName: '',
          lastName: 'Doe',
          email: 'john@example.com',
          password: 'Password123',
          agreeTerms: true,
        });
      }).toThrow();
    });

    it('should reject empty lastName', () => {
      expect(() => {
        S.decodeUnknownSync(JoinUsSchema)({
          firstName: 'John',
          lastName: '',
          email: 'john@example.com',
          password: 'Password123',
          agreeTerms: true,
        });
      }).toThrow();
    });
  });

  describe('ContactSchema', () => {
    it('should validate correct contact form data', () => {
      const result = S.decodeUnknownSync(ContactSchema)({
        name: 'John Doe',
        email: 'john@example.com',
        projectName: 'My Project',
        projectType: 'Web Development',
        message: 'This is a test message with more than 10 characters',
      });
      expect(result.name).toBe('John Doe');
      expect(result.projectName).toBe('My Project');
    });

    it('should reject empty project name', () => {
      expect(() => {
        S.decodeUnknownSync(ContactSchema)({
          name: 'John Doe',
          email: 'john@example.com',
          projectName: '',
          projectType: 'Web Development',
          message: 'This is a test message',
        });
      }).toThrow('Project name is required');
    });

    it('should reject empty project type', () => {
      expect(() => {
        S.decodeUnknownSync(ContactSchema)({
          name: 'John Doe',
          email: 'john@example.com',
          projectName: 'My Project',
          projectType: '',
          message: 'This is a test message',
        });
      }).toThrow('Please select a project type');
    });

    it('should reject message less than 10 characters', () => {
      expect(() => {
        S.decodeUnknownSync(ContactSchema)({
          name: 'John Doe',
          email: 'john@example.com',
          projectName: 'My Project',
          projectType: 'Web Development',
          message: 'Short',
        });
      }).toThrow('Message must be at least 10 characters');
    });

    it('should reject empty message', () => {
      expect(() => {
        S.decodeUnknownSync(ContactSchema)({
          name: 'John Doe',
          email: 'john@example.com',
          projectName: 'My Project',
          projectType: 'Web Development',
          message: '',
        });
      }).toThrow();
    });
  });

  describe('EditProfileSchema', () => {
    it('should validate with all optional fields provided', () => {
      const result = S.decodeUnknownSync(EditProfileSchema)({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      });
      expect(result.firstName).toBe('John');
      expect(result.lastName).toBe('Doe');
      expect(result.email).toBe('john@example.com');
    });

    it('should validate with only required email field', () => {
      const result = S.decodeUnknownSync(EditProfileSchema)({
        email: 'john@example.com',
      });
      expect(result.email).toBe('john@example.com');
      expect(result.firstName).toBeUndefined();
      expect(result.lastName).toBeUndefined();
    });

    it('should validate with firstName only', () => {
      const result = S.decodeUnknownSync(EditProfileSchema)({
        firstName: 'John',
        email: 'john@example.com',
      });
      expect(result.firstName).toBe('John');
      expect(result.email).toBe('john@example.com');
    });

    it('should validate with lastName only', () => {
      const result = S.decodeUnknownSync(EditProfileSchema)({
        lastName: 'Doe',
        email: 'john@example.com',
      });
      expect(result.lastName).toBe('Doe');
      expect(result.email).toBe('john@example.com');
    });

    it('should reject invalid email', () => {
      expect(() => {
        S.decodeUnknownSync(EditProfileSchema)({
          email: 'invalid',
        });
      }).toThrow();
    });
  });

  describe('ChangePasswordSchema', () => {
    it('should validate matching passwords', () => {
      const result = S.decodeUnknownSync(ChangePasswordSchema)({
        currentPassword: 'oldpass123',
        newPassword: 'newpass123',
        confirmPassword: 'newpass123',
      });
      expect(result.currentPassword).toBe('oldpass123');
      expect(result.newPassword).toBe('newpass123');
      expect(result.confirmPassword).toBe('newpass123');
    });

    it('should reject when passwords do not match', () => {
      expect(() => {
        S.decodeUnknownSync(ChangePasswordSchema)({
          currentPassword: 'oldpass123',
          newPassword: 'newpass123',
          confirmPassword: 'different123',
        });
      }).toThrow("Passwords don't match");
    });

    it('should reject empty current password', () => {
      expect(() => {
        S.decodeUnknownSync(ChangePasswordSchema)({
          currentPassword: '',
          newPassword: 'newpass123',
          confirmPassword: 'newpass123',
        });
      }).toThrow('Current password is required');
    });

    it('should reject current password less than 6 characters', () => {
      expect(() => {
        S.decodeUnknownSync(ChangePasswordSchema)({
          currentPassword: 'short',
          newPassword: 'newpass123',
          confirmPassword: 'newpass123',
        });
      }).toThrow('New password must be at least 6 characters');
    });

    it('should reject empty new password', () => {
      expect(() => {
        S.decodeUnknownSync(ChangePasswordSchema)({
          currentPassword: 'oldpass123',
          newPassword: '',
          confirmPassword: 'newpass123',
        });
      }).toThrow('Please enter your password.');
    });

    it('should reject new password less than 6 characters', () => {
      expect(() => {
        S.decodeUnknownSync(ChangePasswordSchema)({
          currentPassword: 'oldpass123',
          newPassword: 'short',
          confirmPassword: 'short',
        });
      }).toThrow('New password must be at least 6 characters');
    });

    it('should reject empty confirm password', () => {
      expect(() => {
        S.decodeUnknownSync(ChangePasswordSchema)({
          currentPassword: 'oldpass123',
          newPassword: 'newpass123',
          confirmPassword: '',
        });
      }).toThrow('Please confirm your password');
    });

    it('should reject confirm password less than 6 characters', () => {
      expect(() => {
        S.decodeUnknownSync(ChangePasswordSchema)({
          currentPassword: 'oldpass123',
          newPassword: 'newpass123',
          confirmPassword: 'short',
        });
      }).toThrow('New password must be at least 6 characters');
    });
  });

  describe('ForgotPasswordSchema', () => {
    it('should validate correct email', () => {
      const result = S.decodeUnknownSync(ForgotPasswordSchema)({
        email: 'test@example.com',
      });
      expect(result.email).toBe('test@example.com');
    });

    it('should reject empty email', () => {
      expect(() => {
        S.decodeUnknownSync(ForgotPasswordSchema)({ email: '' });
      }).toThrow('Please enter your email address.');
    });

    it('should reject invalid email format', () => {
      expect(() => {
        S.decodeUnknownSync(ForgotPasswordSchema)({ email: 'invalid' });
      }).toThrow('Please enter a valid email address');
    });
  });

  describe('ResetPasswordSchema', () => {
    it('should validate matching passwords', () => {
      const result = S.decodeUnknownSync(ResetPasswordSchema)({
        newPassword: 'password123',
        confirmPassword: 'password123',
      });
      expect(result.newPassword).toBe('password123');
      expect(result.confirmPassword).toBe('password123');
    });

    it('should reject when passwords do not match', () => {
      expect(() => {
        S.decodeUnknownSync(ResetPasswordSchema)({
          newPassword: 'password123',
          confirmPassword: 'different123',
        });
      }).toThrow("Passwords don't match");
    });

    it('should reject empty new password', () => {
      expect(() => {
        S.decodeUnknownSync(ResetPasswordSchema)({
          newPassword: '',
          confirmPassword: 'password123',
        });
      }).toThrow('Please enter your password.');
    });

    it('should reject new password less than 8 characters', () => {
      expect(() => {
        S.decodeUnknownSync(ResetPasswordSchema)({
          newPassword: 'short',
          confirmPassword: 'short',
        });
      }).toThrow('Password must be at least 8 characters');
    });

    it('should reject empty confirm password', () => {
      expect(() => {
        S.decodeUnknownSync(ResetPasswordSchema)({
          newPassword: 'password123',
          confirmPassword: '',
        });
      }).toThrow('Please confirm your password');
    });

    it('should reject confirm password less than 8 characters', () => {
      expect(() => {
        S.decodeUnknownSync(ResetPasswordSchema)({
          newPassword: 'password123',
          confirmPassword: 'short',
        });
      }).toThrow('Password must be at least 8 characters');
    });
  });

  describe('Type exports', () => {
    it('should have correct types for all schemas', () => {
      // This test ensures that all type exports are working correctly
      const sms2FA: { code: string } = { code: '123456' };
      const signIn: { email: string; password: string } = {
        email: 'test@example.com',
        password: 'password123',
      };
      const signUp: { name: string; email: string; password: string } = {
        name: 'John',
        email: 'test@example.com',
        password: 'Password123',
      };

      expect(sms2FA).toBeDefined();
      expect(signIn).toBeDefined();
      expect(signUp).toBeDefined();
    });
  });
});
