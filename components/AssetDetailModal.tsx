'use client';

import React from 'react';
import { VisualAsset, Collection } from '@/types';
import { formatDate, formatBytes } from '@/lib/utils';
import { X, Sparkles, Copy, Check, Maximize2, Trash2 } from 'lucide-react';

interface AssetDetailModalProps {
  asset: VisualAsset | null;
  collections: Collection[];
  onClose: () => void;
  onFindSimilar: (asset: VisualAsset) => void;
  onToggleCollection: (assetId: string, collectionId: string) => void;
  onDeleteAsset?: (assetId: string) => void;
}

export function AssetDetailModal({
  asset,
  collections,
  onClose,
  onFindSimilar,
  onToggleCollection,
  onDeleteAsset,
}: AssetDetailModalProps) {
  const [copied, setCopied] = React.useState(false);

  if (!asset) return null;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(asset.secureUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-sm font-mono text-xs text-[#00ff66]">
      <div
        className="relative flex flex-col lg:flex-row w-full max-w-5xl max-h-[94vh] overflow-y-auto lg:overflow-hidden border-2 border-[#00ff66] bg-[#020502] shadow-[0_0_25px_rgba(0,255,102,0.3)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar in modal */}
        <div className="absolute top-2 right-2 z-20">
          <button
            onClick={onClose}
            className="border border-[#00ff66] bg-[#00220a] hover:bg-[#ff3333] hover:text-black hover:border-[#ff3333] px-2 py-1 text-xs font-bold transition-all"
          >
            [ X ]
          </button>
        </div>

        {/* Left Side: Image Visualizer */}
        <div className="relative flex shrink-0 lg:flex-1 items-center justify-center bg-black p-3 sm:p-4 border-b lg:border-b-0 lg:border-r border-[#005522] min-h-[220px]">
          <img
            src={asset.previewUrl || asset.secureUrl}
            alt={asset.originalFilename}
            className="max-h-[45vh] lg:max-h-[70vh] w-auto max-w-full object-contain filter contrast-110"
          />
          <a
            href={asset.secureUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-3 left-3 border border-[#00ff66] bg-[#010401] px-2 py-1 text-[9px] font-bold text-[#00ff66] hover:bg-[#003311]"
          >
            [ FULL RESOLUTION ]
          </a>
        </div>

        {/* Right Side: Terminal Data Inspector */}
        <div className="flex w-full lg:w-[420px] flex-col overflow-y-auto p-4 space-y-4 bg-[#030703]">
          <div>
            <div className="text-[9px] text-[#00aa44] mb-1 font-bold">
              // TELEMETRY &amp; METADATA
            </div>
            <h2 className="text-sm font-bold text-[#00ff66] break-words">
              {asset.originalFilename}
            </h2>
            <div className="text-[10px] text-[#00aa44] mt-1 space-y-0.5">
              <div>DATE: {formatDate(asset.createdAt)}</div>
              <div>SIZE: {formatBytes(asset.bytes)} | DIMENSIONS: {asset.width}x{asset.height}</div>
              <div>CATEGORY: [{asset.category.toUpperCase()}]</div>
            </div>
          </div>

          {/* AI Analysis Block */}
          <div className="border border-[#005522] bg-[#010401] p-2.5">
            <div className="text-[10px] font-bold text-[#00ff66] mb-1">
              // AI VISUAL REASONING:
            </div>
            <p className="text-[9px] leading-relaxed text-[#00aa44]">
              {asset.description}
            </p>
          </div>

          {/* OCR Block */}
          {asset.ocrText && (
            <div className="border border-[#005522] bg-[#010401] p-2.5">
              <div className="text-[10px] font-bold text-[#00ff66] mb-1">
                // EXTRACTED OCR STRINGS:
              </div>
              <div className="max-h-28 overflow-y-auto bg-black p-1.5 border border-[#003311] text-[9px] text-[#00ff66] leading-relaxed">
                {asset.ocrText}
              </div>
            </div>
          )}

          {/* Tags */}
          <div>
            <div className="text-[10px] font-bold text-[#00aa44] mb-1">
              INDEXED TAGS:
            </div>
            <div className="flex flex-wrap gap-1">
              {asset.tags?.map((t) => (
                <span
                  key={t}
                  className="border border-[#005522] bg-[#010401] px-1.5 py-0.5 text-[9px] text-[#00ff66]"
                >
                  #{t}
                </span>
              ))}
            </div>
          </div>

          {/* Collections assign */}
          <div>
            <div className="text-[10px] font-bold text-[#00aa44] mb-1">
              ASSIGN TO COLLECTION:
            </div>
            <div className="space-y-1 max-h-28 overflow-y-auto">
              {collections.map((col) => {
                const isInCol = asset.collectionIds?.includes(col.id);
                return (
                  <button
                    key={col.id}
                    onClick={() => onToggleCollection(asset.id, col.id)}
                    className={`flex w-full items-center justify-between border px-2 py-1 text-[9px] font-bold transition-all ${
                      isInCol
                        ? 'border-[#00ff66] bg-[#00220a] text-[#00ff66]'
                        : 'border-[#003311] bg-[#010401] text-[#00aa44] hover:border-[#005522]'
                    }`}
                  >
                    <span className="truncate">{col.name}</span>
                    <span>{isInCol ? '[ADDED ✓]' : '[+ ADD]'}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 border-t border-[#005522] space-y-2">
            <button
              onClick={() => {
                onFindSimilar(asset);
                onClose();
              }}
              className="w-full border border-[#ff3333] bg-[#220000] hover:bg-[#440000] py-2 text-center text-[10px] font-bold text-[#ff6666] tracking-wider transition-all"
            >
              [ RUN SIMILARITY SCAN ]
            </button>

            <div className="flex gap-2">
              <button
                onClick={handleCopyUrl}
                className="flex-1 border border-[#005522] bg-[#010401] hover:border-[#00ff66] py-1 text-center text-[9px] text-[#00ff66]"
              >
                {copied ? '[ COPIED! ]' : '[ COPY URL ]'}
              </button>

              {onDeleteAsset && (
                <button
                  onClick={() => {
                    if (confirm('Execute DELETE sequence on this memory?')) {
                      onDeleteAsset(asset.id);
                      onClose();
                    }
                  }}
                  className="border border-[#550000] bg-[#1a0000] hover:border-[#ff3333] px-2 py-1 text-[9px] text-[#ff6666]"
                >
                  [ DELETE ]
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
