import * as authRoutes from '../auth-routes';
import * as docs from '../docs';
import {
  TwoFactorEmail,
  VerificationEmail,
  ResetPasswordEmail,
} from '../email-template';
import * as portfolio from '../portfolio';
import * as appCategories from '../app-categories';
import * as authProvider from '../auth-provider';
import * as blogPost from '../blog-post';
import * as messages from '../messages';
import * as navLink from '../nav-link';
import * as pricingPlan from '../pricing-plan';
import * as service from '../service';
import * as faq from '../faq';

describe('auth-routes.ts', () => {
  test('ROUTES contains all expected keys and values', () => {
    expect(authRoutes.ROUTES.SIGN_IN).toBe('/signin');
    expect(authRoutes.ROUTES.SIGN_UP).toBe('/signup');
    expect(authRoutes.ROUTES.HOME).toBe('/');
    expect(authRoutes.ROUTES.PRIVACY).toBe('/privacy');
    expect(authRoutes.ROUTES.ACCOUNT).toBe('/account');
    expect(authRoutes.ROUTES.ABOUT).toBe('/about');
    expect(authRoutes.ROUTES.CONTACT).toBe('/contact');
    expect(authRoutes.ROUTES.PRICING).toBe('/pricing');
    expect(authRoutes.ROUTES.PORTFOLIO).toBe('/portfolio');
    expect(authRoutes.ROUTES.SERVICES).toBe('/services');
    expect(authRoutes.ROUTES.BLOG).toBe('/blog');
    expect(authRoutes.ROUTES.DOCS).toBe('/docs');
  });

  test('AUTH_ROUTES contains expected routes', () => {
    expect(authRoutes.AUTH_ROUTES).toEqual([
      '/signin',
      '/signup',
      '/',
      '/privacy',
      '/account',
    ]);
  });

  test('API_ROUTES.AUTH contains expected endpoints', () => {
    expect(authRoutes.API_ROUTES.AUTH.CHANGE_PASSWORD).toBe(
      '/api/auth/change-password'
    );
    expect(authRoutes.API_ROUTES.AUTH.UPDATE_PROFILE).toBe(
      '/api/auth/update-profile'
    );
    expect(authRoutes.API_ROUTES.AUTH.VERIFY_EMAIL).toBe(
      '/api/auth/verify-email'
    );
    expect(authRoutes.API_ROUTES.AUTH.SEND_2FA_CODE).toBe(
      '/api/auth/send-2fa-code'
    );
    expect(authRoutes.API_ROUTES.AUTH.VERIFY_2FA_CODE).toBe(
      '/api/auth/verify-2fa-code'
    );
  });

  test('SOCIAL_PROVIDERS contains google and github', () => {
    expect(authRoutes.SOCIAL_PROVIDERS.GOOGLE).toBe('google');
    expect(authRoutes.SOCIAL_PROVIDERS.GITHUB).toBe('github');
  });

  test('PUBLIC_ROUTES contains expected public routes', () => {
    expect(authRoutes.PUBLIC_ROUTES).toEqual([
      '/',
      '/signin',
      '/signup',
      '/about',
      '/contact',
      '/pricing',
    ]);
  });

  test('PROTECTED_ROUTES contains /account', () => {
    expect(authRoutes.PROTECTED_ROUTES).toEqual(['/account']);
  });
});

describe('docs.ts', () => {
  test('docsCategories structure and values', () => {
    expect(Array.isArray(docs.docsCategories)).toBe(true);
    docs.docsCategories.forEach(category => {
      expect(typeof category.title).toBe('string');
      expect(Array.isArray(category.items)).toBe(true);
      category.items.forEach(item => {
        expect(typeof item.title).toBe('string');
        expect(typeof item.href).toBe('string');
      });
    });
  });

  test('sampleContent contains quick-start and installation', () => {
    expect(docs.sampleContent['quick-start'].title).toBe('Quick Start Guide');
    expect(typeof docs.sampleContent['quick-start'].content).toBe('string');
    expect(docs.sampleContent.installation.title).toBe('Installation');
    expect(typeof docs.sampleContent.installation.content).toBe('string');
  });
});

describe('email-template.ts', () => {
  test('TwoFactorEmail returns correct HTML with code and userName', () => {
    const html = TwoFactorEmail({ code: '123456', userName: 'TestUser' });
    expect(html).toContain('123456');
    expect(html).toContain('Hello TestUser!');
    expect(html).toContain('Your Login Code');
    expect(html).toContain('SaaSCandy');
    expect(html).toContain(new Date().getFullYear().toString());
  });

  test('TwoFactorEmail returns correct HTML without userName', () => {
    const html = TwoFactorEmail({ code: '654321' });
    expect(html).toContain('654321');
    expect(html).toContain('Hello!');
  });

  test('VerificationEmail returns correct HTML with verificationUrl', () => {
    const url = 'https://test.com/verify';
    const html = VerificationEmail({ verificationUrl: url });
    expect(html).toContain(url);
    expect(html).toContain('Verify Your Email Address');
    expect(html).toContain('Welcome to SaaSCandy');
    expect(html).toContain(new Date().getFullYear().toString());
  });

  test('ResetPasswordEmail returns correct HTML with resetUrl', () => {
    const url = 'https://test.com/reset';
    const html = ResetPasswordEmail({ resetUrl: url });
    expect(html).toContain(url);
    expect(html).toContain('Reset Your Password');
    expect(html).toContain('Password Reset Request');
    expect(html).toContain(new Date().getFullYear().toString());
  });
});
describe('constants', () => {
  test('portfolio features and docs are arrays of strings/objects', () => {
    expect(Array.isArray(portfolio.features)).toBe(true);
    expect(portfolio.features.every(f => typeof f === 'string')).toBe(true);

    expect(Array.isArray(portfolio.docs)).toBe(true);
    portfolio.docs.forEach(doc => {
      expect(typeof doc.title).toBe('string');
      expect(typeof doc.description).toBe('string');
      expect(doc.icon).toBeDefined();
    });
  });

  test('appCategories is array of objects with required fields', () => {
    expect(Array.isArray(appCategories.appCategories)).toBe(true);
    appCategories.appCategories.forEach(cat => {
      expect(typeof cat.title).toBe('string');
      expect(typeof cat.description).toBe('string');
      expect(cat.icon).toBeDefined();
      expect(typeof cat.href).toBe('string');
    });
  });

  test('AUTH_PROVIDERS is array of objects with id, name, icon, variant', () => {
    expect(Array.isArray(authProvider.AUTH_PROVIDERS)).toBe(true);
    authProvider.AUTH_PROVIDERS.forEach(p => {
      expect(typeof p.id).toBe('string');
      expect(typeof p.name).toBe('string');
      expect(p.icon).toBeDefined();
      expect(typeof p.variant).toBe('string');
    });
  });

  test('ROUTES contains expected keys and values', () => {
    expect(typeof authRoutes.ROUTES).toBe('object');
    expect(authRoutes.ROUTES.SIGN_IN).toBe('/signin');
    expect(authRoutes.ROUTES.HOME).toBe('/');
  });

  test('POSTS is array of blog posts with required fields', () => {
    expect(Array.isArray(blogPost.POSTS)).toBe(true);
    blogPost.POSTS.forEach(post => {
      expect(typeof post.slug).toBe('string');
      expect(typeof post.title).toBe('string');
      expect(typeof post.excerpt).toBe('string');
      expect(typeof post.image).toBe('string');
      expect(typeof post.date).toBe('string');
      expect(typeof post.readTime).toBe('string');
      expect(Array.isArray(post.tags)).toBe(true);
      expect(typeof post.author.name).toBe('string');
      expect(typeof post.author.avatar).toBe('string');
    });
  });

  test('docsCategories is array of objects with title and items', () => {
    expect(Array.isArray(docs.docsCategories)).toBe(true);
    docs.docsCategories.forEach(cat => {
      expect(typeof cat.title).toBe('string');
      expect(Array.isArray(cat.items)).toBe(true);
      cat.items.forEach(item => {
        expect(typeof item.title).toBe('string');
        expect(typeof item.href).toBe('string');
      });
    });
  });

  test('faqData is array of FAQ items', () => {
    expect(Array.isArray(faq.faqData)).toBe(true);
    faq.faqData.forEach(item => {
      expect(typeof item.question).toBe('string');
      expect(typeof item.answer).toBe('string');
    });
  });

  test('pricingPlans is array of plans with required fields', () => {
    expect(Array.isArray(pricingPlan.pricingPlans)).toBe(true);
    pricingPlan.pricingPlans.forEach(plan => {
      expect(typeof plan.name).toBe('string');
      expect(typeof plan.price).toBe('number');
      expect(typeof plan.description).toBe('string');
      expect(Array.isArray(plan.features)).toBe(true);
    });
  });

  test('services is array of service objects', () => {
    expect(Array.isArray(service.services)).toBe(true);
    service.services.forEach(s => {
      expect(typeof s.slug).toBe('string');
      expect(typeof s.title).toBe('string');
      expect(typeof s.subtitle).toBe('string');
      expect(typeof s.description).toBe('string');
      expect(typeof s.whatItDoes.title).toBe('string');
      expect(typeof s.whatItDoes.description).toBe('string');
      expect(typeof s.whatItDoes.image).toBe('string');
      expect(Array.isArray(s.features)).toBe(true);
    });
  });

  test('NAV_LINKS and SOCIAL_LINKS are arrays with correct structure', () => {
    expect(Array.isArray(navLink.NAV_LINKS)).toBe(true);
    navLink.NAV_LINKS.forEach(link => {
      expect(typeof link.href).toBe('string');
      expect(typeof link.label).toBe('string');
    });
    expect(Array.isArray(navLink.SOCIAL_LINKS)).toBe(true);
    navLink.SOCIAL_LINKS.forEach(link => {
      expect(typeof link.href).toBe('string');
      expect(typeof link.label).toBe('string');
      expect(link.icon).toBeDefined();
    });
  });

  test('messages exports expected objects', () => {
    expect(typeof messages.AUTH_MESSAGES).toBe('object');
    expect(typeof messages.NETWORK_MESSAGES).toBe('object');
    expect(typeof messages.VALIDATION_MESSAGES).toBe('object');
    expect(typeof messages.GENERAL_MESSAGES).toBe('object');
    expect(typeof messages.TOAST_MESSAGES).toBe('object');
  });
});
