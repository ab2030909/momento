import fs from 'fs';
import path from 'path';
import { VisualAsset, Collection } from '@/types';
import { INITIAL_COLLECTIONS, INITIAL_DEMO_ASSETS } from './demoData';

const DATA_DIR = path.join(process.cwd(), 'data');
const ASSETS_FILE = path.join(DATA_DIR, 'assets.json');
const COLLECTIONS_FILE = path.join(DATA_DIR, 'collections.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function getRawAllAssets(): VisualAsset[] {
  ensureDataDir();
  if (!fs.existsSync(ASSETS_FILE)) {
    fs.writeFileSync(ASSETS_FILE, JSON.stringify(INITIAL_DEMO_ASSETS, null, 2), 'utf-8');
    return [...INITIAL_DEMO_ASSETS];
  }
  try {
    const raw = fs.readFileSync(ASSETS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading assets file:', err);
    return [...INITIAL_DEMO_ASSETS];
  }
}

export function getAllAssets(userId?: string): VisualAsset[] {
  const all = getRawAllAssets();

  // Filter rule:
  // 1. Everyone can see Demo pictures (isDemo === true)
  // 2. Personal uploads are ONLY visible to the user who uploaded them (userId === currentUserId)
  // 3. If no userId is specified (guest), only demo pictures are returned
  if (!userId) {
    return all.filter((a) => a.isDemo === true);
  }

  return all.filter((a) => a.isDemo === true || a.userId === userId);
}

export function saveAllAssets(assets: VisualAsset[]): void {
  ensureDataDir();
  fs.writeFileSync(ASSETS_FILE, JSON.stringify(assets, null, 2), 'utf-8');
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
  if (!fs.existsSync(COLLECTIONS_FILE)) {
    fs.writeFileSync(COLLECTIONS_FILE, JSON.stringify(INITIAL_COLLECTIONS, null, 2), 'utf-8');
    return INITIAL_COLLECTIONS;
  }
  try {
    const raw = fs.readFileSync(COLLECTIONS_FILE, 'utf-8');
    const cols: Collection[] = JSON.parse(raw);
    const assets = getAllAssets();
    return cols.map((c) => ({
      ...c,
      assetCount: assets.filter((a) => a.collectionIds?.includes(c.id)).length,
    }));
  } catch (err) {
    console.error('Error reading collections:', err);
    return INITIAL_COLLECTIONS;
  }
}

export function saveAllCollections(collections: Collection[]): void {
  ensureDataDir();
  fs.writeFileSync(COLLECTIONS_FILE, JSON.stringify(collections, null, 2), 'utf-8');
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
