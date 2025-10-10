// Authentication Messages
export const AUTH_MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid email or password.',
  EMAIL_ALREADY_EXISTS: 'This email is already registered.',
  USER_NOT_FOUND: 'No account found with this email.',
  ACCESS_DENIED: 'Access denied. Please contact support.',
  ACCOUNT_NOT_FOUND: 'Account not found. Please check your email address.',
  EMAIL_ALREADY_REGISTERED:
    'This email is already registered. Try logging in instead.',

  SIGN_IN: {
    title: 'Sign In Page',
    submitButton: 'Sign In',
    submittingButton: 'Signing in...',
    forgotPassword: 'Forget Password?',
    notMember: 'Not a member yet?',
    signUpLink: 'Sign Up',
  },
  SIGN_UP: {
    title: 'Sign Up Page',
    submitButton: 'Sign Up',
    submittingButton: 'Creating account...',
    privacyText: 'By creating an account you are agree with our',
    privacyLink: 'Privacy & Policy',
    alreadyMember: 'Already have an account?',
    signInLink: 'Sign In',
  },
  SOCIAL: {
    googleSignIn: 'Sign In',
    githubSignIn: 'Sign In',
    googleSignUp: 'Sign Up',
    githubSignUp: 'Sign Up',
  },
  DIVIDER: 'OR',
};
// Network Messages
export const NETWORK_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  TIMEOUT: 'Request timed out. Please try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  SERVICE_UNAVAILABLE:
    'Service temporarily unavailable. Please try again later.',
};
// Validation Messages
export const VALIDATION_MESSAGES = {
  INVALID_REQUEST:
    'Invalid request. Please check your information and try again.',
  CHECK_INPUT: 'Please check your input and try again.',
  TOO_MANY_ATTEMPTS: 'Too many attempts. Please wait a moment and try again.',
  EMAIL_REQUIRED: 'Please enter your email address.',
  EMAIL_INVALID: 'Please enter a valid email address.',
  PASSWORD_REQUIRED: 'Please enter your password.',
  PASSWORD_MIN_LENGTH: 'Password must be at least 8 characters.',
};
// General Messages
export const GENERAL_MESSAGES = {
  SOMETHING_WRONG: 'Something went wrong. Please try again.',
};

export const TOAST_MESSAGES = {
  // Sign In Messages
  SIGN_IN: {
    SUCCESS: {
      title: 'Sign In Successful!',
      description: 'Welcome back! Redirecting to your dashboard...',
    },
    ERROR: {
      title: 'Sign In Failed',
      description: 'Invalid email or password. Please try again.',
    },
    AUTH_ERROR: {
      title: 'Authentication Error',
      description:
        'Sign in successful but session creation failed. Please try again.',
    },
  },

  // Sign Up Messages
  SIGN_UP: {
    SUCCESS: {
      title: 'Account Created Successfully!',
      description: 'Welcome to SaaSCandy! Signing you in automatically...',
    },
    ERROR: {
      title: 'Registration Failed',
      description: 'Registration failed. Please try again.',
    },
    AUTO_SIGNIN_FAILED: {
      title: 'Registration Successful',
      description:
        'Account created but auto sign-in failed. Please sign in manually.',
    },
  },

  // Social Authentication Messages
  SOCIAL: {
    SIGNIN_REDIRECT: {
      title: 'Redirecting...',
      description: 'Signing in with {provider}. Please wait...',
    },
    SIGNUP_REDIRECT: {
      title: 'Redirecting...',
      description: 'Creating account with {provider}. Please wait...',
    },
    SIGNIN_ERROR: {
      title: 'Social Sign In Failed',
      description: 'Failed to sign in with {provider}. Please try again.',
    },
    SIGNUP_ERROR: {
      title: 'Social Sign Up Failed',
      description:
        'Failed to create account with {provider}. Please try again.',
    },
  },

  // Account Management Messages
  ACCOUNT: {
    SIGNOUT_SUCCESS: {
      title: 'Signed Out Successfully',
      description: 'You have been signed out. Come back soon!',
    },
    SIGNOUT_ERROR: {
      title: 'Sign Out Failed',
      description: 'Failed to sign out. Please try again.',
    },
  },

  // General Feature Messages
  FEATURES: {
    FORGOT_PASSWORD: {
      title: 'Feature Coming Soon',
      description: 'Password reset functionality will be available soon.',
    },
    EDIT_PROFILE: {
      title: 'Feature Coming Soon',
      description: 'Profile editing will be available soon.',
    },
    CHANGE_PASSWORD: {
      title: 'Feature Coming Soon',
      description: 'Password change functionality will be available soon.',
    },
    PRIVACY_SETTINGS: {
      title: 'Feature Coming Soon',
      description: 'Privacy settings will be available soon.',
    },
  },

  // Generic Messages
  GENERIC: {
    SUCCESS: {
      title: 'Success!',
      description: 'Operation completed successfully.',
    },
    ERROR: {
      title: 'Error',
      description: 'Something went wrong. Please try again.',
    },
    INFO: {
      title: 'Information',
      description: 'Please note this information.',
    },
    WARNING: {
      title: 'Warning',
      description: 'Please be aware of this warning.',
    },
  },
};

// HTTP Status Messages Map
export const HTTP_STATUS_MESSAGES = {
  400: VALIDATION_MESSAGES.INVALID_REQUEST,
  401: AUTH_MESSAGES.INVALID_CREDENTIALS,
  403: AUTH_MESSAGES.ACCESS_DENIED,
  404: AUTH_MESSAGES.ACCOUNT_NOT_FOUND,
  409: AUTH_MESSAGES.EMAIL_ALREADY_REGISTERED,
  422: VALIDATION_MESSAGES.CHECK_INPUT,
  429: VALIDATION_MESSAGES.TOO_MANY_ATTEMPTS,
  500: NETWORK_MESSAGES.SERVER_ERROR,
  502: NETWORK_MESSAGES.SERVICE_UNAVAILABLE,
  503: NETWORK_MESSAGES.SERVICE_UNAVAILABLE,
  504: NETWORK_MESSAGES.SERVICE_UNAVAILABLE,
};

// String Error Keywords Map
export const STRING_ERROR_KEYWORDS = {
  INVALID: AUTH_MESSAGES.INVALID_CREDENTIALS,
  CREDENTIALS: AUTH_MESSAGES.INVALID_CREDENTIALS,
  NETWORK: NETWORK_MESSAGES.NETWORK_ERROR,
  TIMEOUT: NETWORK_MESSAGES.TIMEOUT,
};

// Error Instance Keywords Map
export const ERROR_INSTANCE_KEYWORDS = {
  'invalid credentials': AUTH_MESSAGES.INVALID_CREDENTIALS,
  'email already exists': AUTH_MESSAGES.EMAIL_ALREADY_EXISTS,
  'user not found': AUTH_MESSAGES.USER_NOT_FOUND,
  network: NETWORK_MESSAGES.NETWORK_ERROR,
  timeout: NETWORK_MESSAGES.TIMEOUT,
};
