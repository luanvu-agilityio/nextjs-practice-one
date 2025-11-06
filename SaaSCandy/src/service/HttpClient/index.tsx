import { getSession } from '@/lib/auth-client';

interface HttpError extends Error {
  status: number;
  data: unknown;
}

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
export function isBrowser() {
  // Allow tests to override browser detection by setting globalThis.__TEST_IS_BROWSER__.
  // This keeps production behavior unchanged while making the environment deterministic in tests.
  const testOverride = (
    globalThis as unknown as { __TEST_IS_BROWSER__?: unknown }
  ).__TEST_IS_BROWSER__;
  if (testOverride !== undefined) return !!testOverride;

  return (globalThis as unknown as { window?: unknown }).window !== undefined;
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
  private async getAuthHeader(): Promise<Record<string, string>> {
    try {
      // if there's no window (server-side) or it's falsy, skip auth
      if (!isBrowser()) {
        return {};
      }

      const session = await getSession();
      const accessToken = session?.data?.session?.token;

      if (accessToken && typeof accessToken === 'string') {
        return { Authorization: `Bearer ${accessToken}` };
      }

      return {};
    } catch {
      return {};
    }
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
   * Makes an HTTP request with the specified method, path, and body.
   * @param method - HTTP method ('GET', 'POST', etc.).
   * @param path - Endpoint path or full URL.
   * @param body - Optional request body.
   * @returns The parsed response data.
   * @throws {HttpError} If the response is not OK.
   */
  private async request<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<T> {
    const url = this.buildUrl(path);
    const headers = {
      ...this.defaultHeaders,
      ...(await this.getAuthHeader()),
    };

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const error = new Error(
        data?.message || response.statusText
      ) as HttpError;
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  }

  /**
   * Makes a GET request.
   * @param path - Endpoint path or full URL.
   * @returns The response data.
   */
  get<T>(path: string) {
    return this.request<T>('GET', path);
  }

  /**
   * Makes a POST request.
   * @param path - Endpoint path or full URL.
   * @param body - Optional request body.
   * @returns The response data.
   */
  post<T>(path: string, body?: unknown) {
    return this.request<T>('POST', path, body);
  }

  /**
   * Makes a PUT request.
   * @param path - Endpoint path or full URL.
   * @param body - Optional request body.
   * @returns The response data.
   */
  put<T>(path: string, body?: unknown) {
    return this.request<T>('PUT', path, body);
  }

  /**
   * Makes a DELETE request.
   * @param path - Endpoint path or full URL.
   * @returns The response data.
   */
  delete<T>(path: string) {
    return this.request<T>('DELETE', path);
  }
}

/**
 * Default HTTP client instance using the API base URL from environment variables.
 */
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ||
  'https://68c8bdb1ceef5a150f623481.mockapi.io/';

export const http = new HttpClient(API_BASE);
