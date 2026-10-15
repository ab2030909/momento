import fs from 'fs';
import path from 'path';
import { VisualAsset, Collection } from '@/types';
import { INITIAL_COLLECTIONS, INITIAL_DEMO_ASSETS } from './demoData';

// Serverless-resilient data path: Vercel serverless functions have a read-only root (/var/task)
// but allow writing to /tmp.
const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const DATA_DIR = isServerless ? path.join('/tmp', 'momento_data') : path.join(process.cwd(), 'data');
const ASSETS_FILE = path.join(DATA_DIR, 'assets.json');
const COLLECTIONS_FILE = path.join(DATA_DIR, 'collections.json');

// In-memory global fallback to survive read-only or ephemeral environments
let inMemoryAssets: VisualAsset[] = [...INITIAL_DEMO_ASSETS];
let inMemoryCollections: Collection[] = [...INITIAL_COLLECTIONS];

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (e) {
    console.warn('Filesystem read-only, operating in memory:', e);
  }
}

function getRawAllAssets(): VisualAsset[] {
  ensureDataDir();
  try {
    if (!fs.existsSync(ASSETS_FILE)) {
      try {
        fs.writeFileSync(ASSETS_FILE, JSON.stringify(inMemoryAssets, null, 2), 'utf-8');
      } catch {}
      return inMemoryAssets;
    }
    const raw = fs.readFileSync(ASSETS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    inMemoryAssets = parsed;
    return parsed;
  } catch (err) {
    return inMemoryAssets;
  }
}

export function getAllAssets(userId?: string): VisualAsset[] {
  const all = getRawAllAssets();

  // If no user specified or guest user, show demo pictures + guest uploads
  if (!userId || userId === 'guest-user') {
    return all.filter((a) => a.isDemo === true || !a.userId || a.userId === 'guest-user');
  }

  // If authenticated user, show demo pictures + their own uploads + guest uploads
  return all.filter((a) => a.isDemo === true || a.userId === userId || a.userId === 'guest-user');
}

export function saveAllAssets(assets: VisualAsset[]): void {
  inMemoryAssets = assets;
  ensureDataDir();
  try {
    fs.writeFileSync(ASSETS_FILE, JSON.stringify(assets, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Filesystem write prevented, preserved in memory:', err);
  }
}

export function getAssetById(id: string): VisualAsset | undefined {
  const assets = getRawAllAssets();
  return assets.find((a) => a.id === id);
}

export function createOrUpdateAsset(asset: VisualAsset): VisualAsset {
  const assets = getRawAllAssets();
  const index = assets.findIndex((a) => a.id === asset.id);
  if (index >= 0) {
    assets[index] = asset;
  } else {
    assets.unshift(asset);
  }
  saveAllAssets(assets);
  return asset;
}

export function deleteAsset(id: string): boolean {
  const assets = getRawAllAssets();
  const filtered = assets.filter((a) => a.id !== id);
  if (filtered.length !== assets.length) {
    saveAllAssets(filtered);
    return true;
  }
  return false;
}

export function getAllCollections(): Collection[] {
  ensureDataDir();
  try {
    if (!fs.existsSync(COLLECTIONS_FILE)) {
      try {
        fs.writeFileSync(COLLECTIONS_FILE, JSON.stringify(inMemoryCollections, null, 2), 'utf-8');
      } catch {}
      return inMemoryCollections;
    }
    const raw = fs.readFileSync(COLLECTIONS_FILE, 'utf-8');
    const cols: Collection[] = JSON.parse(raw);
    inMemoryCollections = cols;
    const assets = getRawAllAssets();
    return cols.map((c) => ({
      ...c,
      assetCount: assets.filter((a) => a.collectionIds?.includes(c.id)).length,
    }));
  } catch (err) {
    return inMemoryCollections;
  }
}

export function saveAllCollections(collections: Collection[]): void {
  inMemoryCollections = collections;
  ensureDataDir();
  try {
    fs.writeFileSync(COLLECTIONS_FILE, JSON.stringify(collections, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Collections filesystem write prevented, preserved in memory:', err);
  }
}

export function createCollection(name: string, description: string): Collection {
  const collections = getAllCollections();
  const newCol: Collection = {
    id: `col-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name,
    description,
    createdAt: new Date().toISOString(),
    assetCount: 0,
  };
  collections.push(newCol);
  saveAllCollections(collections);
  return newCol;
}

export function toggleAssetCollection(assetId: string, collectionId: string): VisualAsset | null {
  const assets = getAllAssets();
  const asset = assets.find((a) => a.id === assetId);
  if (!asset) return null;

  if (!asset.collectionIds) asset.collectionIds = [];

  if (asset.collectionIds.includes(collectionId)) {
    asset.collectionIds = asset.collectionIds.filter((id) => id !== collectionId);
  } else {
    asset.collectionIds.push(collectionId);
  }

  saveAllAssets(assets);
  return asset;
}
