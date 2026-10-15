import { NextResponse } from 'next/server';
import { getAllAssets } from '@/lib/data/storage';
import { searchAssets } from '@/lib/search/engine';
import { SearchFilter } from '@/types';

export async function POST(req: Request) {
  try {
    const filter: SearchFilter = await req.json();
    const userId = req.headers.get('x-user-id') || undefined;
    const assets = getAllAssets(userId);
    const results = await searchAssets(assets, filter);

    return NextResponse.json({
      results,
      count: results.length,
      query: filter.query || '',
    });
  } catch (error: any) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
