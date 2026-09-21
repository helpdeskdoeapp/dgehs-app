import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import GithubProvider from 'next-auth/providers/github';
import FacebookProvider from 'next-auth/providers/facebook';
import TwitterProvider from 'next-auth/providers/twitter';
import CredentialsProvider from 'next-auth/providers/credentials';
import { parseGovEmail, createDefaultProfileFromGovEmail } from '@/lib/auth-helpers';
import { getNeonUserProfile, upsertNeonUserProfile } from '@/lib/neon';

export const authOptions: NextAuthOptions = {
  providers: [
    // 1. Google OAuth (Accepts ANY personal Gmail, Google Workspace, or custom domain account)
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

    // 5. Universal Direct Email & Passwordless Provider (Accepts ANY valid email address)
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
        return {
          id: parsed.employeeId,
          email: parsed.email,
          name: displayName
        };
      }
    })
  ],
  callbacks: {
    async signIn({ user }) {
      const email = user.email || '';
      if (!email) return true;

      const parsed = parseGovEmail(email);
      try {
        const existing = await getNeonUserProfile(email);
        if (!existing) {
          const defaultProf = createDefaultProfileFromGovEmail(parsed, user.name || undefined);
          await upsertNeonUserProfile(email, defaultProf);
          console.log(`✅ Synced new user profile into Neon DB for: ${email}`);
        }
      } catch (err) {
        console.warn('Neon DB sign-in sync warning:', err);
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user && user.email) {
        const parsed = parseGovEmail(user.email);
        token.employeeId = parsed.employeeId;
        token.firstName = parsed.firstName;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).employeeId = token.employeeId;
        (session.user as any).firstName = token.firstName;

        // Retrieve latest Neon DB profile
        try {
          if (session.user.email) {
            const profile = await getNeonUserProfile(session.user.email);
            if (profile) {
              (session as any).profile = profile;
            }
          }
        } catch (e) {
          console.warn('Neon DB session fetch warning:', e);
        }
      }
      return session;
    }
  },
  pages: {
    signIn: '/',
    error: '/'
  },
  secret: process.env.NEXTAUTH_SECRET || 'dgehs_delhi_gov_secret_key_2026_neon_vercel',
  session: { strategy: 'jwt' }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
