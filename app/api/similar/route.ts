import { NextResponse } from 'next/server';
import { getAllAssets, getAssetById } from '@/lib/data/storage';
import { findSimilarAssets } from '@/lib/search/engine';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const assetId = searchParams.get('assetId');

    if (!assetId) {
      return NextResponse.json({ error: 'assetId is required' }, { status: 400 });
    }

    const target = getAssetById(assetId);
    if (!target) {
      return NextResponse.json({ error: 'Target asset not found' }, { status: 404 });
    }

    const userId = req.headers.get('x-user-id') || searchParams.get('userId') || undefined;
    const allAssets = getAllAssets(userId);
    const similar = findSimilarAssets(target, allAssets);

    return NextResponse.json({
      target,
      similar,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
