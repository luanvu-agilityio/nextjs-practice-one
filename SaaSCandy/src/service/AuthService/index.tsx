import { API_ROUTES } from '@/constants';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface Verify2FAResponse {
  email: string;
  password: string;
}

export interface Send2FAResponse {
  message: string;
}

/**
 * Generic API request handler
 */
async function apiRequest<T = unknown>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || data.error || 'Request failed',
        data: data,
      };
    }

    return {
      success: true,
      data: data.data || data,
      message: data.message,
    };
  } catch (error) {
    console.error('API request error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// =============================================================================
// AUTH SERVICES
// =============================================================================

/**
 * Send 2FA verification code to user's email
 */
export async function send2FACode(
  email: string,
  password: string
): Promise<ApiResponse<Send2FAResponse>> {
  return apiRequest(API_ROUTES.AUTH.SEND_2FA_CODE, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

/**
 * Verify 2FA code from email
 */
export async function verify2FACode(
  email: string,
  code: string
): Promise<ApiResponse<Verify2FAResponse>> {
  return apiRequest(API_ROUTES.AUTH.VERIFY_2FA_CODE, {
    method: 'POST',
    body: JSON.stringify({ email, code }),
  });
}

/**
 * Change user password
 */
export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<ApiResponse> {
  return apiRequest(API_ROUTES.AUTH.CHANGE_PASSWORD, {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

/**
 * Update user profile
 */
export async function updateProfile(data: {
  name?: string;
  email?: string;
}): Promise<ApiResponse> {
  return apiRequest(API_ROUTES.AUTH.UPDATE_PROFILE, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Verify email with token
 */
export async function verifyEmail(token: string): Promise<ApiResponse> {
  return apiRequest(`${API_ROUTES.AUTH.VERIFY_EMAIL}?token=${token}`, {
    method: 'GET',
  });
}

/**
 * Request a password reset email (generate token + send email)
 */
export async function requestPasswordReset(
  email: string
): Promise<ApiResponse> {
  return apiRequest(API_ROUTES.AUTH.SEND_RESET_PASSWORD, {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

/**
 * Reset password using token
 */
export async function resetPassword(
  token: string,
  newPassword: string
): Promise<ApiResponse> {
  const usedToken = token ?? '';

  return apiRequest(API_ROUTES.AUTH.RESET_PASSWORD, {
    method: 'POST',
    body: JSON.stringify({ token: usedToken, newPassword }),
  });
}
