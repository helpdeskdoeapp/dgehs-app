import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getNeonUserProfile, upsertNeonUserProfile } from '@/lib/neon';
import { parseGovEmail, createDefaultProfileFromGovEmail } from '@/lib/auth-helpers';

export const dynamic = 'force-dynamic';

const DEFAULT_EMAIL = '98241.rajesh@doe.delhi.gov.in';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('dgehs_session');
    let email = DEFAULT_EMAIL;

    if (sessionCookie && sessionCookie.value) {
      try {
        const session = JSON.parse(sessionCookie.value);
        if (session.email) email = session.email;
      } catch (e) {
        // fallback
      }
    }

    let profile = await getNeonUserProfile(email);
    if (!profile) {
      const parsed = parseGovEmail(email);
      const defaultProf = createDefaultProfileFromGovEmail(parsed);
      profile = await upsertNeonUserProfile(email, defaultProf);
    }

    return NextResponse.json({
      success: true,
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
    const updatedProfile = await request.json();
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('dgehs_session');
    let email = updatedProfile.email || DEFAULT_EMAIL;

    if (sessionCookie && sessionCookie.value) {
      try {
        const session = JSON.parse(sessionCookie.value);
        if (session.email) email = session.email;
      } catch (e) {
        // fallback
      }
    }

    const savedProfile = await upsertNeonUserProfile(email, updatedProfile);

    return NextResponse.json({
      success: true,
      message: 'Employee profile updated in Neon DB (PostgreSQL)!',
      data: savedProfile
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
