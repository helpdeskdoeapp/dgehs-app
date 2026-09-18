import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ensureDatabaseSeeded } from '@/lib/seed-mongodb';
import Hospital from '@/lib/models/Hospital';

export async function GET() {
  try {
    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json({
        success: false,
        error: 'MongoDB Atlas connection is required'
      }, { status: 500 });
    }

    await ensureDatabaseSeeded();
    const hospitals = await Hospital.find();

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
