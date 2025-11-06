
## Authentication Flow (Simplified):

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer                            │
│  (Forms, Toasts, Redirects, Loading States)                │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   API Routes Layer                          │
│  - send-reset-password.ts (request reset)                  │
│  - reset-password.ts (verify token & update password)       │
│  - change-password.ts (authenticated password change)       │
│  - send-2fa-code.ts (credential verification)              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  Better Auth Layer                          │
│  - Token generation & storage (verification table)          │
│  - Password hashing (scrypt)                                │
│  - Email sending callbacks                                  │
│  - Account table updates                                    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   Database Layer                            │
│  - user table (profile info)                               │
│  - account table (credentials, providerId='credential')     │
│  - verification table (tokens, expiry)                      │
│  - session table (active sessions)                          │
└─────────────────────────────────────────────────────────────┘
```

## Token Lifecycle (Password Reset):

```
1. User requests reset
   └─> API: send-reset-password
       └─> Better Auth: requestPasswordReset()
           └─> Generates token
           └─> Stores in verification table
           └─> Triggers sendResetPassword callback
               └─> Sends email with URL + token

2. User clicks link
   └─> Client: /reset-password?token=xxx
       └─> User enters new password
           └─> API: reset-password
               └─> Better Auth: resetPassword({ token, newPassword })
                   └─> Verifies token from verification table
                   └─> Hashes password (scrypt)
                   └─> Updates account.password
                   └─> Deletes token from verification table
                   └─> Triggers onPasswordReset callback
                       └─> Sends confirmation email

3. Client receives success
   └─> Resets form
   └─> Shows success toast
   └─> Redirects to sign-in (2 seconds)
```

---


## Core Auth Configuration:
- `src/lib/better-auth.ts` 

## API Routes:
- `src/app/api/auth/[...all]/route.ts`- BetterAuth built in function
- `src/app/api/auth/change-password/route.ts` - Change password API route
- `src/app/api/auth/update-profile/route.ts` - Update user profile API route 
- `src/app/api/auth/send-verification/route.ts` - Send verification API route via email
- `src/app/api/auth/reset-password/route.ts` - Reset password API route via email
- `src/app/api/auth/send-reset-password/route.ts` - Forgot Password API route via email
- `src/app/api/auth/send-2fa-code/route.ts` - Send 2FA code API route via email
- `src/app/api/auth/verified-2fa-code/route.ts` - Verified 2FA code API route via email 
- `src/app/api/auth/send-2fa-sms/route.ts` - Send 2FA code API via SMS
- 
## Components:
- `src/components/form/ResetPasswordForm/index.tsx` 
- `src/components/pages/SignUpPageContent/index.tsx` 
- `src/components/pages/SignInPageContent/index.tsx` 

## Database:
- `src/lib/db/schema.ts` - Neon Postgres

---

