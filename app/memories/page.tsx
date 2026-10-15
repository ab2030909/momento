'use client';

import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { VisualAsset, Collection, ImageCategory } from '@/types';
import { AssetCard } from '@/components/AssetCard';
import { AssetDetailModal } from '@/components/AssetDetailModal';
import { useAuth } from '@/lib/auth/AuthContext';

const CATEGORIES: { label: string; value: ImageCategory | 'all' }[] = [
  { label: '[ ALL ]', value: 'all' },
  { label: '[ DIAGRAMS ]', value: 'diagram' },
  { label: '[ SCREENSHOTS ]', value: 'screenshot' },
  { label: '[ RECEIPTS ]', value: 'receipt' },
  { label: '[ PRODUCTS ]', value: 'product' },
  { label: '[ PLACES/PHOTOS ]', value: 'photograph' },
  { label: '[ DOCUMENTS ]', value: 'document' },
];

export default function MemoriesPage() {
  return (
    <React.Suspense fallback={<div className="p-4 text-[#00ff66] font-mono">// LOADING DATABASE...</div>}>
      <MemoriesContent />
    </React.Suspense>
  );
}

function MemoriesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCategory = (searchParams.get('category') as ImageCategory) || 'all';
  const initialCollectionId = searchParams.get('collectionId') || 'all';

  const { user } = useAuth();
  const [assets, setAssets] = React.useState<VisualAsset[]>([]);
  const [collections, setCollections] = React.useState<Collection[]>([]);
  const [selectedAsset, setSelectedAsset] = React.useState<VisualAsset | null>(null);

  const [category, setCategory] = React.useState<ImageCategory | 'all'>(initialCategory);
  const [collectionId, setCollectionId] = React.useState<string>(initialCollectionId);
  const [sortBy, setSortBy] = React.useState<'newest' | 'oldest'>('newest');
  const [quickSearch, setQuickSearch] = React.useState('');

  const loadData = React.useCallback(() => {
    fetch('/api/assets', {
      headers: user?.id ? { 'x-user-id': user.id } : {},
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.assets) setAssets(data.assets);
      })
      .catch(console.error);

    fetch('/api/collections')
      .then((res) => res.json())
      .then((data) => {
        if (data.collections) setCollections(data.collections);
      })
      .catch(console.error);
  }, [user]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredAssets = React.useMemo(() => {
    return assets
      .filter((asset) => {
        if (category !== 'all' && asset.category !== category) return false;
        if (collectionId !== 'all' && !asset.collectionIds?.includes(collectionId)) return false;
        if (quickSearch.trim()) {
          const q = quickSearch.toLowerCase();
          const matchFilename = asset.originalFilename.toLowerCase().includes(q);
          const matchDesc = asset.description.toLowerCase().includes(q);
          const matchTags = asset.tags?.some((t) => t.toLowerCase().includes(q));
          const matchOcr = asset.ocrText?.toLowerCase().includes(q);
          if (!matchFilename && !matchDesc && !matchTags && !matchOcr) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        return sortBy === 'newest' ? timeB - timeA : timeA - timeB;
      });
  }, [assets, category, collectionId, sortBy, quickSearch]);

  return (
    <div className="space-y-3 font-mono text-xs text-[#00ff66]">
      {/* Header bar */}
      <div className="border border-[#005522] bg-[#020602] p-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-sm font-bold tracking-wider text-[#00ff66]">
            // ALL VISUAL MEMORIES DATABASE
          </h1>
          <p className="text-[10px] text-[#00aa44]">
            INDEX RECORD COUNT: {filteredAssets.length} / {assets.length} TOTAL
          </p>
        </div>

        {/* Filter inputs */}
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={quickSearch}
            onChange={(e) => setQuickSearch(e.target.value)}
            placeholder="FILTER CURRENT VIEW..."
            className="border border-[#005522] bg-[#010401] px-2.5 py-1 text-[10px] text-[#00ff66] placeholder-[#007733] focus:border-[#00ff66] focus:outline-none"
          />

          <select
            value={collectionId}
            onChange={(e) => setCollectionId(e.target.value)}
            className="border border-[#005522] bg-[#010401] px-2 py-1 text-[10px] text-[#00ff66] focus:outline-none"
          >
            <option value="all">[ ALL COLLECTIONS ]</option>
            {collections.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="border border-[#005522] bg-[#010401] px-2 py-1 text-[10px] text-[#00ff66] focus:outline-none"
          >
            <option value="newest">[ NEWEST FIRST ]</option>
            <option value="oldest">[ OLDEST FIRST ]</option>
          </select>
        </div>
      </div>

      {/* Categories Bar */}
      <div className="flex flex-wrap gap-1.5 p-1 border border-[#005522] bg-[#020502]">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setCategory(cat.value)}
            className={`px-2.5 py-1 text-[10px] font-bold transition-all border ${
              category === cat.value
                ? 'border-[#00ff66] bg-[#00220a] text-[#00ff66] shadow-[0_0_8px_rgba(0,255,102,0.3)]'
                : 'border-transparent text-[#00aa44] hover:border-[#005522] hover:text-[#00ff66]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
        {filteredAssets.map((asset) => (
          <AssetCard
            key={asset.id}
            asset={asset}
            onSelect={(a) => setSelectedAsset(a)}
            onFindSimilar={(a) => router.push(`/similar?assetId=${a.id}`)}
          />
        ))}
      </div>

      {/* Modal */}
      <AssetDetailModal
        asset={selectedAsset}
        collections={collections}
        onClose={() => setSelectedAsset(null)}
        onFindSimilar={(a) => router.push(`/similar?assetId=${a.id}`)}
        onToggleCollection={async (assetId, colId) => {
          await fetch('/api/collections', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ assetId, collectionId: colId }),
          });
          loadData();
        }}
      />
    </div>
  );
}
