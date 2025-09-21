import NextAuth, { type NextAuthConfig } from 'next-auth';
import EmailProvider from 'next-auth/providers/email';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import { env } from '@/config/env';

const providers = [
  EmailProvider({
    from: env.EMAIL_FROM ?? 'login@example.com',
    async sendVerificationRequest({ identifier, url }) {
      // eslint-disable-next-line no-console
      console.info(`Magic link for ${identifier}: ${url}`);
    }
  })
];

if (env.NODE_ENV !== 'production') {
  providers.push(
    CredentialsProvider({
      name: 'Demo',
      credentials: {
        email: { label: 'Email', type: 'text', placeholder: 'demo@example.com' },
        token: { label: 'Token', type: 'password', placeholder: 'demo' }
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          return null;
        }
        const token = credentials.token ?? '';
        const expected = process.env.DEMO_LOGIN_TOKEN ?? 'demo';
        if (token === expected) {
          return { id: `demo-${credentials.email}`, email: credentials.email, name: 'Demo User' };
        }
        return null;
      }
    })
  );
}

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'database'
  },
  secret: env.NEXTAUTH_SECRET,
  providers,
  pages: {
    signIn: `/${env.DEFAULT_LOCALE}/auth/signin`
  },
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    }
  }
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
