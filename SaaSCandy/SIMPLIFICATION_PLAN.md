# Effect Simplification Plan

## Current Problems

1. **Over-complicated error handling** in `effect-http.ts` (70+ lines of nested unwrapping)
2. **Inconsistent error patterns** - mixing `return` and `throw` for ADT errors
3. **Excessive type casting** - defeating TypeScript's type safety
4. **Complex client-side Effect chains** - overusing Effect for simple async operations
5. **Confusing for beginners** - too many abstractions and patterns

## Simplified Approach

### Principle: **Use Effect where it adds value, use simple patterns everywhere else**

### Server Routes (API)
- **Keep it simple**: Use standard try/catch for validation
- **Throw HttpError** for 4xx client errors (validation, auth failures)
- **Only use Effect** for external service calls (database, APIs, email)
- **Centralized runner** handles Effect → NextResponse conversion

### Client Code (React Components)
- **Remove Effect entirely** from client components
- Use standard async/await for API calls
- Let the API routes handle error mapping

### Services (HttpClient, AuthService)
- **Keep Effect** only in HttpClient for retries/timeouts
- **Simplify AuthService** - just wrap HttpClient calls, no extra Effect layers

### Error Handling
- **Simple ADT types**: HttpError, ExternalServiceError (remove unused types)
- **Clear rule**: Server routes throw HttpError, services throw ExternalServiceError
- **Friendly messages**: Central `getFriendlyMessage` function

## Implementation Steps

1. ✅ Simplify `effect-http.ts` runner (reduce from 70 lines to ~30)
2. ✅ Fix route error patterns (consistent throw behavior)
3. ✅ Remove Effect from client components (replace with async/await)
4. ✅ Simplify AuthService (remove redundant Effect.mapError)
5. ✅ Clean up type casts (proper typing)
6. ✅ Run tests and fix regressions

## Benefits

- **Easier to learn**: Standard patterns familiar to beginners
- **Type safe**: Less casting, better TypeScript inference
- **Maintainable**: Clear, predictable error flow
- **Still get Effect benefits**: Retries, timeouts, composition where needed
- **Tests pass**: Same functionality, cleaner code
