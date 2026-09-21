import { NextResponse } from 'next/server';
import { getNeonHospitals } from '@/lib/neon';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const hospitals = await getNeonHospitals();
    return NextResponse.json({
      success: true,
      count: hospitals.length,
      data: hospitals
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
