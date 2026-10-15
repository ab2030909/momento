import { NextResponse } from 'next/server';
import { getAllAssets, createOrUpdateAsset } from '@/lib/data/storage';
import { analyzeImage } from '@/lib/ai/vision';
import { getThumbnailUrl, getPreviewUrl } from '@/lib/cloudinary';
import { VisualAsset } from '@/types';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const collectionId = searchParams.get('collectionId');
    const userId = req.headers.get('x-user-id') || searchParams.get('userId') || undefined;

    let assets = getAllAssets(userId);
    if (category && category !== 'all') {
      assets = assets.filter((a) => a.category === category);
    }
    if (collectionId) {
      assets = assets.filter((a) => a.collectionIds?.includes(collectionId));
    }

    return NextResponse.json({ assets });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      originalFilename,
      secureUrl,
      cloudinaryPublicId,
      width = 1200,
      height = 800,
      format = 'jpg',
      bytes = 0,
      collectionIds = [],
      userId,
    } = body;

    const authenticatedUserId = req.headers.get('x-user-id') || userId;
    if (!authenticatedUserId) {
      return NextResponse.json(
        { error: 'ACCESS DENIED: Authentication required to upload visual memories.' },
        { status: 401 }
      );
    }

    if (!secureUrl) {
      return NextResponse.json({ error: 'secureUrl is required' }, { status: 400 });
    }

    const id = `asset-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    // Build optimized preview & thumb
    const thumbnailUrl = cloudinaryPublicId
      ? getThumbnailUrl(cloudinaryPublicId)
      : secureUrl;
    const previewUrl = cloudinaryPublicId
      ? getPreviewUrl(cloudinaryPublicId)
      : secureUrl;

    // Run deep visual content understanding pipeline (OCR + visual objects + scene reasoning)
    const analysis = await analyzeImage(secureUrl, originalFilename || 'image');

    // Build asset with extracted visual tags and scene entities
    const newAsset: VisualAsset = {
      id,
      originalFilename: originalFilename || 'Untitled Memory',
      cloudinaryPublicId,
      secureUrl,
      thumbnailUrl,
      previewUrl,
      width,
      height,
      format,
      bytes,
      createdAt: new Date().toISOString(),
      category: analysis.category,
      tags: analysis.tags,
      description: analysis.description,
      ocrText: analysis.ocrText,
      status: 'ready',
      statusMessage: `Analyzed via ${analysis.provider}`,
      collectionIds,
      isDemo: false,
      userId: userId || undefined,
    };

    createOrUpdateAsset(newAsset);

    return NextResponse.json({ asset: newAsset });
  } catch (error: any) {
    console.error('Error creating asset:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
