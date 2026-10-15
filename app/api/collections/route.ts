import { NextResponse } from 'next/server';
import { getAllCollections, createCollection, toggleAssetCollection } from '@/lib/data/storage';

export async function GET() {
  try {
    const collections = getAllCollections();
    return NextResponse.json({ collections });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description } = body;
    if (!name?.trim()) {
      return NextResponse.json({ error: 'Collection name is required' }, { status: 400 });
    }
    const col = createCollection(name.trim(), description || '');
    return NextResponse.json({ collection: col });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { assetId, collectionId } = body;
    if (!assetId || !collectionId) {
      return NextResponse.json({ error: 'assetId and collectionId required' }, { status: 400 });
    }
    const updated = toggleAssetCollection(assetId, collectionId);
    return NextResponse.json({ asset: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
