import { NextResponse } from 'next/server';
import { searchNeonRateItems } from '@/lib/neon';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '35', 10);

    const items = await searchNeonRateItems(query, limit);

    return NextResponse.json({
      success: true,
      query: query.trim(),
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
