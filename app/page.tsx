'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { VisualAsset, Collection } from '@/types';
import { formatDate } from '@/lib/utils';
import { AssetDetailModal } from '@/components/AssetDetailModal';
import { useAuth } from '@/lib/auth/AuthContext';
import { NeuralWorldMapCanvas } from '@/components/NeuralWorldMapCanvas';
import {
  Search,
  CheckSquare,
  Maximize2,
  Folder,
  Layers,
  ChevronRight,
  ChevronLeft,
  Sparkles,
} from 'lucide-react';

const CATEGORY_ITEMS = [
  {
    name: 'Screenshots',
    key: 'screenshot',
    count: 124,
    thumb: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=300&q=80',
  },
  {
    name: 'Documents',
    key: 'document',
    count: 48,
    thumb: 'https://images.unsplash.com/photo-1453614512568-c4024d13c247?auto=format&fit=crop&w=300&q=80',
  },
  {
    name: 'Products',
    key: 'product',
    count: 36,
    thumb: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=300&q=80',
  },
  {
    name: 'Diagrams',
    key: 'diagram',
    count: 38,
    thumb: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=300&q=80',
  },
  {
    name: 'Receipts',
    key: 'receipt',
    count: 32,
    thumb: 'https://images.unsplash.com/photo-1554415707-9e4466b88738?auto=format&fit=crop&w=300&q=80',
  },
  {
    name: 'Places',
    key: 'photograph',
    count: 40,
    thumb: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=300&q=80',
  },
];

export default function OverviewPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [assets, setAssets] = React.useState<VisualAsset[]>([]);
  const [collections, setCollections] = React.useState<Collection[]>([]);
  const [selectedAsset, setSelectedAsset] = React.useState<VisualAsset | null>(null);
  const [activePreview, setActivePreview] = React.useState<VisualAsset | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeTab, setActiveTab] = React.useState<'INFO' | 'AI ANALYSIS' | 'SIMILAR' | 'COLLECTIONS'>('INFO');

  React.useEffect(() => {
    fetch('/api/assets', {
      headers: user?.id ? { 'x-user-id': user.id } : {},
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.assets && data.assets.length > 0) {
          setAssets(data.assets);
          setActivePreview(data.assets[0]);
        }
      })
      .catch(console.error);

    fetch('/api/collections')
      .then((res) => res.json())
      .then((data) => {
        if (data.collections) setCollections(data.collections);
      })
      .catch(console.error);
  }, [user]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleQuickFilter = (term: string) => {
    router.push(`/search?q=${encodeURIComponent(term)}`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 text-xs font-mono text-[#00ff66]">
      {/* Center Left Main Panel (8 Cols) */}
      <div className="lg:col-span-8 space-y-3">
        {/* 1. Search Box Module with Neural World Map Canvas */}
        <div className="relative overflow-hidden border border-[#005522] bg-[#020602] p-3 shadow-[0_0_15px_rgba(0,255,102,0.06)]">
          {/* Animated Neural World Map Canvas in Background */}
          <NeuralWorldMapCanvas />

          <div className="relative z-10">
            <div className="flex items-center justify-between text-[10px] text-[#00aa44] mb-1 font-semibold">
              <span>// SEARCH YOUR // GLOBAL NEURAL MATRIX</span>
              <span className="text-[9px] text-[#00ff66] flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#00ff66] animate-pulse" />
                NEURAL NODES: ONLINE
              </span>
            </div>
            <h2 className="text-sm font-bold tracking-wider text-[#00ff66] mb-1">
              // SEARCH YOUR VISUAL WORLD
            </h2>
            <p className="text-[10px] text-[#00aa44] mb-3">
              Find anything in your images. Products, text, places, diagrams, or just describe what you remember.
            </p>

            <form onSubmit={handleSearchSubmit} className="flex gap-2 mb-3">
              <div className="relative flex-1 flex items-center border border-[#005522] bg-[#010401]/90 backdrop-blur-sm">
                <span className="pl-2.5 text-[#00ff66] select-none">&gt;</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder='Type your search... (e.g. "AWS architecture diagram", "blue mechanical keyboard")'
                  className="w-full bg-transparent px-2 py-2 text-[11px] text-[#00ff66] placeholder-[#007733] focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="border border-[#00ff66] bg-[#00220a] hover:bg-[#004414] px-4 py-2 text-[11px] font-bold text-[#00ff66] tracking-wider transition-all hover:shadow-[0_0_10px_#00ff66]"
              >
                [ SEARCH ]
              </button>
            </form>

            {/* Quick Filter Tags */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#005522]/50 text-[10px]">
              <div className="flex flex-wrap gap-1.5">
                {['Architecture', 'Receipts', 'Documents', 'Screenshots', 'Places', 'Products', 'Similar'].map(
                  (filter) => (
                    <button
                      key={filter}
                      onClick={() => handleQuickFilter(filter)}
                      className="border border-[#005522] bg-[#010401]/80 hover:border-[#00ff66] hover:text-[#00ff66] px-2 py-0.5 text-[#00aa44] transition-colors"
                    >
                      [ {filter} ]
                    </button>
                  )
                )}
              </div>

              <div className="text-[9px] text-[#00aa44] tracking-tight">
                SIGNAL ACQUIRED ... ANALYZING VISUAL DATA ... READY.
              </div>
            </div>
          </div>
        </div>

        {/* 2. Recent Memories Horizontal Grid */}
        <div className="border border-[#005522] bg-[#020602] p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[11px] font-bold text-[#00ff66] tracking-wider">
              // RECENT MEMORIES
            </div>
            <Link
              href="/memories"
              className="text-[10px] text-[#00aa44] hover:text-[#00ff66] transition-colors"
            >
              [ VIEW ALL ]
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {assets.slice(0, 6).map((asset) => (
              <div
                key={asset.id}
                onClick={() => setActivePreview(asset)}
                className={`group cursor-pointer border p-1 bg-[#010401] transition-all ${
                  activePreview?.id === asset.id
                    ? 'border-[#00ff66] shadow-[0_0_8px_rgba(0,255,102,0.3)]'
                    : 'border-[#005522] hover:border-[#00aa44]'
                }`}
              >
                <div className="relative aspect-square w-full overflow-hidden bg-black mb-1">
                  <img
                    src={asset.thumbnailUrl || asset.secureUrl}
                    alt={asset.originalFilename}
                    className="h-full w-full object-cover filter contrast-110 brightness-95"
                  />
                  {asset.ocrText && (
                    <div className="absolute top-1 right-1 bg-black/80 border border-[#005522] px-1 text-[8px] text-[#00ff66]">
                      OCR
                    </div>
                  )}
                </div>
                <div className="truncate text-[9px] text-[#00ff66] font-bold">
                  {asset.originalFilename}
                </div>
                <div className="flex items-center justify-between text-[8px] text-[#00aa44]">
                  <span>2 hours ago</span>
                  <span>[...]</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Collections Row */}
        <div className="border border-[#005522] bg-[#020602] p-3">
          <div className="text-[11px] font-bold text-[#00ff66] tracking-wider mb-2">
            // COLLECTIONS
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {collections.slice(0, 6).map((col) => (
              <Link
                key={col.id}
                href={`/memories?collectionId=${col.id}`}
                className="border border-[#005522] hover:border-[#00ff66] bg-[#010401] p-2 flex flex-col justify-between transition-all"
              >
                <div>
                  <div className="flex items-center justify-between text-[#00aa44] mb-1">
                    <Folder className="h-3.5 w-3.5 text-[#00ff66]" />
                    <span className="text-[9px]">&gt;</span>
                  </div>
                  <div className="text-[10px] font-bold text-[#00ff66] truncate uppercase">
                    {col.name}
                  </div>
                </div>
                <div className="text-[9px] text-[#00aa44] mt-2">
                  {col.assetCount || 12} items
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* 4. Explore by Category Module */}
        <div className="border border-[#005522] bg-[#020602] p-3">
          <div className="text-[11px] font-bold text-[#00ff66] tracking-wider mb-2">
            // EXPLORE BY CATEGORY
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {CATEGORY_ITEMS.map((item) => (
              <button
                key={item.key}
                onClick={() => router.push(`/memories?category=${item.key}`)}
                className="border border-[#005522] hover:border-[#00ff66] bg-[#010401] p-1.5 text-left flex items-center gap-2 transition-all"
              >
                <img
                  src={item.thumb}
                  alt={item.name}
                  className="h-9 w-9 object-cover border border-[#005522] shrink-0"
                />
                <div className="overflow-hidden">
                  <div className="text-[10px] font-bold text-[#00ff66] truncate">
                    {item.name}
                  </div>
                  <div className="text-[8px] text-[#00aa44]">
                    ({item.count})
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 5. Bottom Split: Visual Timeline and Recent Activity */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Visual Timeline Widget */}
          <div className="md:col-span-7 border border-[#005522] bg-[#020602] p-3">
            <div className="text-[11px] font-bold text-[#00ff66] tracking-wider mb-2">
              // VISUAL TIMELINE
            </div>
            <div className="relative flex items-center justify-between gap-1 overflow-x-auto py-2">
              <span className="text-[#00aa44] cursor-pointer">&lt;</span>
              {assets.slice(0, 7).map((item, idx) => (
                <div
                  key={item.id}
                  onClick={() => setActivePreview(item)}
                  className="flex flex-col items-center cursor-pointer shrink-0"
                >
                  <div
                    className={`h-10 w-10 border overflow-hidden p-0.5 bg-black ${
                      activePreview?.id === item.id
                        ? 'border-[#ff3333] shadow-[0_0_6px_#ff3333]'
                        : 'border-[#005522] hover:border-[#00ff66]'
                    }`}
                  >
                    <img
                      src={item.thumbnailUrl || item.secureUrl}
                      alt={item.originalFilename}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="h-2 w-0.5 bg-[#005522] my-1" />
                  <span
                    className={`text-[8px] uppercase ${
                      activePreview?.id === item.id ? 'text-[#ff3333] font-bold' : 'text-[#00aa44]'
                    }`}
                  >
                    OCT {8 + idx}
                  </span>
                </div>
              ))}
              <span className="text-[#00aa44] cursor-pointer">&gt;</span>
            </div>
          </div>

          {/* Recent Activity Stream */}
          <div className="md:col-span-5 border border-[#005522] bg-[#020602] p-3 text-[10px]">
            <div className="text-[11px] font-bold text-[#00ff66] tracking-wider mb-2">
              // RECENT ACTIVITY
            </div>
            <div className="space-y-1.5 text-[#00aa44]">
              <div className="flex items-center justify-between">
                <span className="text-[#00ff66] flex items-center gap-1">
                  <span>[✓]</span> Processed 12 images
                </span>
                <span className="text-[9px]">2 hours ago</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#00ff66] flex items-center gap-1">
                  <span>[✓]</span> Found 18 similar images
                </span>
                <span className="text-[9px]">4 hours ago</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#00ff66] flex items-center gap-1">
                  <span>[✓]</span> Added to Cloud Architecture
                </span>
                <span className="text-[9px]">6 hours ago</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#00ff66] flex items-center gap-1">
                  <span>[✓]</span> Searched "mechanical keyboard"
                </span>
                <span className="text-[9px]">8 hours ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column (4 Cols): System Status and Image Preview Panel */}
      <div className="lg:col-span-4 space-y-3">
        {/* System Status Module */}
        <div className="border border-[#005522] bg-[#020602] p-3">
          <div className="text-[11px] font-bold text-[#00ff66] tracking-wider mb-2">
            // SYSTEM STATUS
          </div>
          <div className="space-y-1.5 text-[10px]">
            <div className="flex items-center justify-between border-b border-[#005522]/30 pb-1">
              <span className="flex items-center gap-1.5">
                <span className="text-[#00ff66]">[✓]</span> Vision Analysis
              </span>
              <span className="text-[#00ff66] font-bold">[ ONLINE ]</span>
            </div>
            <div className="flex items-center justify-between border-b border-[#005522]/30 pb-1">
              <span className="flex items-center gap-1.5">
                <span className="text-[#00ff66]">[✓]</span> OCR Extraction
              </span>
              <span className="text-[#00ff66] font-bold">[ ONLINE ]</span>
            </div>
            <div className="flex items-center justify-between border-b border-[#005522]/30 pb-1">
              <span className="flex items-center gap-1.5">
                <span className="text-[#00ff66]">[✓]</span> Embedding Model
              </span>
              <span className="text-[#00ff66] font-bold">[ ONLINE ]</span>
            </div>
            <div className="flex items-center justify-between border-b border-[#005522]/30 pb-1">
              <span className="flex items-center gap-1.5">
                <span className="text-[#00ff66]">[✓]</span> Vector Search
              </span>
              <span className="text-[#00ff66] font-bold">[ ONLINE ]</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="text-[#00ff66]">[✓]</span> Cloudinary Storage
              </span>
              <span className="text-[#00ff66] font-bold">[ ONLINE ]</span>
            </div>
          </div>
        </div>

        {/* Live Image Preview Inspector Module */}
        <div className="border border-[#005522] bg-[#020602] p-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#00ff66] tracking-wider">
              // IMAGE PREVIEW
            </span>
            {activePreview && (
              <button
                onClick={() => setSelectedAsset(activePreview)}
                className="text-[#00aa44] hover:text-[#00ff66]"
                title="Open Modal"
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Large Preview Screen */}
          <div className="relative aspect-[16/10] w-full overflow-hidden border border-[#005522] bg-black flex items-center justify-center">
            {activePreview ? (
              <img
                src={activePreview.previewUrl || activePreview.secureUrl}
                alt={activePreview.originalFilename}
                className="h-full w-full object-cover filter contrast-110"
              />
            ) : (
              <div className="text-[10px] text-[#007733]">NO ASSET SELECTED</div>
            )}
          </div>

          {activePreview && (
            <div className="space-y-3">
              <div className="text-[11px] font-bold text-[#00ff66] truncate">
                {activePreview.originalFilename}
              </div>

              {/* Subtabs: INFO | AI ANALYSIS | SIMILAR | COLLECTIONS */}
              <div className="flex border-b border-[#005522] text-[9px] font-bold">
                {(['INFO', 'AI ANALYSIS', 'SIMILAR', 'COLLECTIONS'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-2 py-1 transition-all ${
                      activeTab === tab
                        ? 'text-[#00ff66] border-b-2 border-[#00ff66] bg-[#00220a]'
                        : 'text-[#00aa44] hover:text-[#00ff66]'
                    }`}
                  >
                    [ {tab} ]
                  </button>
                ))}
              </div>

              {/* Tab Contents */}
              {activeTab === 'INFO' && (
                <div className="space-y-1 text-[10px] text-[#00aa44]">
                  <div className="flex justify-between">
                    <span>File size</span>
                    <span className="text-[#00ff66]">1.2 MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dimensions</span>
                    <span className="text-[#00ff66]">{activePreview.width} x {activePreview.height}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Format</span>
                    <span className="text-[#00ff66] uppercase">{activePreview.format}</span>
                  </div>
                  <div className="flex justify-between truncate">
                    <span>Cloudinary URL</span>
                    <a
                      href={activePreview.secureUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#00ff66] truncate max-w-[140px] hover:underline"
                    >
                      {activePreview.secureUrl}
                    </a>
                  </div>
                  <div className="flex justify-between">
                    <span>Public ID</span>
                    <span className="text-[#00ff66] truncate max-w-[140px]">
                      {activePreview.cloudinaryPublicId || activePreview.id}
                    </span>
                  </div>
                </div>
              )}

              {activeTab === 'AI ANALYSIS' && (
                <div className="space-y-1.5 text-[10px]">
                  <div className="text-[#00ff66] font-bold">
                    Extracted Description:
                  </div>
                  <p className="text-[#00aa44] text-[9px] leading-relaxed">
                    {activePreview.description}
                  </p>
                  {activePreview.ocrText && (
                    <div className="mt-2">
                      <div className="text-[#00ff66] font-bold">OCR Text:</div>
                      <div className="bg-black/60 p-1.5 border border-[#005522] text-[9px] text-[#00ff66] max-h-20 overflow-y-auto">
                        {activePreview.ocrText}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'SIMILAR' && (
                <div className="space-y-2 text-[10px]">
                  <p className="text-[#00aa44]">
                    Discover images sharing vector distance with this asset.
                  </p>
                  <button
                    onClick={() => router.push(`/similar?assetId=${activePreview.id}`)}
                    className="w-full border border-[#00ff66] bg-[#00220a] hover:bg-[#004414] py-1 text-center font-bold text-[#00ff66]"
                  >
                    RUN SIMILARITY SCAN →
                  </button>
                </div>
              )}

              {activeTab === 'COLLECTIONS' && (
                <div className="space-y-1 text-[10px]">
                  <p className="text-[#00aa44] mb-1">Assigned Collections:</p>
                  {collections.map((c) => {
                    const isAssigned = activePreview.collectionIds?.includes(c.id);
                    return (
                      <div key={c.id} className="flex justify-between text-[9px] text-[#00ff66]">
                        <span>- {c.name}</span>
                        <span>{isAssigned ? '[ADDED]' : '[+]'}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Tags Cloud */}
              <div className="border-t border-[#005522] pt-2">
                <div className="text-[10px] text-[#00aa44] mb-1.5 font-bold">
                  TAGS
                </div>
                <div className="flex flex-wrap gap-1">
                  {activePreview.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="border border-[#005522] bg-[#010401] px-1.5 py-0.5 text-[9px] text-[#00ff66]"
                    >
                      {tag}
                    </span>
                  ))}
                  <button
                    onClick={() => setSelectedAsset(activePreview)}
                    className="border border-[#005522] px-1 text-[9px] text-[#00aa44] hover:text-[#00ff66]"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2 border-t border-[#005522]">
                <button
                  onClick={() => router.push(`/similar?assetId=${activePreview.id}`)}
                  className="flex-1 border border-[#ff3333] bg-[#220000] hover:bg-[#440000] py-1.5 text-center text-[10px] font-bold text-[#ff6666] tracking-wider transition-all"
                >
                  [ FIND SIMILAR ]
                </button>
                <button
                  onClick={() => setSelectedAsset(activePreview)}
                  className="flex-1 border border-[#00ff66] bg-[#00220a] hover:bg-[#004414] py-1.5 text-center text-[10px] font-bold text-[#00ff66] tracking-wider transition-all"
                >
                  [ ADD TO COLLECTION ]
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
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
          const res = await fetch('/api/assets');
          const data = await res.json();
          if (data.assets) setAssets(data.assets);
        }}
      />
    </div>
  );
}
