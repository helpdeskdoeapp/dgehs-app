import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import GithubProvider from 'next-auth/providers/github';
import FacebookProvider from 'next-auth/providers/facebook';
import TwitterProvider from 'next-auth/providers/twitter';
import CredentialsProvider from 'next-auth/providers/credentials';
import { parseGovEmail, createDefaultProfileFromGovEmail } from '@/lib/auth-helpers';
import { getNeonUserProfile, upsertNeonUserProfile } from '@/lib/neon';
import crypto from 'crypto';

export const authOptions: NextAuthOptions = {
  providers: [
    // 1. Google OAuth
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || 'DUMMY_GOOGLE_CLIENT_ID',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'DUMMY_GOOGLE_CLIENT_SECRET',
      allowDangerousEmailAccountLinking: true,
    }),

    // 2. GitHub OAuth
    GithubProvider({
      clientId: process.env.GITHUB_ID || process.env.GITHUB_CLIENT_ID || 'DUMMY_GITHUB_ID',
      clientSecret: process.env.GITHUB_SECRET || process.env.GITHUB_CLIENT_SECRET || 'DUMMY_GITHUB_SECRET',
      allowDangerousEmailAccountLinking: true,
    }),

    // 3. Facebook OAuth
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID || 'DUMMY_FACEBOOK_CLIENT_ID',
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || 'DUMMY_FACEBOOK_CLIENT_SECRET',
      allowDangerousEmailAccountLinking: true,
    }),

    // 4. X / Twitter OAuth (v2.0)
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID || process.env.X_CLIENT_ID || 'DUMMY_TWITTER_ID',
      clientSecret: process.env.TWITTER_CLIENT_SECRET || process.env.X_CLIENT_SECRET || 'DUMMY_TWITTER_SECRET',
      version: '2.0',
    }),

    // 5. Universal Direct Email & Passwordless Provider
    CredentialsProvider({
      id: 'email-login',
      name: 'Universal Email Login',
      credentials: {
        email: { label: 'Email Address', type: 'email', placeholder: 'yourname@example.com' },
        name: { label: 'Full Name', type: 'text', placeholder: 'Full Name (Optional)' }
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;
        const parsed = parseGovEmail(credentials.email);
        if (!parsed.isValid) {
          throw new Error(parsed.errorMessage || 'Invalid email address');
        }

        const displayName = credentials.name?.trim() || `${parsed.firstName} Kumar`;
        const userUuid = crypto.randomUUID();
        return {
          id: userUuid,
          email: parsed.email,
          name: displayName
        };
      }
    })
  ],
  callbacks: {
    async signIn({ user }) {
      const email = (user.email || '').trim().toLowerCase();
      if (!email) return false;

      try {
        const existing = await getNeonUserProfile(email);
        if (!existing) {
          const parsed = parseGovEmail(email);
          const defaultProf = createDefaultProfileFromGovEmail(parsed, user.name || undefined);
          await upsertNeonUserProfile(email, defaultProf);
          console.log(`✅ Initialized new user profile in Neon DB for: ${email}`);
        }
      } catch (err) {
        console.warn('Neon DB sign-in sync warning:', err);
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id || crypto.randomUUID();
        token.email = (user.email || '').toLowerCase().trim();
        token.name = user.name || token.name;
        if (user.image) {
          token.picture = user.image;
        }
      }
      if (!token.userId) {
        token.userId = crypto.randomUUID();
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const cleanEmail = (token.email || session.user.email || '').toLowerCase().trim();
        (session.user as any).id = token.userId || token.sub || crypto.randomUUID();
        session.user.email = cleanEmail;
        session.user.name = token.name || session.user.name;
        if (token.picture) {
          session.user.image = token.picture as string;
        }

        // Attach isolated Neon DB profile for this user
        if (cleanEmail) {
          try {
            const profile = await getNeonUserProfile(cleanEmail);
            if (profile) {
              (session as any).profile = profile;
            }
          } catch (e) {
            console.warn('Neon DB session fetch warning:', e);
          }
        }
      }
      return session;
    }
  },
  pages: {
    signIn: '/',
    error: '/'
  },
  secret: process.env.NEXTAUTH_SECRET || 'dgehs_delhi_gov_secret_key_2026_production_strong_secret',
  session: { strategy: 'jwt' }
};
