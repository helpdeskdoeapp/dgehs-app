import { getServerSession } from 'next-auth/next';
import { cookies } from 'next/headers';
import { authOptions } from '@/lib/auth-options';
import { UserSessionResult } from '@/lib/auth-helpers';
import crypto from 'crypto';

/**
 * Server-only helper to retrieve the current authenticated user session across NextAuth and cookie fallbacks.
 */
export async function getCurrentUserSession(): Promise<UserSessionResult> {
  // 1. Try NextAuth session
  try {
    const nextAuthSession = await getServerSession(authOptions);
    if (nextAuthSession?.user?.email) {
      const email = nextAuthSession.user.email.trim().toLowerCase();
      const userId = (nextAuthSession.user as any).id || crypto.randomUUID();
      return {
        isLoggedIn: true,
        user: {
          id: userId,
          email: email,
          name: nextAuthSession.user.name || 'Official',
          image: nextAuthSession.user.image || null,
        },
        profile: (nextAuthSession as any).profile || null,
        source: 'nextauth'
      };
    }
  } catch (e) {
    // Fallback to cookie
  }

  // 2. Try custom cookie (dgehs_session)
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('dgehs_session');
    if (sessionCookie && sessionCookie.value) {
      const parsedCookie = JSON.parse(sessionCookie.value);
      if (parsedCookie && parsedCookie.email) {
        const email = parsedCookie.email.trim().toLowerCase();
        return {
          isLoggedIn: true,
          user: {
            id: parsedCookie.userId || parsedCookie.employeeId || crypto.randomUUID(),
            email: email,
            name: parsedCookie.name || parsedCookie.firstName || 'Official',
            image: null,
          },
          profile: parsedCookie.profile || null,
          source: 'cookie'
        };
      }
    }
  } catch (e) {
    // Not authenticated
  }

  return {
    isLoggedIn: false,
    user: null,
    profile: null,
    source: null
  };
}
