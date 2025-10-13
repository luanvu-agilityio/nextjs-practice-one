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

  // Account Form Validations
  FIRST_NAME_MIN: 'First name must be at least 2 characters',
  LAST_NAME_MIN: 'Last name must be at least 2 characters',
  CURRENT_PASSWORD_REQUIRED: 'Current password is required',
  NEW_PASSWORD_MIN: 'New password must be at least 6 characters',
  CONFIRM_PASSWORD_REQUIRED: 'Please confirm your password',
  PASSWORDS_DONT_MATCH: "Passwords don't match",

  // Profile Update Validations
  NAME_MIN: 'Name must be at least 2 characters',
  NAME_MAX: 'Name is too long',
  PASSWORD_MAX: 'Password is too long',
  PASSWORD_REGEX:
    'Password must contain at least one uppercase letter, one lowercase letter, and one number',

  PROJECT_NAME_REQUIRED: 'Project name is required',
  PROJECT_TYPE_REQUIRED: 'Please select a project type',
  MESSAGE_MIN_LENGTH: 'Message must be at least 10 characters',

  AGREE_TERMS_REQUIRED: 'You must agree to the terms and conditions',
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
    PROFILE_UPDATE_SUCCESS: {
      title: 'Profile Updated Successfully!',
      description: 'Your profile information has been updated.',
    },
    PROFILE_UPDATE_ERROR: {
      title: 'Profile Update Failed',
      description: 'Failed to update profile. Please try again.',
    },
    PASSWORD_CHANGE_SUCCESS: {
      title: 'Password Changed Successfully!',
      description: 'Your password has been updated securely.',
    },
    PASSWORD_CHANGE_ERROR: {
      title: 'Password Change Failed',
      description: 'Failed to change password. Please try again.',
    },
    SIGNOUT_SUCCESS: {
      title: 'Signed Out Successfully',
      description: 'You have been signed out. Come back soon!',
    },
    SIGNOUT_ERROR: {
      title: 'Sign Out Failed',
      description: 'There was an error signing you out. Please try again.',
    },
    SESSION_LOADING_ERROR: {
      title: 'Loading Error',
      description: 'Failed to load account session',
    },
  },

  // Error Page Messages
  ERROR_PAGES: {
    ACCOUNT_ERROR: {
      UNAUTHORIZED: {
        title: 'Account Error',
        description: 'You need to sign in to access your account.',
        action: 'Go to Sign In',
      },
      NETWORK: {
        title: 'Account Error',
        description:
          'Unable to connect to our servers. Please check your internet connection.',
        action: 'Try Again',
      },
      GENERAL: {
        title: 'Account Error',
        description:
          'We encountered an unexpected error while loading your account.',
        action: 'Try Again',
      },
    },
    NOT_FOUND: {
      title: 'Account Not Found',
      description:
        "The account you're looking for doesn't exist or you don't have permission to access it. Please sign in with the correct credentials.",
      actions: {
        signIn: 'Sign In',
        createAccount: 'Create Account',
        backHome: 'Back to Home',
      },
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
