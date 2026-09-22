import { NextResponse } from 'next/server';
import { getNeonUserProfile, upsertNeonUserProfile } from '@/lib/neon';
import { getCurrentUserSession } from '@/lib/auth-server';
import { parseGovEmail, createDefaultProfileFromGovEmail } from '@/lib/auth-helpers';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const auth = await getCurrentUserSession();

    if (!auth.isLoggedIn || !auth.user?.email) {
      return NextResponse.json({
        success: true,
        isLoggedIn: false,
        data: null,
        message: 'No active session. Please sign in.'
      });
    }

    const email = auth.user.email;
    let profile = await getNeonUserProfile(email);

    if (!profile) {
      const parsed = parseGovEmail(email);
      const defaultProf = createDefaultProfileFromGovEmail(parsed, auth.user.name || undefined);
      profile = await upsertNeonUserProfile(email, defaultProf);
    }

    return NextResponse.json({
      success: true,
      isLoggedIn: true,
      user: auth.user,
      data: profile
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getCurrentUserSession();

    if (!auth.isLoggedIn || !auth.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Authentication required. Please sign in with Google or Email to save your profile.' },
        { status: 401 }
      );
    }

    const updatedProfile = await request.json();
    const email = auth.user.email;

    // Securely tie profile to authenticated user's email
    const cleanProfile = {
      ...updatedProfile,
      email: email
    };

    const savedProfile = await upsertNeonUserProfile(email, cleanProfile);
    const hasDbUrl = !!process.env.DATABASE_URL || !!process.env.POSTGRES_URL || !!process.env.NEON_DATABASE_URL;

    return NextResponse.json({
      success: true,
      isLoggedIn: true,
      storage: hasDbUrl ? 'Neon DB (PostgreSQL - user_profiles table)' : 'Local JSON Fallback',
      message: hasDbUrl
        ? 'Employee profile saved successfully to Neon DB (user_profiles table)!'
        : 'Employee profile saved locally (DATABASE_URL not configured).',
      data: savedProfile
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
