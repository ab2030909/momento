'use client';

import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SearchResult, Collection, VisualAsset } from '@/types';
import { AssetCard } from '@/components/AssetCard';
import { AssetDetailModal } from '@/components/AssetDetailModal';
import { useAuth } from '@/lib/auth/AuthContext';

export default function SearchPage() {
  return (
    <React.Suspense fallback={<div className="p-4 text-[#00ff66] font-mono">// SEARCHING DATABASE...</div>}>
      <SearchContent />
    </React.Suspense>
  );
}

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';

  const { user } = useAuth();
  const [query, setQuery] = React.useState(q);
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [collections, setCollections] = React.useState<Collection[]>([]);
  const [selectedAsset, setSelectedAsset] = React.useState<VisualAsset | null>(null);

  const performSearch = React.useCallback(async (queryString: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user?.id ? { 'x-user-id': user.id } : {}),
        },
        body: JSON.stringify({ query: queryString }),
      });
      const data = await res.json();
      setResults(data.results || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  React.useEffect(() => {
    if (q) {
      setQuery(q);
      performSearch(q);
    } else {
      performSearch('');
    }

    fetch('/api/collections')
      .then((res) => res.json())
      .then((data) => {
        if (data.collections) setCollections(data.collections);
      })
      .catch(console.error);
  }, [q, performSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div className="space-y-3 font-mono text-xs text-[#00ff66]">
      {/* Search Input Module */}
      <div className="border border-[#005522] bg-[#020602] p-3">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1 flex items-center border border-[#005522] bg-[#010401]">
            <span className="pl-2.5 text-[#00ff66] select-none">&gt;</span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="SEARCH OCR TEXT, VISUAL CONCEPTS, FILENAMES, TAGS..."
              className="w-full bg-transparent px-2 py-2 text-[11px] text-[#00ff66] placeholder-[#007733] focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="border border-[#00ff66] bg-[#00220a] hover:bg-[#004414] px-4 py-2 text-[11px] font-bold text-[#00ff66] tracking-wider transition-all disabled:opacity-40 whitespace-nowrap"
          >
            [ {loading ? 'SCANNING...' : 'EXECUTE SCAN'} ]
          </button>
        </form>

        <div className="mt-2 pt-2 border-t border-[#005522]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[10px] text-[#00aa44]">
          <div>
            SEARCH QUERY: <span className="text-[#00ff66]">"{q || '*'}"</span> | MATCHED: {results.length} SIGNALS
          </div>
          <div className="flex flex-wrap gap-2 text-[9px]">
            <span>[#] VECTOR EMBEDDINGS</span>
            <span>[T] OCR STRINGS</span>
            <span>[K] METADATA TOKENS</span>
          </div>
        </div>
      </div>

      {/* Ranked Results Grid */}
      {results.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {results.map(({ asset, relevanceScore, matchReason, matchType, highlightSnippet }) => (
            <div
              key={asset.id}
              className="border border-[#005522] bg-[#020502] p-2 hover:border-[#00ff66] transition-all flex flex-col justify-between"
            >
              <AssetCard
                asset={asset}
                onSelect={(a) => setSelectedAsset(a)}
                onFindSimilar={(a) => router.push(`/similar?assetId=${a.id}`)}
              />

              <div className="mt-2 border-t border-[#003311] pt-2 text-[9px]">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-[#00ff66]">[{matchType.toUpperCase()} MATCH]</span>
                  <span className="text-[#ff3333] font-mono">{relevanceScore}% RELEVANCE</span>
                </div>
                <p className="text-[#00aa44] mt-0.5">{matchReason}</p>
                {highlightSnippet && (
                  <div className="mt-1 bg-black p-1 border border-[#003311] text-[8px] text-[#00ff66] truncate">
                    "{highlightSnippet}"
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border border-[#005522] bg-[#020602] p-8 text-center text-[#00aa44]">
          // NO MATCHING TELEMETRY RECORDS FOUND FOR "{query}"
        </div>
      )}

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
        }}
      />
    </div>
  );
}
