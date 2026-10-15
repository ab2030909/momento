import { NextResponse } from 'next/server';
import { getAssetById, deleteAsset, createOrUpdateAsset } from '@/lib/data/storage';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const asset = getAssetById(id);
  if (!asset) {
    return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
  }
  return NextResponse.json({ asset });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const asset = getAssetById(id);
  if (!asset) {
    return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
  }

  const updates = await req.json();
  const updatedAsset = createOrUpdateAsset({
    ...asset,
    ...updates,
    id: asset.id, // prevent ID change
  });

  return NextResponse.json({ asset: updatedAsset });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const success = deleteAsset(id);
  return NextResponse.json({ success });
}
