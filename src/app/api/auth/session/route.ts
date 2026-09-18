import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('dgehs_session');

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({
        isLoggedIn: false,
        session: null
      });
    }

    const session = JSON.parse(sessionCookie.value);
    return NextResponse.json({
      isLoggedIn: true,
      session
    });
  } catch (error) {
    return NextResponse.json({
      isLoggedIn: false,
      session: null
    });
  }
}
