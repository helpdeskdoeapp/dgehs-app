import { NextResponse } from 'next/server';
import { getNeonUserClaims, saveNeonUserClaim } from '@/lib/neon';
import { getCurrentUserSession } from '@/lib/auth-server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const auth = await getCurrentUserSession();

    if (!auth.isLoggedIn || !auth.user?.email) {
      return NextResponse.json({
        success: true,
        isLoggedIn: false,
        count: 0,
        data: []
      });
    }

    const claims = await getNeonUserClaims(auth.user.email);
    return NextResponse.json({
      success: true,
      isLoggedIn: true,
      count: claims.length,
      data: claims
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
        { success: false, error: 'Authentication required. Please sign in to save or submit claims.' },
        { status: 401 }
      );
    }

    const { claimId, title, status, formData } = await request.json();
    const claim = await saveNeonUserClaim(auth.user.email, { claimId, title, status, formData });

    return NextResponse.json({
      success: true,
      message: `Claim ${status === 'SUBMITTED' ? 'submitted' : 'draft saved'} to Neon DB!`,
      data: claim
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
