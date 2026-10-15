'use client';

import React from 'react';
import { VisualAsset } from '@/types';
import { formatDate } from '@/lib/utils';
import { Sparkles, FileText } from 'lucide-react';

interface AssetCardProps {
  asset: VisualAsset;
  onSelect: (asset: VisualAsset) => void;
  onFindSimilar?: (asset: VisualAsset) => void;
  onToggleCollection?: (asset: VisualAsset) => void;
}

export function AssetCard({ asset, onSelect, onFindSimilar }: AssetCardProps) {
  return (
    <div
      onClick={() => onSelect(asset)}
      className="group relative flex flex-col border border-[#005522] bg-[#020502] p-2 hover:border-[#00ff66] hover:shadow-[0_0_12px_rgba(0,255,102,0.25)] transition-all cursor-pointer font-mono text-xs"
    >
      {/* Thumbnail */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-black border border-[#003311]">
        <img
          src={asset.thumbnailUrl || asset.secureUrl}
          alt={asset.originalFilename}
          className="h-full w-full object-cover filter contrast-105 group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Category Pill */}
        <div className="absolute top-1.5 left-1.5 bg-[#010401]/90 border border-[#005522] px-1.5 py-0.5 text-[8px] font-bold uppercase text-[#00ff66]">
          [{asset.category}]
        </div>

        {/* OCR badge */}
        {asset.ocrText && (
          <div className="absolute top-1.5 right-1.5 bg-[#010401]/90 border border-[#005522] px-1 py-0.5 text-[8px] text-[#00ff66]">
            OCR:OK
          </div>
        )}
      </div>

      {/* Card Info */}
      <div className="mt-2 flex flex-col flex-1">
        <h4 className="font-bold text-[#00ff66] text-[11px] truncate group-hover:terminal-glow">
          {asset.originalFilename}
        </h4>
        <p className="mt-1 line-clamp-2 text-[9px] text-[#00aa44] leading-relaxed">
          {asset.description}
        </p>

        {/* Tags */}
        <div className="mt-2 flex flex-wrap gap-1">
          {asset.tags?.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="border border-[#003311] bg-[#001407] px-1 py-0.2 text-[8px] text-[#00aa44]"
            >
              #{tag}
            </span>
          ))}
        </div>

        <div className="mt-2 pt-2 border-t border-[#003311] flex items-center justify-between text-[8px] text-[#007733]">
          <span>{formatDate(asset.createdAt)}</span>
          <span className="text-[#00aa44] hover:text-[#00ff66]">[INSPECT]</span>
        </div>
      </div>
    </div>
  );
}
