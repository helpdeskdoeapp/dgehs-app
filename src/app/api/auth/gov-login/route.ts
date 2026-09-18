import { NextResponse } from 'next/server';
import { parseGovEmail, createDefaultProfileFromGovEmail } from '@/lib/auth-helpers';
import { connectToDatabase } from '@/lib/mongodb';
import UserProfile from '@/lib/models/UserProfile';
import { localDb } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    const parsed = parseGovEmail(email);

    if (!parsed.isValid) {
      return NextResponse.json(
        { success: false, error: parsed.errorMessage || 'Invalid email address' },
        { status: 400 }
      );
    }

    let profileData = null;
    const db = await connectToDatabase();

    if (db) {
      // Query MongoDB Atlas
      let user = await UserProfile.findOne({ email: parsed.email });
      if (!user) {
        const defaultProf = createDefaultProfileFromGovEmail(parsed);
        user = await UserProfile.create({
          ...defaultProf
        });
      }
      profileData = user.toObject();
    } else {
      // Local DB Fallback
      profileData = localDb.getMockProfile();
      profileData.employeeId = parsed.employeeId;
      profileData.email = parsed.email;
      profileData.employeeName = `${parsed.firstName.toUpperCase()} KUMAR`;
    }

    const sessionPayload = {
      isLoggedIn: true,
      email: parsed.email,
      employeeId: parsed.employeeId,
      firstName: parsed.firstName,
      profile: profileData
    };

    const response = NextResponse.json({
      success: true,
      message: `Welcome ${parsed.firstName}! Logged in as ${parsed.email}`,
      session: sessionPayload
    });

    // Set HTTP session cookie
    response.cookies.set('dgehs_session', JSON.stringify(sessionPayload), {
      httpOnly: false,
      secure: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
