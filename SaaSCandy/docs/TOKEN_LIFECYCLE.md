
## Current state 

- The project integrates with Better Auth (`src/lib/better-auth.ts`) and exposes a catch-all handler at `src/app/api/auth/[...all]/route.ts` which delegates to Better Auth's Next.js handler.
- On the client, `src/lib/auth-client.ts` uses `createAuthClient` from `better-auth/react` and exposes `signIn`, `signOut`, `useSession`, `getSession`, and `getAccessToken()`.
- The `HttpClient` (`src/service/HttpClient/index.tsx`) obtains the access token by calling `getAccessToken()` (which calls `getSession()` from the Better Auth client) and attaches `Authorization: Bearer <token>` to requests when available.
- There is an API endpoint `/api/auth/refresh` (`src/app/api/auth/refresh/route.ts`) that delegates to Better Auth's `api.refresh` (or `api.getSession`) and returns `ok: true/false`. Client refresh attempts use `fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' })` so cookies will be sent.
- The codebase does NOT store tokens in `localStorage` or `sessionStorage`.

