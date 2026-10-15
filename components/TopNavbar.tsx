'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Search, Sparkles, UploadCloud, X, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TopNavbarProps {
  onOpenUpload: () => void;
  defaultQuery?: string;
}

export function TopNavbar({ onOpenUpload, defaultQuery = '' }: TopNavbarProps) {
  const router = useRouter();
  const [query, setQuery] = React.useState(defaultQuery);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      router.push('/memories');
    } else {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-slate-800/80 bg-[#090d16]/90 px-6 backdrop-blur-md">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative flex-1 max-w-2xl">
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Search visual memory (e.g. "AWS diagram", "blue mechanical keyboard", "receipts with $49.99")...'
            className="w-full rounded-xl border border-slate-800 bg-slate-900/80 py-2 pl-10 pr-10 text-sm text-slate-100 placeholder-slate-500 transition-all focus:border-cyan-500/50 focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-3 p-0.5 text-slate-400 hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </form>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 ml-4">
        <button
          onClick={onOpenUpload}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 transition-all active:scale-95"
        >
          <UploadCloud className="h-4 w-4" />
          <span>Upload Memory</span>
        </button>
      </div>
    </header>
  );
}
