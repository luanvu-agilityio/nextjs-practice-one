import { z } from 'zod';
import { VALIDATION_MESSAGES } from '@/constants/messages';

export const signInSchema = z.object({
  email: z
    .string()
    .nonempty(VALIDATION_MESSAGES.EMAIL_REQUIRED)
    .email(VALIDATION_MESSAGES.EMAIL_INVALID),
  password: z
    .string()
    .nonempty(VALIDATION_MESSAGES.PASSWORD_REQUIRED)
    .min(8, VALIDATION_MESSAGES.PASSWORD_MIN_LENGTH),
});

export const signUpSchema = z.object({
  name: z
    .string()
    .min(2, VALIDATION_MESSAGES.NAME_MIN)
    .max(50, VALIDATION_MESSAGES.NAME_MAX),
  email: z
    .string()
    .min(1, VALIDATION_MESSAGES.EMAIL_REQUIRED)
    .email(VALIDATION_MESSAGES.EMAIL_INVALID),
  password: z
    .string()
    .min(6, VALIDATION_MESSAGES.NEW_PASSWORD_MIN)
    .max(100, VALIDATION_MESSAGES.PASSWORD_MAX)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      VALIDATION_MESSAGES.PASSWORD_REGEX
    ),
});

export const joinUsSchema = z.object({
  firstName: z.string().min(2, VALIDATION_MESSAGES.FIRST_NAME_MIN),
  lastName: z.string().min(2, VALIDATION_MESSAGES.LAST_NAME_MIN),
  email: z.string().email(VALIDATION_MESSAGES.EMAIL_INVALID),
  password: z.string().min(6, VALIDATION_MESSAGES.NEW_PASSWORD_MIN),
  agreeTerms: z.boolean().refine(val => val === true, {
    message: VALIDATION_MESSAGES.AGREE_TERMS_REQUIRED,
  }),
});
export const contactSchema = z.object({
  name: z.string().min(2, VALIDATION_MESSAGES.NAME_MIN),
  email: z.string().email(VALIDATION_MESSAGES.EMAIL_INVALID),
  projectName: z.string().min(2, VALIDATION_MESSAGES.PROJECT_NAME_REQUIRED),
  projectType: z.string().min(1, VALIDATION_MESSAGES.PROJECT_TYPE_REQUIRED),
  message: z.string().min(10, VALIDATION_MESSAGES.MESSAGE_MIN_LENGTH),
});

export const editProfileSchema = z.object({
  firstName: z.string().min(2, VALIDATION_MESSAGES.FIRST_NAME_MIN).optional(),
  lastName: z.string().min(2, VALIDATION_MESSAGES.LAST_NAME_MIN).optional(),
  email: z.string().email(VALIDATION_MESSAGES.EMAIL_INVALID),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, VALIDATION_MESSAGES.CURRENT_PASSWORD_REQUIRED),
    newPassword: z.string().min(6, VALIDATION_MESSAGES.NEW_PASSWORD_MIN),
    confirmPassword: z
      .string()
      .min(1, VALIDATION_MESSAGES.CONFIRM_PASSWORD_REQUIRED),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: VALIDATION_MESSAGES.PASSWORDS_DONT_MATCH,
    path: ['confirmPassword'],
  });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type EditProfileFormData = z.infer<typeof editProfileSchema>;
export type ContactFormData = z.infer<typeof contactSchema>;
export type JoinUsFormData = z.infer<typeof joinUsSchema>;
export type SignInFormValues = z.infer<typeof signInSchema>;
export type SignUpFormValues = z.infer<typeof signUpSchema>;
