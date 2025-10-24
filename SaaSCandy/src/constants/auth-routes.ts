export const ROUTES = {
  SIGN_IN: '/signin',
  SIGN_UP: '/signup',
  HOME: '/',
  PRIVACY: '/privacy',
  ACCOUNT: '/account',
  ABOUT: '/about',
  CONTACT: '/contact',
  PRICING: '/pricing',
  PORTFOLIO: '/portfolio',
  SERVICES: '/services',
  BLOG: '/blog',
  DOCS: '/docs',
  FORGOT_PASSWORD: '/forgot-password',
};

export const AUTH_ROUTES = [
  ROUTES.SIGN_IN,
  ROUTES.SIGN_UP,
  ROUTES.HOME,
  ROUTES.PRIVACY,
  ROUTES.ACCOUNT,
];

export const API_ROUTES = {
  AUTH: {
    CHANGE_PASSWORD: '/api/auth/change-password',
    UPDATE_PROFILE: '/api/auth/update-profile',
    VERIFY_EMAIL: '/api/auth/verify-email',
    SEND_2FA_CODE: '/api/auth/send-2fa-code',
    VERIFY_2FA_CODE: '/api/auth/verify-2fa-code',
  },
};

export const SOCIAL_PROVIDERS = {
  GOOGLE: 'google',
  GITHUB: 'github',
};

export const PUBLIC_ROUTES = [
  ROUTES.HOME,
  ROUTES.SIGN_IN,
  ROUTES.SIGN_UP,
  ROUTES.ABOUT,
  ROUTES.CONTACT,
  ROUTES.PRICING,
  ROUTES.BLOG,
  ROUTES.DOCS,
  ROUTES.FORGOT_PASSWORD,
];

export const PROTECTED_ROUTES = [ROUTES.ACCOUNT];
