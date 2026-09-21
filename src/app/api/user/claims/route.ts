import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getNeonUserClaims, saveNeonUserClaim } from '@/lib/neon';

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

    const claims = await getNeonUserClaims(email);
    return NextResponse.json({
      success: true,
      count: claims.length,
      data: claims
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
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

    const { claimId, title, status, formData } = await request.json();
    const claim = await saveNeonUserClaim(email, { claimId, title, status, formData });

    return NextResponse.json({
      success: true,
      message: `Claim ${status === 'SUBMITTED' ? 'submitted' : 'draft saved'} to Neon DB!`,
      data: claim
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
