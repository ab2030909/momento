'use client';

import React from 'react';
import Link from 'next/link';
import { Collection, VisualAsset } from '@/types';
import { Folder } from 'lucide-react';
import { AssetDetailModal } from '@/components/AssetDetailModal';

export default function CollectionsPage() {
  const [collections, setCollections] = React.useState<Collection[]>([]);
  const [assets, setAssets] = React.useState<VisualAsset[]>([]);
  const [selectedAsset, setSelectedAsset] = React.useState<VisualAsset | null>(null);

  const [isCreating, setIsCreating] = React.useState(false);
  const [newColName, setNewColName] = React.useState('');
  const [newColDesc, setNewColDesc] = React.useState('');

  const loadData = React.useCallback(() => {
    fetch('/api/collections')
      .then((res) => res.json())
      .then((data) => {
        if (data.collections) setCollections(data.collections);
      })
      .catch(console.error);

    fetch('/api/assets')
      .then((res) => res.json())
      .then((data) => {
        if (data.assets) setAssets(data.assets);
      })
      .catch(console.error);
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName.trim()) return;

    try {
      const res = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newColName, description: newColDesc }),
      });
      if (res.ok) {
        setNewColName('');
        setNewColDesc('');
        setIsCreating(false);
        loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-3 font-mono text-xs text-[#00ff66]">
      {/* Header */}
      <div className="border border-[#005522] bg-[#020602] p-3 flex items-center justify-between">
        <div>
          <h1 className="text-sm font-bold tracking-wider text-[#00ff66]">
            // THEMATIC COLLECTIONS REGISTRY
          </h1>
          <p className="text-[10px] text-[#00aa44]">
            WORKSPACE CATEGORIES: {collections.length} ACTIVE DIRECTORIES
          </p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="border border-[#00ff66] bg-[#00220a] hover:bg-[#004414] px-3 py-1 font-bold text-[10px] text-[#00ff66] transition-all"
        >
          [ + NEW DIRECTORY ]
        </button>
      </div>

      {/* Create form */}
      {isCreating && (
        <form
          onSubmit={handleCreateCollection}
          className="border border-[#00ff66] bg-[#010401] p-3 space-y-2"
        >
          <div className="text-[11px] font-bold text-[#00ff66]">
            // INITIALIZE NEW WORKSPACE DIRECTORY
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <input
              type="text"
              required
              placeholder="COLLECTION DIRECTORY NAME..."
              value={newColName}
              onChange={(e) => setNewColName(e.target.value)}
              className="border border-[#005522] bg-black px-2 py-1 text-[10px] text-[#00ff66] placeholder-[#007733] focus:border-[#00ff66] focus:outline-none"
            />
            <input
              type="text"
              placeholder="DESCRIPTION..."
              value={newColDesc}
              onChange={(e) => setNewColDesc(e.target.value)}
              className="border border-[#005522] bg-black px-2 py-1 text-[10px] text-[#00ff66] placeholder-[#007733] focus:border-[#00ff66] focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="border border-[#005522] px-2 py-1 text-[9px] text-[#00aa44]"
            >
              [ CANCEL ]
            </button>
            <button
              type="submit"
              className="border border-[#00ff66] bg-[#00220a] px-3 py-1 text-[9px] font-bold text-[#00ff66]"
            >
              [ SAVE DIRECTORY ]
            </button>
          </div>
        </form>
      )}

      {/* Collections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {collections.map((col) => {
          const colAssets = assets.filter((a) => a.collectionIds?.includes(col.id));
          return (
            <div
              key={col.id}
              className="border border-[#005522] bg-[#020602] p-3 hover:border-[#00ff66] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-[#00ff66] mb-1">
                  <div className="flex items-center gap-1.5 font-bold text-xs truncate">
                    <Folder className="h-4 w-4 text-[#00ff66]" />
                    {col.name}
                  </div>
                  <span className="text-[9px] border border-[#005522] px-1 bg-black text-[#00aa44]">
                    {colAssets.length} FILES
                  </span>
                </div>
                <p className="text-[9px] text-[#00aa44] mt-1 line-clamp-2">
                  {col.description || 'NO SYSTEM DESCRIPTION'}
                </p>

                {/* Thumbnails */}
                <div className="flex gap-1 overflow-x-auto my-3 pb-1">
                  {colAssets.map((a) => (
                    <img
                      key={a.id}
                      src={a.thumbnailUrl || a.secureUrl}
                      alt={a.originalFilename}
                      onClick={() => setSelectedAsset(a)}
                      className="h-10 w-12 object-cover border border-[#005522] hover:border-[#00ff66] cursor-pointer shrink-0"
                    />
                  ))}
                  {colAssets.length === 0 && (
                    <div className="text-[9px] text-[#005522]">EMPTY DIRECTORY</div>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-[#003311] flex justify-between items-center text-[9px]">
                <Link
                  href={`/memories?collectionId=${col.id}`}
                  className="text-[#00ff66] hover:underline"
                >
                  [ OPEN DIRECTORY ]
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      <AssetDetailModal
        asset={selectedAsset}
        collections={collections}
        onClose={() => setSelectedAsset(null)}
        onFindSimilar={() => {}}
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
