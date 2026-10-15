'use client';

import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { VisualAsset, SearchResult } from '@/types';
import { AssetCard } from '@/components/AssetCard';
import { AssetDetailModal } from '@/components/AssetDetailModal';

export default function SimilarPage() {
  return (
    <React.Suspense fallback={<div className="p-4 text-[#00ff66] font-mono">// INITIALIZING SIMILARITY RADAR...</div>}>
      <SimilarContent />
    </React.Suspense>
  );
}

function SimilarContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const assetId = searchParams.get('assetId');

  const [assets, setAssets] = React.useState<VisualAsset[]>([]);
  const [targetAsset, setTargetAsset] = React.useState<VisualAsset | null>(null);
  const [similarResults, setSimilarResults] = React.useState<SearchResult[]>([]);
  const [selectedModalAsset, setSelectedModalAsset] = React.useState<VisualAsset | null>(null);

  React.useEffect(() => {
    fetch('/api/assets')
      .then((res) => res.json())
      .then((data) => {
        if (data.assets) {
          setAssets(data.assets);
          if (!assetId && data.assets.length > 0) {
            router.replace(`/similar?assetId=${data.assets[0].id}`);
          }
        }
      });
  }, [assetId, router]);

  React.useEffect(() => {
    if (assetId) {
      fetch(`/api/similar?assetId=${assetId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.target) setTargetAsset(data.target);
          if (data.similar) setSimilarResults(data.similar);
        });
    }
  }, [assetId]);

  return (
    <div className="space-y-3 font-mono text-xs text-[#00ff66]">
      {/* Header */}
      <div className="border border-[#005522] bg-[#020602] p-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-sm font-bold tracking-wider text-[#00ff66]">
            // VISUAL SIMILARITY RADAR SCAN
          </h1>
          <p className="text-[10px] text-[#00aa44]">
            VECTOR PROXIMITY &amp; CROSS-CORRELATION ENGINE
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#00aa44]">REFERENCE TARGET:</span>
          <select
            value={assetId || ''}
            onChange={(e) => router.push(`/similar?assetId=${e.target.value}`)}
            className="border border-[#005522] bg-[#010401] px-2 py-1 text-[10px] text-[#00ff66] focus:outline-none"
          >
            {assets.map((a) => (
              <option key={a.id} value={a.id}>
                {a.originalFilename}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Target Preview */}
      {targetAsset && (
        <div className="border border-[#00ff66] bg-[#010401] p-3 flex flex-col md:flex-row gap-4 items-center">
          <img
            src={targetAsset.thumbnailUrl || targetAsset.secureUrl}
            alt={targetAsset.originalFilename}
            className="h-32 w-44 object-cover border border-[#005522]"
          />
          <div className="flex-1 space-y-1">
            <span className="border border-[#00ff66] bg-[#00220a] px-1.5 py-0.5 text-[8px] font-bold text-[#00ff66]">
              [ SOURCE SIGNAL ]
            </span>
            <h2 className="text-sm font-bold text-[#00ff66] mt-1">
              {targetAsset.originalFilename}
            </h2>
            <p className="text-[10px] text-[#00aa44] leading-relaxed">
              {targetAsset.description}
            </p>
            <div className="flex flex-wrap gap-1 pt-1">
              {targetAsset.tags?.map((t) => (
                <span
                  key={t}
                  className="border border-[#003311] bg-[#001407] px-1 py-0.2 text-[8px] text-[#00ff66]"
                >
                  #{t}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Discovered similar items */}
      <div className="border border-[#005522] bg-[#020602] p-3">
        <div className="text-[11px] font-bold text-[#00ff66] mb-2">
          // DISCOVERED CORRELATED ASSETS ({similarResults.length})
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {similarResults.map(({ asset, relevanceScore, matchReason, matchType }) => (
            <div
              key={asset.id}
              className="border border-[#005522] bg-[#010401] p-1.5 flex flex-col justify-between hover:border-[#00ff66] transition-all"
            >
              <AssetCard
                asset={asset}
                onSelect={(a) => setSelectedModalAsset(a)}
                onFindSimilar={(a) => router.push(`/similar?assetId=${a.id}`)}
              />
              <div className="mt-1 pt-1 border-t border-[#003311] text-[8px]">
                <div className="flex justify-between font-bold">
                  <span className="text-[#00ff66]">[{matchType.toUpperCase()}]</span>
                  <span className="text-[#ff3333]">{relevanceScore}%</span>
                </div>
                <p className="text-[#00aa44] truncate">{matchReason}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AssetDetailModal
        asset={selectedModalAsset}
        collections={[]}
        onClose={() => setSelectedModalAsset(null)}
        onFindSimilar={(a) => router.push(`/similar?assetId=${a.id}`)}
        onToggleCollection={() => {}}
      />
    </div>
  );
}
