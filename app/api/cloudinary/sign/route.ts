import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { isCloudinaryConfigured } from '@/lib/cloudinary';

export async function POST(req: Request) {
  try {
    if (!isCloudinaryConfigured) {
      return NextResponse.json(
        {
          configured: false,
          error: 'Cloudinary is not configured on the server. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.',
        },
        { status: 200 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = body.folder || 'momento_memories';

    // Parameters to sign
    const paramsToSign = {
      folder,
      timestamp,
    };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET!
    );

    return NextResponse.json({
      configured: true,
      signature,
      timestamp,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      folder,
    });
  } catch (error: any) {
    console.error('Error generating Cloudinary signature:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to sign upload request' },
      { status: 500 }
    );
  }
}
