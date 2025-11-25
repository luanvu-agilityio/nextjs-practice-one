import { Effect, pipe } from 'effect';
import { getSession } from '@/lib/auth-client';

// Helpers
import { makeHttpError, isHttpError, toJsHttpError } from '@/lib/errors';

/**
 * HttpClient class for making HTTP requests with optional authentication.
 *
 * Features:
 * - Supports GET, POST, PUT, DELETE methods.
 * - Automatically adds JSON headers.
 * - Optionally adds Bearer token from session for authenticated requests.
 * - Handles error responses and throws HttpError with status and data.
 * - Builds URLs from base URL and path.
 *
 * Usage:
 *   const http = new HttpClient(API_BASE);
 *   const data = await http.get('/resource');
 */
/**
 * Returns true when running in a browser-like environment with a global window.
 * Exported for testing so tests can exercise the browser detection branches.
 */

interface CompatibleHttpError extends Error {
  status: number;
  data?: unknown;
}
export class HttpClient {
  baseUrl: string;
  defaultHeaders: Record<string, string>;

  /**
   * Creates a new HttpClient instance.
   * @param baseUrl - The base URL for all requests.
   */
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Gets the Authorization header if a session token is available.
   * @returns An object with the Authorization header or an empty object.
   */
  private getAuthHeader(): Effect.Effect<Record<string, string>, never, never> {
    return pipe(
      Effect.tryPromise({
        try: () => getSession(),
        catch: () => new Error('failed to read session'),
      }),
      Effect.map(session => {
        const accessToken = session?.data?.session?.token;
        if (accessToken && typeof accessToken === 'string') {
          return { Authorization: `Bearer ${accessToken}` } as Record<
            string,
            string
          >;
        }
        return {} as Record<string, string>;
      }),
      Effect.catchAll(() => Effect.succeed({} as Record<string, string>))
    );
  }

  /**
   * Builds a full URL from the base URL and path.
   * @param path - The endpoint path or full URL.
   * @returns The full URL as a string.
   */
  private buildUrl(path: string) {
    if (path.startsWith('http')) return path;
    return `${this.baseUrl}/${path.replace(/^\/+/, '')}`;
  }

  /**
   * Performs the fetch call as an Effect.
   */
  private performFetch<T>(
    url: string,
    headers: Record<string, string>,
    method: string,
    body?: unknown
  ): Effect.Effect<T, CompatibleHttpError, never> {
    return pipe(
      Effect.tryPromise({
        try: () =>
          fetch(url, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
          }),
        catch: (err: unknown) =>
          err instanceof Error ? err : new Error('Unknown error'),
      }),
      Effect.flatMap(response =>
        pipe(
          Effect.tryPromise({
            try: () => response.json().catch(() => null),
            catch: () => null,
          }),
          Effect.flatMap(data =>
            response.ok
              ? Effect.succeed(data as T)
              : Effect.fail(
                  // create both an ADT HttpError and a compatible Error-shaped object
                  toJsHttpError(
                    makeHttpError(
                      response.status,
                      data?.message ||
                        data?.error ||
                        response.statusText ||
                        'Request failed',
                      data
                    )
                  )
                )
          )
        )
      ),
      Effect.catchAll((error: unknown) => {
        // If it's already an Error-shaped HttpError use it
        if (isHttpError(error)) {
          // map ADT to compatible Error-shaped object for callers
          return Effect.fail(toJsHttpError(error));
        }
        if (
          error &&
          typeof error === 'object' &&
          'status' in (error as Record<string, unknown>)
        ) {
          return Effect.fail(error as CompatibleHttpError);
        }
        const msg = error instanceof Error ? error.message : 'Unknown error';
        // produce a compatible Error-shaped object and also keep ADT available elsewhere
        return Effect.fail(toJsHttpError(makeHttpError(500, msg, null)));
      })
    );
  }

  /**
   * Makes an HTTP request with the specified method, path, and body.
   * @param method - HTTP method ('GET', 'POST', etc.).
   * @param path - Endpoint path or full URL.
   * @param body - Optional request body.
   * @returns The parsed response data.
   * @throws {HttpError} If the response is not OK.
   */
  private request<T>(
    method: string,
    path: string,
    body?: unknown
  ): Effect.Effect<T, CompatibleHttpError, never> {
    const url = this.buildUrl(path);

    return pipe(
      this.getAuthHeader(),
      Effect.flatMap(authHeaders => {
        const headers = {
          ...this.defaultHeaders,
          ...authHeaders,
        };
        return this.performFetch<T>(url, headers, method, body);
      })
    );
  }

  /**
   * Makes a GET request.
   * @param path - Endpoint path or full URL.
   * @returns The response data.
   */
  get<T>(path: string): Effect.Effect<T, CompatibleHttpError, never> {
    return this.request<T>('GET', path);
  }

  /**
   * Makes a POST request.
   * @param path - Endpoint path or full URL.
   * @param body - Optional request body.
   * @returns The response data.
   */
  post<T>(
    path: string,
    body?: unknown
  ): Effect.Effect<T, CompatibleHttpError, never> {
    return this.request<T>('POST', path, body);
  }

  /**
   * Makes a PUT request.
   * @param path - Endpoint path or full URL.
   * @param body - Optional request body.
   * @returns The response data.
   */
  put<T>(
    path: string,
    body?: unknown
  ): Effect.Effect<T, CompatibleHttpError, never> {
    return this.request<T>('PUT', path, body);
  }

  /**
   * Makes a DELETE request.
   * @param path - Endpoint path or full URL.
   * @returns The response data.
   */
  delete<T>(path: string): Effect.Effect<T, CompatibleHttpError, never> {
    return this.request<T>('DELETE', path);
  }
}

/**
 * Default HTTP client instance using the API base URL from environment variables.
 */
export function makeHttpClient(baseUrl?: string) {
  const API_BASE =
    baseUrl ??
    process.env.NEXT_PUBLIC_API_BASE ??
    'https://68c8bdb1ceef5a150f623481.mockapi.io/';
  return new HttpClient(API_BASE);
}

export const http = makeHttpClient();
