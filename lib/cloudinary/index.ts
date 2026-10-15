import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary server-side
const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

export const isCloudinaryConfigured = Boolean(cloudName && apiKey && apiSecret);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

export { cloudinary };

/**
 * Generate optimized Cloudinary URLs with f_auto, q_auto and transformations.
 */
export function getOptimizedUrl(
  publicIdOrUrl: string,
  options?: {
    width?: number;
    height?: number;
    crop?: 'fill' | 'fit' | 'thumb' | 'scale' | 'limit';
    aspectRatio?: string;
  }
): string {
  if (!publicIdOrUrl) return '';

  // If Cloudinary isn't configured or input is an external URL not from Cloudinary
  if (!isCloudinaryConfigured && (publicIdOrUrl.startsWith('http://') || publicIdOrUrl.startsWith('https://'))) {
    // For demo external images (e.g. Unsplash), provide responsive query params if applicable
    if (publicIdOrUrl.includes('images.unsplash.com')) {
      const url = new URL(publicIdOrUrl);
      if (options?.width) url.searchParams.set('w', options.width.toString());
      if (options?.height) url.searchParams.set('h', options.height.toString());
      url.searchParams.set('auto', 'format');
      url.searchParams.set('fit', 'crop');
      url.searchParams.set('q', '80');
      return url.toString();
    }
    return publicIdOrUrl;
  }

  // If it's a Cloudinary public ID or Cloudinary URL
  if (isCloudinaryConfigured) {
    try {
      const transform: Record<string, any> = {
        fetch_format: 'auto',
        quality: 'auto',
      };

      if (options?.width) transform.width = options.width;
      if (options?.height) transform.height = options.height;
      if (options?.crop) transform.crop = options.crop;
      if (options?.aspectRatio) transform.aspect_ratio = options.aspectRatio;

      return cloudinary.url(publicIdOrUrl, transform);
    } catch (e) {
      console.warn('Error generating cloudinary URL:', e);
      return publicIdOrUrl;
    }
  }

  return publicIdOrUrl;
}

/**
 * Helper to build standard thumbnail
 */
export function getThumbnailUrl(publicIdOrUrl: string): string {
  return getOptimizedUrl(publicIdOrUrl, {
    width: 600,
    height: 400,
    crop: 'fill',
  });
}

/**
 * Helper to build high-res preview
 */
export function getPreviewUrl(publicIdOrUrl: string): string {
  return getOptimizedUrl(publicIdOrUrl, {
    width: 1400,
    crop: 'limit',
  });
}
