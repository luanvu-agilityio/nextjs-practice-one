interface HttpError extends Error {
  status: number;
  data: unknown;
}

interface SessionWithToken {
  accessToken?: string;
}

export class HttpClient {
  baseUrl: string;
  defaultHeaders: Record<string, string>;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  private async getAuthHeader(): Promise<Record<string, string>> {
    try {
      if (typeof window === 'undefined') return {};

      try {
        const { getSession } = await import('next-auth/react');
        const session = await getSession();
        const accessToken = (session as SessionWithToken)?.accessToken;

        if (accessToken && typeof accessToken === 'string') {
          return { Authorization: `Bearer ${accessToken}` };
        }
      } catch {
        // next-auth not available, continue to fallback
      }

      // Fallback to localStorage-stored auth
      const authData = localStorage.getItem('auth');
      if (!authData) return {};

      const auth = JSON.parse(authData) as { token?: string } | null;
      if (!auth?.token) return {};

      return { Authorization: `Bearer ${auth.token}` };
    } catch {
      return {};
    }
  }

  private buildUrl(path: string) {
    if (path.startsWith('http')) return path;
    return `${this.baseUrl}/${path.replace(/^\/+/, '')}`;
  }

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

  get<T>(path: string) {
    return this.request<T>('GET', path);
  }

  post<T>(path: string, body?: unknown) {
    return this.request<T>('POST', path, body);
  }

  put<T>(path: string, body?: unknown) {
    return this.request<T>('PUT', path, body);
  }

  delete<T>(path: string) {
    return this.request<T>('DELETE', path);
  }
}

// Create HTTP client instances
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ||
  'https://68c8bdb1ceef5a150f623481.mockapi.io/';

export const http = new HttpClient(API_BASE);
