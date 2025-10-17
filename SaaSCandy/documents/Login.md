┌─────────────────────────────────────────────────────────────┐
│                    USER ENTERS CREDENTIALS                   │
│                    (email + password)                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              SEND 2FA CODE (API Route)                       │
│                                                              │
│  1. Find user by email                                       │
│     ├─ Not found? → Return success (don't reveal)           │
│     └─ Found? → Continue                                     │
│                                                              │
│  2. Find account with password                               │
│     ├─ No password? → Error: "Use social login"             │
│     └─ Has password? → Continue                              │
│                                                              │
│  3. Verify password (bcrypt compare)                         │
│     ├─ Invalid? → Error: "Invalid credentials"              │
│     └─ Valid? → Continue                                     │
│                                                              │
│  4. Generate 6-digit code                                    │
│  5. Delete old codes for user                                │
│  6. Store: code, email, tempPassword, expiresAt              │
│  7. Send email with code                                     │
│  8. Return success                                           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  USER ENTERS 6-DIGIT CODE                    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│             VERIFY 2FA CODE (API Route)                      │
│                                                              │
│  1. Validate format (6 digits)                               │
│     └─ Invalid? → Error: "Must be 6 digits"                  │
│                                                              │
│  2. Find user                                                │
│     └─ Not found? → Error: "Invalid code"                    │
│                                                              │
│  3. Find verification record                                 │
│     ├─ Not found/expired? → Error: "Request new code"        │
│     └─ Found? → Continue                                     │
│                                                              │
│  4. Check attempts                                           │
│     ├─ >= 3 attempts? → Delete code + Error: "Too many"     │
│     └─ < 3 attempts? → Continue                              │
│                                                              │
│  5. Compare code                                             │
│     ├─ Wrong? → Increment attempts + Error + Remaining       │
│     └─ Correct? → Mark verified + Return credentials         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              SIGN IN WITH BETTER AUTH                        │
│                                                              │
│  signIn.email({ email, password })                           │
│     ├─ Success? → Create session + Redirect home            │
│     └─ Error? → Show error message                           │
└─────────────────────────────────────────────────────────────┘
