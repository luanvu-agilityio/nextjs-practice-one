# Auth Token / Session / Cookie Lifecycle (per-route)

This document describes where tokens, cookies, and sessions are created, rotated, changed, and destroyed across the app's primary auth-related API routes. 
Notes:
- Better Auth is responsible for issuing sessions and refresh tokens and may set HttpOnly cookies on responses.
- "Refresh cookie" refers to the HttpOnly persistent refresh token (e.g., `saascandy_refresh`).
- "Session" means the short-lived server session object accessible via `auth.api.getSession()`.

---

## LOGIN (password ± 2FA)

┌─────────────────────────────────────────────────────────────┐
│                      CLIENT: signIn.email                   │
│                   (email + password [+ 2FA])                │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                SERVER / Better Auth validates               │
│ 1. Validate credentials                                     │
│    ├─ invalid -> return 401                                 │
│    └─ valid -> continue                                     │
│ 2. If 2FA required -> emit code & wait for verification     │
│ 3. On final success:                                        │
│    - Create short-lived session (server) ← CREATED          │
│    - Issue or rotate refresh token -> Set HttpOnly cookie   │
│      (Refresh cookie CREATED or ROTATED)                    │
│    - Return user + optional token metadata in response      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  CLIENT: hydrate session                    │
│ 1. Call `getSession()` or rely on `useSession()`            │
│    - If session present -> UI shows logged-in user          │
│    - If not yet hydrated -> optionally poll briefly then    │
│      fallback to full reload so middleware reads cookie     │
└─────────────────────────────────────────────────────────────┘

Lifecycle summary:
- Session: CREATED on successful sign-in; short-lived.
- Refresh cookie: CREATED or ROTATED by Better Auth on success.
- Destruction: cookie/session destroyed on sign-out or revoke.
- Expiration: session expires per TTL; refresh cookie expires per maxAge.

---

## SIGNUP (create account + optional auto-verify)

┌─────────────────────────────────────────────────────────────┐
│                 CLIENT: POST /api/auth/signup               │
│                 (email, password, optional profile)         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                 SERVER: create user record                  │
│ 1. Create user in DB                                        │
│ 2. Create verification token (one-time) -> send via email   │
│ 3. Optionally: auto sign-in after verify                    │
│    - If auto sign-in: create session & set refresh cookie   │
│      (Session CREATED, Refresh cookie CREATED)              │
│ 4. Otherwise: return success and await verification flow    │
└─────────────────────────────────────────────────────────────┘

Lifecycle summary:
- Session: may be CREATED if signup auto-signs in; otherwise none until sign-in.
- Refresh cookie: CREATED only if auto sign-in or explicit sign-in performed.
- Verification token: temporary one-time token CREATED; expires quickly.

---

## CHANGE PASSWORD

┌─────────────────────────────────────────────────────────────┐
│               CLIENT: POST /api/auth/change-password        │
│         (authenticated user supplies current + new password)│
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────--┐
│                 SERVER: verify & update password              │
│ 1. Verify current password via session/user record            │
│    - If invalid -> error                                      │
│ 2. Update password in DB                                      │
│ 3. Revoke existing sessions/refresh tokens for safety (REVOKE)│
│ 4. Optionally create a new session & refresh token (CREATE)   │
│    - If new session issued -> set new refresh cookie (ROTATE) │
└────────────────────────────────────────────────────────────--─┘

Lifecycle summary:
- Sessions/refresh tokens: typically REVOKED on password change to prevent old tokens reuse.
- A new session/refresh cookie may be CREATED depending on flow.

---

## RESET PASSWORD (send reset, and reset)

### SEND RESET PASSWORD (request)

┌─────────────────────────────────────────────────────────────┐
│            CLIENT: POST /api/auth/send-reset-password       │
│                     (email)                                 │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                 SERVER: one-time reset token                │
│ 1. If user exists -> create one-time reset token (CREATED)  │
│ 2. Email token to user                                      │
│ 3. Do NOT alter sessions or cookies at this step            │
└─────────────────────────────────────────────────────────────┘

### RESET (apply)

┌─────────────────────────────────────────────────────────────┐
│             CLIENT: POST /api/auth/reset-password           │
│        (token from email + new password)                    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│               SERVER: verify token & update password        │
│ 1. Verify one-time token (valid/not expired)                │
│ 2. Update user's password in DB                             │
│ 3. Revoke existing sessions/refresh tokens (REVOKE)         │
│ 4. Optionally sign the user in -> create session & cookie   │
└─────────────────────────────────────────────────────────────┘

Lifecycle summary:
- Reset token: CREATED for the flow; expires quickly and is DESTROYED after use.
- Sessions/refresh cookies: typically REVOKED on password reset; new session may be CREATED.

---

## SEND 2FA CODE (email) and SEND 2FA SMS

┌─────────────────────────────────────────────────────────────┐
│            CLIENT: POST /api/auth/send-2fa-code             │
│                       (email)                               │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                 SERVER: generate 2FA code (CREATED)         │
│ 1. Verify credentials (or prior verification step)          │
│ 2. Create short-lived 2FA code record in DB                 │
│ 3. Send code via email or SMS                               │
│ 4. Do NOT create sessions or cookies yet                    │
└─────────────────────────────────────────────────────────────┘

Lifecycle summary:
- 2FA code: CREATED, stored server-side, expires quickly, DESTROYED on verification or after TTL.
- No session or refresh cookie is created by sending codes alone.

---

## VERIFY 2FA CODE

┌─────────────────────────────────────────────────────────────┐
│            CLIENT: POST /api/auth/verify-2fa-code           │
│                  (email, code, optional tempPassword)       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────---┐
│             SERVER: verify code & finalize sign-in             │
│ 1. Validate code (exists & not expired)                        │
│ 2. If attempts exceeded -> destroy code + error                │
│ 3. If valid -> mark verified and PROCEED to sign-in flow       │
│ 4. Final sign-in: create session & set refresh cookie (CREATED)│
└─────────────────────────────────────────────────────────────---┘

Lifecycle summary:
- On successful verification, session is CREATED and refresh cookie is set by Better Auth.
- The 2FA code is DESTROYED after successful use.

---

## SEND VERIFICATION (email verification)

┌─────────────────────────────────────────────────────────────┐
│            CLIENT: POST /api/auth/send-verification         │
│                      (email)                                │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│               SERVER: create verification token (CREATED)   │
│ 1. Generate one-time verification token & store             │
│ 2. Send verification email                                  │
│ 3. No change to session or refresh cookie at this step      │
└─────────────────────────────────────────────────────────────┘

Lifecycle summary:
- Verification token CREATED and expires quickly. No cookies/sessions changed.

---

## UPDATE PROFILE (authenticated)

┌─────────────────────────────────────────────────────────────┐
│            CLIENT: POST /api/auth/update-profile            │
│               (authenticated, provide profile fields)       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                SERVER: validate session & update user       │
│ 1. `auth.api.getSession({ headers })` -> must be valid      │
│    - If invalid -> 401                                      │
│ 2. Update profile fields in DB                              │
│ 3. If critical fields changed (email/password):             │
│    - May REVOKE existing sessions/refresh tokens            │
│    - Optionally CREATE new session & refresh cookie         |
└─────────────────────────────────────────────────────────────┘

Lifecycle summary:
- Profile updates themselves do not automatically change cookies unless security-sensitive fields are modified (then REVOKE/CREATE flows apply).

---

## QUICK REFERENCE TABLE

| Route                              | Token created  | Session created | Cookie set/rotated      | Token/session destroyed              |
|-----------------------------------:|:--------------:|:---------------:|:-----------------------:|:------------------------------------:|
| POST /api/auth/login               | Yes (maybe)    | Yes             | Yes                     | On sign-out/revoke                   |
| POST /api/auth/signup              | Maybe (auto)   | Maybe (auto)    | Maybe (auto)            | On sign-out/revoke                   |
| POST /api/auth/change-password     | No             | Maybe (renew)   | Maybe (rotate)          | REVOKE old tokens                    |
| POST /api/auth/send-reset-password | Yes (one-time) | No              | No                      | Token consumed/expired               |
| POST /api/auth/reset-password      | No (uses token)| Maybe (new)     | Maybe (new)             | REVOKE old tokens                    |
| POST /api/auth/send-2fa-code       | No             | No              | No                      | Code expired/consumed                |
| POST /api/auth/send-2fa-sms        | No             | No              | No                      | Code expired/consumed                |
| POST /api/auth/verify-2fa-code     | No (direct)    | Yes (on success)| Yes (set by better auth)| Code destroyed; session created      |
| POST /api/auth/send-verification   | Yes (one-time) | No              | No                      | Token expired/consumed               |
| POST /api/auth/update-profile      | No             | No (validate)   | No (unless sensitive)   | May REVOKE if sensitive changes      |





