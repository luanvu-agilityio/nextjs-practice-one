# Effect Migration Guide

This guide documents the Effect-based architecture patterns used in this codebase and provides guidance for migrating from traditional `async/await` to Effect-based code.

## Table of Contents

1. [When to Use Effects](#when-to-use-effects)
2. [Architecture Patterns](#architecture-patterns)
3. [Error Handling](#error-handling)
4. [Testing Strategy](#testing-strategy)
5. [Migration Strategy](#migration-strategy)
6. [Common Patterns](#common-patterns)

---

## When to Use Effects

**Use Effects for:**
- ✅ Complex orchestration with multiple async operations
- ✅ Code that needs retry/timeout/cancellation logic
- ✅ Service-layer business logic (HTTP clients, DB operations)
- ✅ Operations that benefit from typed error channels
- ✅ Code that needs to be composable and testable

**Keep async/await for:**
- ❌ Simple, one-off async operations
- ❌ Next.js API route handlers (use as adapter layer)
- ❌ Component event handlers (use Effect adapters instead)
- ❌ Code with minimal error-handling needs

---

## Architecture Patterns

### The Adapter Pattern (Core Principle)

```
┌─────────────────────────────────────────┐
│  UI Layer (Components, API Routes)     │
│  - Calls Promise-based adapters         │
│  - Handles UI state and rendering       │
└──────────────┬──────────────────────────┘
               │
               │ runEffectToApiResponse()
               │ runEffectSafely()
               ▼
┌─────────────────────────────────────────┐
│  Adapter Layer (helpers.ts)             │
│  - Converts Effects → Promises          │
│  - Normalizes errors to AppError        │
│  - Returns ApiResponse or RunResult     │
└──────────────┬──────────────────────────┘
               │
               │ Effect<T, E, R>
               ▼
┌─────────────────────────────────────────┐
│  Core Layer (Services, HttpClient)      │
│  - Pure Effect-based logic              │
│  - Composable, typed error channels     │
│  - No framework dependencies            │
└─────────────────────────────────────────┘
```

### 1. Service Layer Pattern

**Core service functions return Effects:**

```typescript
// src/service/AuthService/index.ts

import { http } from '@/service/HttpClient';

/**
 * Effect-based service function.
 * Returns Effect<ApiResponse, HttpError, unknown>
 */
export const verifyEmail = (token: string) =>
  http.get<ApiResponse>(`/api/auth/verify-email?token=${token}`);

/**
 * Promise adapter for backward compatibility.
 * Components and routes call this, not the Effect directly.
 */
export const verifyEmailAsync = (token: string) =>
  runEffectToApiResponse(verifyEmail(token));
```

**Key principles:**
- Export both Effect and Promise versions during migration
- Mark Promise versions as `@deprecated` once consumers migrate
- Keep the Effect version as the source of truth

### 2. API Route Pattern

**Effects return plain data, routes map to NextResponse:**

```typescript
// src/app/api/auth/reset-password/route.ts

import { Effect } from 'effect';
import { NextRequest, NextResponse } from 'next/server';
import { runEffectToApiResponse } from '@/lib/effect-helpers';

export async function POST(request: NextRequest) {
  // Effect returns plain data (not NextResponse)
  const program = Effect.gen(function* () {
    const body = yield* Effect.promise(() => request.json());
    const { token, newPassword } = body ?? {};

    if (!token || !newPassword) {
      return { success: false, message: 'Token and password required' };
    }

    const result = yield* Effect.promise(() =>
      auth.api.resetPassword({ body: { token, newPassword } })
    );

    return { success: true, data: result };
  });

  // Adapter layer: run Effect and map to NextResponse
  const result = await runEffectToApiResponse(program);

  if (result.success) {
    return NextResponse.json(result, { status: 200 });
  } else {
    return NextResponse.json(result, { status: 400 });
  }
}
```

**Key principles:**
- Effects return plain data objects (ADTs, domain types)
- Route handler is the adapter: runs Effect → maps to NextResponse
- Keeps business logic framework-agnostic and testable

### 3. Component Pattern

**Components use Promise adapters, not Effects directly:**

```typescript
// src/features/Auth/VerifyEmailContent/index.tsx

import { runAuthEffect } from '@/service/AuthService/helpers';
import { verifyEmail } from '@/service';

export default function VerifyEmailContent() {
  const handleVerify = async () => {
    try {
      // Call the Promise adapter, not the Effect
      const result = await runAuthEffect(verifyEmail(token));
      
      if (result.success) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch (err) {
      setStatus('error');
    }
  };

  // ...
}
```

**Key principles:**
- Components always call Promise-based adapters
- Use `runEffectToApiResponse` for service calls
- Use `runEffectSafely` when you need discriminated ok/error results

---

## Error Handling

### Centralized Error Conversion

All Effect errors flow through a single conversion pipeline:

```typescript
import { convertEffectError, getErrorMessage } from '@/lib/effect-helpers';

// Convert any error to AppError ADT
const appError = convertEffectError(unknownError);

// Extract user-friendly message
const message = getErrorMessage(appError);
```

### Error Types (ADTs)

```typescript
type AppError =
  | HttpError        // Network/API errors
  | AuthError        // Authentication/authorization
  | ValidationError  // Input validation
  | ExternalServiceError  // Third-party service failures
  | NotFoundError;   // Resource not found
```

### Standard Adapters

**For service calls (API responses):**
```typescript
import { runEffectToApiResponse } from '@/lib/effect-helpers';

const result = await runEffectToApiResponse(someEffect);
// result: ApiResponse<T> = { success: boolean; data?: T; error?: string }
```

**For UI components (discriminated unions):**
```typescript
import { runEffectSafely } from '@/lib/effect-helpers';

const result = await runEffectSafely(someEffect);
if (result.ok) {
  console.log(result.value);
} else {
  console.error(result.message);
}
```

---

## Testing Strategy

### Test Adapters, Not Effects

**❌ Don't mock Effects directly:**
```typescript
// BAD: mocking the Effect
jest.mock('@/service', () => ({
  verifyEmail: jest.fn(() => Effect.succeed({ success: true }))
}));
```

**✅ Mock the Promise adapter:**
```typescript
// GOOD: mock the adapter that components actually call
jest.mock('@/service/AuthService/helpers', () => ({
  runAuthEffect: jest.fn()
}));

beforeEach(() => {
  helpers.runAuthEffect.mockResolvedValue({ success: true });
});
```

### Testing Effects Directly (Unit Tests)

For pure Effect logic, test the Effect itself:

```typescript
import { Effect } from 'effect';
import { verifyEmailEffect } from '@/service/AuthService';

it('should return success for valid token', async () => {
  const result = await Effect.runPromise(
    verifyEmailEffect('valid-token')
  );
  
  expect(result.success).toBe(true);
});
```

### Testing Adapters

Test that adapters correctly convert Effects to the expected shape:

```typescript
import { runEffectToApiResponse } from '@/lib/effect-helpers';
import { Effect } from 'effect';

it('converts successful Effect to ApiResponse', async () => {
  const effect = Effect.succeed({ id: 1, name: 'Test' });
  const result = await runEffectToApiResponse(effect);
  
  expect(result).toEqual({
    success: true,
    data: { id: 1, name: 'Test' }
  });
});

it('converts failed Effect to ApiResponse with error', async () => {
  const effect = Effect.fail(new Error('Test error'));
  const result = await runEffectToApiResponse(effect);
  
  expect(result.success).toBe(false);
  expect(result.error).toBeDefined();
});
```

---

## Migration Strategy

### Phase 1: Foundation (Complete)
- ✅ HttpClient fully Effect-based
- ✅ Core adapters (`runEffectToApiResponse`, `runEffectSafely`)
- ✅ Centralized error handling (`convertEffectError`)
- ✅ Documentation (this guide)

### Phase 2: Service Layer Migration (In Progress)
1. Pick a service module (e.g., `AuthService`)
2. Create Effect-based core functions
3. Add Promise adapters using `runEffectToApiResponse`
4. Keep both versions during transition
5. Update tests to mock adapters
6. Mark old Promise versions as `@deprecated`

### Phase 3: API Routes Standardization
1. Refactor routes to follow adapter pattern
2. Effects return plain data
3. Route handler runs Effect → maps to NextResponse
4. Update route tests

### Phase 4: Components (Minimal Changes)
- Components already use adapters
- No changes needed if adapters remain stable
- Update only if switching from deprecated functions

### Phase 5: Evaluate & Decide
- Measure: test stability, dev experience, error handling clarity
- Decide: continue migration, pause, or stop
- Document lessons learned

---

## Common Patterns

### Pattern 1: Simple Effect Creation

```typescript
import { Effect } from 'effect';

// From Promise
const fetchUserEffect = (id: string) =>
  Effect.tryPromise({
    try: () => fetch(`/api/users/${id}`).then(r => r.json()),
    catch: (err) => new Error(`Failed to fetch user: ${err}`)
  });

// From sync function
const validateEmailEffect = (email: string) =>
  email.includes('@')
    ? Effect.succeed(email)
    : Effect.fail(new Error('Invalid email'));
```

### Pattern 2: Effect Composition

```typescript
import { Effect, pipe } from 'effect';

const loginFlow = (email: string, password: string) =>
  pipe(
    validateCredentials(email, password),
    Effect.flatMap(user => generateToken(user)),
    Effect.flatMap(token => createSession(token)),
    Effect.map(session => ({ success: true, session }))
  );
```

### Pattern 3: Error Recovery

```typescript
import { Effect } from 'effect';

const getUserWithFallback = (id: string) =>
  pipe(
    fetchUser(id),
    Effect.catchAll(() => Effect.succeed({ id, name: 'Guest' }))
  );
```

### Pattern 4: Parallel Effects

```typescript
import { Effect } from 'effect';

const loadDashboard = Effect.all([
  fetchUserProfile(),
  fetchNotifications(),
  fetchAnalytics()
]);

const [profile, notifications, analytics] = await Effect.runPromise(loadDashboard);
```

### Pattern 5: Timeout & Retry

```typescript
import { Effect } from 'effect';

const fetchWithTimeout = (url: string) =>
  pipe(
    Effect.tryPromise(() => fetch(url)),
    Effect.timeout('5 seconds'),
    Effect.retry({ times: 3 })
  );
```

---

## Best Practices

### DO:
- ✅ Use Effects for complex business logic
- ✅ Keep adapters stable during migration
- ✅ Test adapters thoroughly
- ✅ Document Effect error channels with JSDoc
- ✅ Centralize error conversion
- ✅ Use `Effect.gen` for readable async flows

### DON'T:
- ❌ Return NextResponse from inside Effects
- ❌ Mix async/await with Effect chains unnecessarily
- ❌ Create multiple error-conversion helpers
- ❌ Mock Effects directly in component tests
- ❌ Migrate everything at once
- ❌ Use Effects for trivial one-liners

---

## Resources

- [Effect Documentation](https://effect.website/)
- [Effect Error Handling Guide](https://effect.website/docs/error-management)
- [Effect Testing Patterns](https://effect.website/docs/testing)

---

## Questions & Support

For questions about Effect migration:
1. Check this guide first
2. Review existing Effect-based code in `src/service/HttpClient`
3. Look at adapter implementations in `src/lib/effect-helpers.ts`
4. Ask the team in #engineering-effect channel
