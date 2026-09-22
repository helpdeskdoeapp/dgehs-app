import { NextResponse } from 'next/server';
import { parseGovEmail, createDefaultProfileFromGovEmail } from '@/lib/auth-helpers';
import { getNeonUserProfile, upsertNeonUserProfile } from '@/lib/neon';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json();
    const parsed = parseGovEmail(email);

    if (!parsed.isValid) {
      return NextResponse.json(
        { success: false, error: parsed.errorMessage || 'Invalid email address' },
        { status: 400 }
      );
    }

    // Query or create user profile in Neon DB
    let profileData = await getNeonUserProfile(parsed.email);
    if (!profileData) {
      const defaultProf = createDefaultProfileFromGovEmail(parsed, name);
      profileData = await upsertNeonUserProfile(parsed.email, defaultProf);
    } else if (name && !profileData.employeeName) {
      profileData = await upsertNeonUserProfile(parsed.email, { employeeName: name.toUpperCase() });
    }

    const userUuid = crypto.randomUUID();
    const sessionPayload = {
      isLoggedIn: true,
      userId: userUuid,
      email: parsed.email,
      name: profileData?.employeeName || name || `${parsed.firstName} Kumar`,
      employeeId: profileData?.employeeId || parsed.employeeId,
      firstName: parsed.firstName,
      profile: profileData
    };

    const response = NextResponse.json({
      success: true,
      message: `Welcome, ${profileData?.employeeName || parsed.firstName}!`,
      session: sessionPayload
    });

    // Set session cookie
    response.cookies.set('dgehs_session', JSON.stringify(sessionPayload), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
