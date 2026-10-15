'use client';

import React from 'react';
import { VisualAsset } from '@/types';
import { formatDate } from '@/lib/utils';
import { AssetDetailModal } from '@/components/AssetDetailModal';

export default function TimelinePage() {
  const [assets, setAssets] = React.useState<VisualAsset[]>([]);
  const [selectedAsset, setSelectedAsset] = React.useState<VisualAsset | null>(null);

  const [compareAssetA, setCompareAssetA] = React.useState<VisualAsset | null>(null);
  const [compareAssetB, setCompareAssetB] = React.useState<VisualAsset | null>(null);

  React.useEffect(() => {
    fetch('/api/assets')
      .then((res) => res.json())
      .then((data) => {
        if (data.assets) setAssets(data.assets);
      })
      .catch(console.error);
  }, []);

  const grouped = React.useMemo(() => {
    const sorted = [...assets].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const groups: { dateKey: string; items: VisualAsset[] }[] = [];
    for (const item of sorted) {
      const dateKey = formatDate(item.createdAt);
      const existing = groups.find((g) => g.dateKey === dateKey);
      if (existing) {
        existing.items.push(item);
      } else {
        groups.push({ dateKey, items: [item] });
      }
    }
    return groups;
  }, [assets]);

  return (
    <div className="space-y-3 font-mono text-xs text-[#00ff66]">
      {/* Header */}
      <div className="border border-[#005522] bg-[#020602] p-3">
        <h1 className="text-sm font-bold tracking-wider text-[#00ff66]">
          // VISUAL TIMELINE &amp; COMPARISON RADAR
        </h1>
        <p className="text-[10px] text-[#00aa44]">
          CHRONOLOGICAL AUDIT TRAIL OF INGESTED VISUAL MEMORIES
        </p>
      </div>

      {/* Comparison Drawer */}
      {(compareAssetA || compareAssetB) && (
        <div className="border border-[#ff3333] bg-[#020502] p-3 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-[#ff3333]">
            <span>// SIDE-BY-SIDE VISUAL COMPARISON</span>
            <button
              onClick={() => {
                setCompareAssetA(null);
                setCompareAssetB(null);
              }}
              className="border border-[#ff3333] px-2 py-0.5 text-[9px] text-[#ff6666]"
            >
              [ CLOSE COMPARISON ]
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="border border-[#005522] bg-black p-2">
              <div className="text-[9px] text-[#00ff66] font-bold mb-1">
                SLOT A: {compareAssetA ? compareAssetA.originalFilename : '[ SELECT MEMORY ]'}
              </div>
              {compareAssetA && (
                <img
                  src={compareAssetA.previewUrl || compareAssetA.secureUrl}
                  alt={compareAssetA.originalFilename}
                  className="max-h-56 w-full object-contain border border-[#003311]"
                />
              )}
            </div>

            <div className="border border-[#005522] bg-black p-2">
              <div className="text-[9px] text-[#00ff66] font-bold mb-1">
                SLOT B: {compareAssetB ? compareAssetB.originalFilename : '[ SELECT MEMORY ]'}
              </div>
              {compareAssetB && (
                <img
                  src={compareAssetB.previewUrl || compareAssetB.secureUrl}
                  alt={compareAssetB.originalFilename}
                  className="max-h-56 w-full object-contain border border-[#003311]"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Timeline Stream */}
      <div className="border-l-2 border-[#005522] ml-3 pl-4 space-y-5">
        {grouped.map((group) => (
          <div key={group.dateKey} className="relative">
            <div className="absolute -left-[23px] top-1 h-3 w-3 border border-[#00ff66] bg-[#020502]" />

            <div className="text-[11px] font-bold text-[#00ff66] mb-2">
              &gt; {group.dateKey.toUpperCase()} ({group.items.length} LOGS)
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {group.items.map((asset) => (
                <div
                  key={asset.id}
                  className="border border-[#005522] bg-[#010401] p-1.5 hover:border-[#00ff66] transition-all"
                >
                  <img
                    src={asset.thumbnailUrl || asset.secureUrl}
                    alt={asset.originalFilename}
                    onClick={() => setSelectedAsset(asset)}
                    className="h-20 w-full object-cover border border-[#003311] cursor-pointer"
                  />
                  <div className="mt-1 text-[9px] text-[#00ff66] truncate font-bold">
                    {asset.originalFilename}
                  </div>
                  <div className="mt-1 flex justify-between text-[8px] text-[#00aa44]">
                    <button
                      onClick={() => setSelectedAsset(asset)}
                      className="hover:text-[#00ff66]"
                    >
                      [VIEW]
                    </button>
                    <button
                      onClick={() => {
                        if (!compareAssetA) setCompareAssetA(asset);
                        else setCompareAssetB(asset);
                      }}
                      className="hover:text-[#ff3333]"
                    >
                      [+COMPARE]
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <AssetDetailModal
        asset={selectedAsset}
        collections={[]}
        onClose={() => setSelectedAsset(null)}
        onFindSimilar={() => {}}
        onToggleCollection={() => {}}
      />
    </div>
  );
}
