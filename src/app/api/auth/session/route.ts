import { NextResponse } from 'next/server';
import { getCurrentUserSession } from '@/lib/auth-server';
import { getNeonUserProfile } from '@/lib/neon';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const auth = await getCurrentUserSession();

    if (!auth.isLoggedIn || !auth.user) {
      return NextResponse.json({
        isLoggedIn: false,
        session: null
      });
    }

    // Refresh user's Neon DB profile
    let profile = auth.profile;
    if (!profile && auth.user.email) {
      profile = await getNeonUserProfile(auth.user.email);
    }

    return NextResponse.json({
      isLoggedIn: true,
      session: {
        user: auth.user,
        profile: profile || null,
        source: auth.source
      }
    });
  } catch (error) {
    return NextResponse.json({
      isLoggedIn: false,
      session: null
    });
  }
}
