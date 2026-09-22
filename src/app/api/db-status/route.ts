import { NextResponse } from 'next/server';
import { checkNeonConnection } from '@/lib/neon';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const status = await checkNeonConnection();
    return NextResponse.json({
      success: true,
      data: status
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
