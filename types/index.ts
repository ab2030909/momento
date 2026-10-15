export type ImageCategory =
  | 'screenshot'
  | 'diagram'
  | 'receipt'
  | 'document'
  | 'product'
  | 'photograph'
  | 'other';

export type ProcessingStatus = 'uploaded' | 'processing' | 'ready' | 'failed';

export interface VisualAsset {
  id: string;
  originalFilename: string;
  cloudinaryPublicId?: string;
  secureUrl: string;
  thumbnailUrl: string;
  previewUrl: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  createdAt: string; // ISO timestamp
  category: ImageCategory;
  tags: string[];
  description: string;
  ocrText?: string;
  embedding?: number[];
  status: ProcessingStatus;
  statusMessage?: string;
  collectionIds: string[];
  isDemo?: boolean;
  userId?: string; // Owner of the asset (for private user vaults)
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  coverAssetId?: string;
  assetCount?: number;
}

export interface SearchFilter {
  query?: string;
  category?: ImageCategory | 'all';
  collectionId?: string;
  status?: ProcessingStatus | 'all';
  dateRange?: 'all' | 'today' | 'week' | 'month' | 'year';
  sortBy?: 'newest' | 'oldest' | 'relevance';
}

export interface SearchResult {
  asset: VisualAsset;
  relevanceScore: number;
  matchReason: string;
  matchType: 'semantic' | 'ocr' | 'keyword' | 'tag' | 'exact';
  highlightSnippet?: string;
}

export interface CloudinarySignatureResponse {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
  uploadPreset?: string;
}

export interface SystemStatus {
  cloudinaryConfigured: boolean;
  cloudName?: string;
  aiConfigured: boolean;
  aiProvider?: string;
  databaseType: string;
  totalAssets: number;
  totalCollections: number;
}
