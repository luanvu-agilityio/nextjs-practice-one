/**
 * API catch-all route for Better Auth.
 *
 * - Handles all GET and POST requests for authentication endpoints.
 * - Uses Better Auth's Next.js handler to route requests.
 * - Supports sign-in, sign-up, session, and other auth actions.
 */
import { auth } from '@/lib/better-auth';
import { toNextJsHandler } from 'better-auth/next-js';

export const { GET, POST } = toNextJsHandler(auth);
