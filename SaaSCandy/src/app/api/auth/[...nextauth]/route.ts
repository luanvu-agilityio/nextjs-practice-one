import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';

import type { NextAuthOptions, User as NextAuthUser, Session } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import { AuthUser, User } from '@/types';
import { authApi } from '@/api';

interface AuthResponse {
  user: {
    id?: string;
    email?: string;
    name?: string;
    firstName?: string;
    lastName?: string;
  };
  token?: string;
}

type ExtendedJWT = JWT & {
  user?: NextAuthUser & { firstName?: string; lastName?: string };
  accessToken?: string;
};

export const authOptions: NextAuthOptions = {
  providers: [
    // Credentials Provider
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const response = (await authApi.login({
            email: credentials.email,
            password: credentials.password,
          })) as AuthResponse | null;

          if (!response?.user) {
            return null;
          }

          const { user, token } = response;

          const nextAuthUser: NextAuthUser & {
            firstName?: string;
            lastName?: string;
          } = {
            id: user.id || user.email || '',
            name: user.name,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
          };

          // Attach backend token
          (nextAuthUser as unknown as { token?: string }).token = token;

          return nextAuthUser;
        } catch (error) {
          console.error('NextAuth authorize error:', error);
          return null;
        }
      },
    }),

    // Google Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // GitHub Provider
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 0, // Force session update on every request
  },

  callbacks: {
    async jwt({
      token,
      user,
      account,
      trigger,
      session,
    }): Promise<ExtendedJWT> {
      const extendedToken = token as ExtendedJWT;

      // Handle first-time login
      if (user) {
        extendedToken.user = {
          id: user.id,
          name: user.name,
          email: user.email,
          firstName: (user as User).firstName,
          lastName: (user as User).lastName,
        };

        // Store backend token from credentials login
        const backendToken = (user as AuthUser).token;
        if (typeof backendToken === 'string') {
          extendedToken.accessToken = backendToken;
        }
      }

      // Handle session update trigger (when update() is called)
      if (trigger === 'update' && session) {
        if (session.user) {
          extendedToken.user = {
            ...extendedToken.user,
            ...session.user,
          };
          extendedToken.lastUpdated = Date.now();
        }

        if (extendedToken.user?.id) {
          try {
            const freshUser = await authApi.getUser(extendedToken.user.id);
            extendedToken.user = {
              ...extendedToken.user,
              id: freshUser.id,
              name: freshUser.name,
              email: freshUser.email,
              firstName: freshUser.firstName,
              lastName: freshUser.lastName,
            };
            extendedToken.lastUpdated = Date.now();
          } catch (error) {
            console.error(
              'Failed to fetch fresh user data in JWT callback:',
              error
            );
          }
        }
      }

      // Handle social login
      if (account && account.provider !== 'credentials') {
        // You might want to create or fetch user from your backend here
        extendedToken.accessToken = account.access_token;
      }

      return extendedToken;
    },

    async session({ session, token }): Promise<Session> {
      const extendedSession = session as Session & {
        accessToken?: string;
        user?: NextAuthUser & { firstName?: string; lastName?: string };
      };

      if (token.user) {
        const extendedToken = token as ExtendedJWT;
        extendedSession.user = {
          id: extendedToken.user?.id || '',
          name: extendedToken.user?.name || null,
          email: extendedToken.user?.email || null,
          image: extendedToken.user?.image || null,
          firstName: extendedToken.user?.firstName,
          lastName: extendedToken.user?.lastName,
        };
      }

      if ((token as ExtendedJWT).accessToken) {
        extendedSession.accessToken = (token as ExtendedJWT).accessToken;
      }

      return extendedSession;
    },
  },

  pages: {
    signIn: '/signin',
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
