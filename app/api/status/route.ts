import { NextResponse } from 'next/server';
import { isCloudinaryConfigured } from '@/lib/cloudinary';
import { isVisionProviderConfigured, getActiveAiProviderName } from '@/lib/ai/vision';
import { getAllAssets, getAllCollections } from '@/lib/data/storage';
import { SystemStatus } from '@/types';

export async function GET() {
  const assets = getAllAssets();
  const collections = getAllCollections();

  const status: SystemStatus = {
    cloudinaryConfigured: isCloudinaryConfigured,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || undefined,
    aiConfigured: isVisionProviderConfigured(),
    aiProvider: getActiveAiProviderName(),
    databaseType: 'JSON Local Persistent Store (Postgres / pgvector compatible schema)',
    totalAssets: assets.length,
    totalCollections: collections.length,
  };

  return NextResponse.json(status);
}
