import { Schema as S } from 'effect';
import { VALIDATION_MESSAGES } from '@/constants/messages';

/**
 * Email field validator
 * Validates: non-empty string matching email pattern
 */
const EmailField = S.String.pipe(
  S.nonEmptyString({
    message: () => VALIDATION_MESSAGES.EMAIL_REQUIRED,
  }),
  S.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, {
    message: () => VALIDATION_MESSAGES.EMAIL_INVALID,
  })
);

/**
 * Password field validator (minimum 8 characters)
 * Used for sign-in, sign-up, and password reset
 */
const PasswordField = S.String.pipe(
  S.nonEmptyString({
    message: () => VALIDATION_MESSAGES.PASSWORD_REQUIRED,
  }),
  S.minLength(8, {
    message: () => VALIDATION_MESSAGES.PASSWORD_MIN_LENGTH,
  })
);

/**
 * Strong password field validator
 * Validates: min 8 chars + uppercase + lowercase + digit
 */
const StrongPasswordField = S.String.pipe(
  S.nonEmptyString({
    message: () => VALIDATION_MESSAGES.PASSWORD_REQUIRED,
  }),
  S.minLength(8, {
    message: () => VALIDATION_MESSAGES.PASSWORD_MIN_LENGTH,
  }),
  S.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: () => VALIDATION_MESSAGES.PASSWORD_REGEX,
  })
);

/**
 * Name field validator (minimum 2 characters)
 */
const NameField = S.String.pipe(
  S.nonEmptyString(),
  S.minLength(2, {
    message: () => VALIDATION_MESSAGES.NAME_MIN,
  })
);

/**
 * 1. SMS 2FA Schema
 * Validates 6-digit verification code
 */
export const Sms2FASchema = S.Struct({
  code: S.String.pipe(
    S.length(6, {
      message: () => 'Code must be exactly 6 digits',
    }),
    S.pattern(/^\d{6}$/, {
      message: () => 'Code must contain only digits',
    })
  ),
});

/**
 * 2. Sign In Schema
 * Validates email and password for user authentication
 */
export const SignInSchema = S.Struct({
  email: EmailField,
  password: PasswordField,
});

/**
 * 3. Sign Up Schema
 * Validates name, email, and strong password for new user registration
 */
export const SignUpSchema = S.Struct({
  name: NameField,
  email: EmailField,
  password: StrongPasswordField,
});

/**
 * 4. Join Us Schema
 * Validates first name, last name, email, password, and terms agreement
 */
export const JoinUsSchema = S.Struct({
  firstName: S.String.pipe(
    S.nonEmptyString(),
    S.minLength(2, {
      message: () => VALIDATION_MESSAGES.FIRST_NAME_MIN,
    })
  ),
  lastName: S.String.pipe(
    S.nonEmptyString(),
    S.minLength(2, {
      message: () => VALIDATION_MESSAGES.LAST_NAME_MIN,
    })
  ),
  email: EmailField,
  password: StrongPasswordField,
  agreeTerms: S.Boolean,
}).pipe(
  S.filter(data => data.agreeTerms === true, {
    message: () => VALIDATION_MESSAGES.AGREE_TERMS_REQUIRED,
  })
);

/**
 * 5. Contact Schema
 * Validates contact form: name, email, project details, and message
 */
export const ContactSchema = S.Struct({
  name: NameField,
  email: EmailField,
  projectName: S.String.pipe(
    S.nonEmptyString({
      message: () => VALIDATION_MESSAGES.PROJECT_NAME_REQUIRED,
    })
  ),
  projectType: S.String.pipe(
    S.nonEmptyString({
      message: () => VALIDATION_MESSAGES.PROJECT_TYPE_REQUIRED,
    })
  ),
  message: S.String.pipe(
    S.nonEmptyString(),
    S.minLength(10, {
      message: () => VALIDATION_MESSAGES.MESSAGE_MIN_LENGTH,
    })
  ),
});

/**
 * 6. Edit Profile Schema
 * Validates optional first/last name and required email
 */
export const EditProfileSchema = S.Struct({
  firstName: S.optional(S.String),
  lastName: S.optional(S.String),
  email: EmailField,
});

/**
 * 7. Change Password Schema
 * Validates current password, new password, and confirmation
 * Includes cross-field validation for password matching
 */
export const ChangePasswordSchema = S.Struct({
  currentPassword: S.String.pipe(
    S.nonEmptyString({
      message: () => VALIDATION_MESSAGES.CURRENT_PASSWORD_REQUIRED,
    }),
    S.minLength(6, {
      message: () => VALIDATION_MESSAGES.NEW_PASSWORD_MIN,
    })
  ),
  newPassword: S.String.pipe(
    S.nonEmptyString({
      message: () => VALIDATION_MESSAGES.PASSWORD_REQUIRED,
    }),
    S.minLength(6, {
      message: () => VALIDATION_MESSAGES.NEW_PASSWORD_MIN,
    })
  ),
  confirmPassword: S.String.pipe(
    S.nonEmptyString({
      message: () => VALIDATION_MESSAGES.CONFIRM_PASSWORD_REQUIRED,
    }),
    S.minLength(6, {
      message: () => VALIDATION_MESSAGES.NEW_PASSWORD_MIN,
    })
  ),
}).pipe(
  S.filter(
    (
      data
    ): data is typeof data & { newPassword: string; confirmPassword: string } =>
      data.newPassword === data.confirmPassword,
    {
      message: () => VALIDATION_MESSAGES.PASSWORDS_DONT_MATCH,
    }
  )
);

/**
 * 8. Forgot Password Schema
 * Validates email for password reset request
 */
export const ForgotPasswordSchema = S.Struct({
  email: EmailField,
});

/**
 * 9. Reset Password Schema
 * Validates new password and confirmation
 * Includes cross-field validation for password matching
 */
export const ResetPasswordSchema = S.Struct({
  newPassword: PasswordField,
  confirmPassword: S.String.pipe(
    S.nonEmptyString({
      message: () => VALIDATION_MESSAGES.CONFIRM_PASSWORD_REQUIRED,
    }),
    S.minLength(8, {
      message: () => VALIDATION_MESSAGES.PASSWORD_MIN_LENGTH,
    })
  ),
}).pipe(
  S.filter(
    (
      data
    ): data is typeof data & { newPassword: string; confirmPassword: string } =>
      data.newPassword === data.confirmPassword,
    {
      message: () => VALIDATION_MESSAGES.PASSWORDS_DONT_MATCH,
    }
  )
);

/**
 * Type exports for form data
 * Use these types with react-hook-form's useForm<T>
 */
export type Sms2FAFormData = S.Schema.Type<typeof Sms2FASchema>;
export type SignInFormData = S.Schema.Type<typeof SignInSchema>;
export type SignUpFormData = S.Schema.Type<typeof SignUpSchema>;
export type JoinUsFormData = S.Schema.Type<typeof JoinUsSchema>;
export type ContactFormData = S.Schema.Type<typeof ContactSchema>;
export type EditProfileFormData = S.Schema.Type<typeof EditProfileSchema>;
export type ChangePasswordFormData = S.Schema.Type<typeof ChangePasswordSchema>;
export type ForgotPasswordFormData = S.Schema.Type<typeof ForgotPasswordSchema>;
export type ResetPasswordFormData = S.Schema.Type<typeof ResetPasswordSchema>;
