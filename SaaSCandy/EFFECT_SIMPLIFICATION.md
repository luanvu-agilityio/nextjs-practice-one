# Simplified Effect Usage Guide

## Philosophy: Use Effect Where It Adds Value

**Effect is a powerful library, but it's not needed everywhere.** Use it strategically where it provides real benefits: retries, timeouts, complex composition. For simple API routes and services, standard async/await is cleaner and easier to understand.

## When to Use Effect

✅ **DO use Effect for:**
- HTTP client operations (retries, timeouts)
- External service calls that need resilience (email, SMS, third-party APIs)
- Complex async workflows with multiple steps and error recovery
- Operations that benefit from functional composition

❌ **DON'T use Effect for:**
- Simple input validation
- Single API calls without retry/timeout needs
- Basic CRUD operations
- Straightforward request/response handlers

## Simplified Patterns

### 1. Simple API Routes (No Effect Needed)

**Example: Password Change Route**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/better-auth';

export async function POST(request: NextRequest) {
  try {
    // Parse and validate
    const body = await request.json();
    const { currentPassword, newPassword } = body ?? {};

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, message: 'Both passwords required' },
        { status: 400 }
      );
    }

    // Call external service
    const result = await auth.api.changePassword({
      headers: request.headers,
      body: { currentPassword, newPassword },
    });

    // Check response
    if (result?.user || result?.token || result?.ok) {
      return NextResponse.json({
        success: true,
        message: 'Password changed successfully',
      });
    }

    // Handle auth errors
    return NextResponse.json(
      { success: false, message: result.error || 'Failed' },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || 'Unexpected error' },
      { status: 500 }
    );
  }
}
```

**Benefits:**
- Clear, linear flow
- Easy to debug
- Familiar to all developers
- No type casting needed

### 2. HttpClient with Effect (Where It Makes Sense)

**The HttpClient uses Effect for retry/timeout capabilities:**

```typescript
import { Effect, pipe } from 'effect';

class HttpClient {
  get<T>(path: string) {
    return pipe(
      Effect.tryPromise({
        try: () => fetch(this.buildUrl(path)),
        catch: (err) => err instanceof Error ? err : new Error('Fetch failed')
      }),
      Effect.flatMap(response => 
        Effect.tryPromise({
          try: () => response.json(),
          catch: () => new Error('Invalid JSON')
        })
      ),
      Effect.retry({ times: 1 }),      // Automatic retry
      Effect.timeout('5 seconds')       // Timeout protection
    );
  }
}
```

**Benefits:**
- Built-in retry logic
- Timeout protection
- Error transformation

### 3. AuthService - Thin Wrapper (Simplified)

**Before (Over-Engineered):**
```typescript
export const verify2FACode = (email: string, code: string) =>
  pipe(
    http.post(API_ROUTES.AUTH.VERIFY_2FA_CODE, { email, code }),
    Effect.mapError(err => convertToAppError(err))  // Redundant!
  );
```

**After (Simplified):**
```typescript
export const verify2FACode = (email: string, code: string) =>
  http.post(API_ROUTES.AUTH.VERIFY_2FA_CODE, { email, code });
  // HttpClient already handles errors properly
```

**Benefits:**
- No redundant error mapping
- HttpClient does the heavy lifting
- One less abstraction layer

### 4. Client Components - No Effect!

**Before (Over-Complicated):**
```typescript
const handleSignIn = () => {
  const signInFlow = pipe(
    Effect.promise(() => verify2FACode(email, code)),
    Effect.map(result => result as { success?: boolean }),
    Effect.flatMap(result =>
      !result?.success
        ? Effect.fail(new Error('Verification failed'))
        : Effect.succeed(result)
    ),
    Effect.flatMap(() =>
      Effect.promise(() => signIn.email({ email, password }))
    ),
    Effect.tap(() => Effect.promise(() => getSession())),
    Effect.tap(() => Effect.sync(() => showToast(...))),
    Effect.catchAll(error => Effect.sync(() => showToast(error)))
  );

  return Effect.runPromise(signInFlow as Effect.Effect<unknown, never, never>);
};
```

**After (Simple):**
```typescript
const handleSignIn = async () => {
  try {
    // Verify 2FA code
    const verifyResult = await verify2FACode(email, code);
    if (!verifyResult?.success) {
      showToast({ title: 'Error', description: 'Verification failed' });
      return;
    }

    // Sign in
    const signInResult = await signIn.email({ email, password });
    if (signInResult.error) {
      showToast({ title: 'Error', description: signInResult.error.message });
      return;
    }

    // Get session
    await getSession();

    // Success
    showToast({ title: 'Success', description: 'Signed in!' });
    router.push('/home');
  } catch (error) {
    showToast({ title: 'Error', description: error.message });
  }
};
```

**Benefits:**
- 60% less code
- No type casting
- Standard async/await patterns
- Easy for any React developer to understand

## Error Handling Principles

### Server Routes
1. **Validate inputs** → return 400 with clear message
2. **External failures** → catch and return 500 with friendly message
3. **Auth failures** → return 401 or 403 with clear message

### Client Code
1. Let the server handle error mapping
2. Display server error messages to users
3. Use try/catch for async operations

## Simplified Error Types

We only need two error types:

```typescript
// For client errors (validation, auth)
type HttpError = {
  _tag: 'HttpError';
  status: number;
  message: string;
};

// For external service failures
type ExternalServiceError = {
  _tag: 'ExternalServiceError';
  service: string;
  cause?: unknown;
};
```

**You don't need:** ValidationError, AuthError, NotFoundError - just use HttpError with appropriate status codes.

## Migration Path

1. **Keep Effect in HttpClient** - it provides real value (retries, timeouts)
2. **Remove Effect from simple routes** - use standard async/await
3. **Simplify AuthService** - remove redundant Effect.mapError layers
4. **Remove Effect from client components** - use standard async/await
5. **Keep error types simple** - HttpError and ExternalServiceError only

## Summary

**Effect is excellent for:**
- Network resilience (retries, timeouts)
- Complex async orchestration
- Functional composition when it simplifies code

**Effect is overkill for:**
- Simple validation
- Basic request handlers
- Client-side form handling
- Single API calls

**Golden Rule:** If standard async/await is simpler and clearer, use it. Add Effect only when you need its specific capabilities (retry, timeout, complex composition).
