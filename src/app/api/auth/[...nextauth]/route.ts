import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { connectToDatabase } from '@/lib/mongodb';
import UserProfile from '@/lib/models/UserProfile';
import { parseGovEmail, createDefaultProfileFromGovEmail } from '@/lib/auth-helpers';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || 'DUMMY_GOOGLE_CLIENT_ID',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'DUMMY_GOOGLE_CLIENT_SECRET',
    }),
    // Fallback Credentials Provider for testing employeeid.firstname@doe.delhi.gov.in
    CredentialsProvider({
      id: 'gov-email',
      name: 'Delhi Gov Email',
      credentials: {
        email: { label: 'Gov Email', type: 'email', placeholder: '98241.rajesh@doe.delhi.gov.in' }
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;
        const parsed = parseGovEmail(credentials.email);
        if (!parsed.isValid) throw new Error(parsed.errorMessage || 'Invalid email');
        return {
          id: parsed.employeeId,
          email: parsed.email,
          name: `${parsed.firstName} Kumar`
        };
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      const email = user.email || '';
      const parsed = parseGovEmail(email);

      // Domain restriction check
      if (process.env.NODE_ENV === 'production' && !parsed.isValid) {
        console.warn(`Denied login attempt from unauthorized domain: ${email}`);
        return false;
      }

      try {
        const db = await connectToDatabase();
        if (db && email) {
          let dbUser = await UserProfile.findOne({ email });
          if (!dbUser) {
            const defaultProf = createDefaultProfileFromGovEmail(parsed);
            await UserProfile.create({
              ...defaultProf,
              employeeName: user.name?.toUpperCase() || defaultProf.employeeName
            });
            console.log(`Created new employee profile in MongoDB Atlas for: ${email}`);
          }
        }
      } catch (err) {
        console.warn('MongoDB Atlas sign-in sync warning:', err);
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

        // Fetch latest MongoDB Atlas static profile
        try {
          const db = await connectToDatabase();
          if (db && session.user.email) {
            const dbUser = await UserProfile.findOne({ email: session.user.email });
            if (dbUser) {
              (session as any).profile = dbUser.toObject();
            }
          }
        } catch (e) {
          console.warn('MongoDB session fetch warning:', e);
        }
      }
      return session;
    }
  },
  pages: {
    signIn: '/',
    error: '/'
  },
  secret: process.env.NEXTAUTH_SECRET || 'dgehs_delhi_gov_secret_key_2026',
  session: { strategy: 'jwt' }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
