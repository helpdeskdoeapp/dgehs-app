import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ensureDatabaseSeeded } from '@/lib/seed-mongodb';
import RateItem from '@/lib/models/RateItem';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '35', 10);

    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json({
        success: false,
        error: 'MongoDB Atlas connection is required'
      }, { status: 500 });
    }

    await ensureDatabaseSeeded();

    if (!query.trim()) {
      const items = await RateItem.find().limit(limit);
      return NextResponse.json({
        success: true,
        count: items.length,
        data: items
      });
    }

    const cleanQuery = query.trim();
    const isCodeSearch = /^[a-zA-Z]{1,3}\d*/.test(cleanQuery);

    let items = [];
    if (isCodeSearch) {
      items = await RateItem.find({
        alphanumeric_code: { $regex: cleanQuery, $options: 'i' }
      }).limit(limit);
    }

    if (items.length === 0) {
      items = await RateItem.find({
        cghs_treatment_procedure_investigation_list: { $regex: cleanQuery, $options: 'i' }
      }).limit(limit);
    }

    return NextResponse.json({
      success: true,
      query: cleanQuery,
      count: items.length,
      data: items
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
