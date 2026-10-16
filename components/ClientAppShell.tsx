'use client';

import React from 'react';
import { TerminalSidebar } from '@/components/TerminalSidebar';
import { TerminalHeader } from '@/components/TerminalHeader';
import { UploadModal } from '@/components/UploadModal';
import { AssetDetailModal } from '@/components/AssetDetailModal';
import { VisualAsset, Collection, SystemStatus } from '@/types';
import { useRouter } from 'next/navigation';

import { NeuralWorldMapCanvas } from '@/components/NeuralWorldMapCanvas';

export function ClientAppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isUploadOpen, setIsUploadOpen] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [selectedAsset, setSelectedAsset] = React.useState<VisualAsset | null>(null);
  const [collections, setCollections] = React.useState<Collection[]>([]);
  const [systemStatus, setSystemStatus] = React.useState<SystemStatus | null>(null);

  // Load collections & system status
  React.useEffect(() => {
    fetch('/api/collections')
      .then((res) => res.json())
      .then((data) => {
        if (data.collections) setCollections(data.collections);
      })
      .catch(console.error);

    fetch('/api/status')
      .then((res) => res.json())
      .then((data) => {
        setSystemStatus(data);
      })
      .catch(console.error);
  }, []);

  const handleToggleCollection = async (assetId: string, collectionId: string) => {
    try {
      const res = await fetch('/api/collections', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId, collectionId }),
      });
      if (res.ok) {
        const { asset } = await res.json();
        if (selectedAsset && selectedAsset.id === assetId) {
          setSelectedAsset(asset);
        }
        const colRes = await fetch('/api/collections');
        const colData = await colRes.json();
        if (colData.collections) setCollections(colData.collections);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteAsset = async (assetId: string) => {
    try {
      await fetch(`/api/assets/${assetId}`, { method: 'DELETE' });
      setSelectedAsset(null);
      window.location.reload();
    } catch (e) {
      console.error(e);
    }
  };

  const handleFindSimilar = (asset: VisualAsset) => {
    router.push(`/similar?assetId=${asset.id}`);
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-[#020502] text-[#00ff66] font-mono p-1 sm:p-2 overflow-x-hidden">
      {/* Global Neural Network World Map in Website Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden opacity-35">
        <NeuralWorldMapCanvas className="w-full h-full" />
      </div>

      {/* Outer green CRT terminal frame */}
      <div className="relative z-10 flex-1 flex flex-col border border-[#005522]/80 bg-[#020502]/75 backdrop-blur-[2px] overflow-hidden shadow-[0_0_25px_rgba(0,255,102,0.12)]">
        {/* Top Header */}
        <TerminalHeader
          systemStatus={systemStatus}
          onOpenUpload={() => setIsUploadOpen(true)}
          isMobileMenuOpen={isMobileMenuOpen}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        {/* Content body with responsive sidebar */}
        <div className="relative flex flex-1 min-h-0 overflow-hidden">
          {/* Desktop Persistent Sidebar */}
          <div className="hidden md:flex shrink-0">
            <TerminalSidebar systemStatus={systemStatus} />
          </div>

          {/* Mobile Overlay Backdrop */}
          {isMobileMenuOpen && (
            <div
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden fixed inset-0 z-40 bg-black/80 backdrop-blur-sm"
            />
          )}

          {/* Mobile Drawer Sidebar */}
          <div
            className={`md:hidden fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out ${
              isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <div className="h-full flex flex-col shadow-[0_0_30px_rgba(0,255,102,0.3)]">
              <div className="flex justify-end p-2 bg-[#020502] border-b border-[#005522]">
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="border border-[#00ff66] bg-[#00220a] hover:bg-[#ff3333] hover:text-black px-2 py-0.5 text-xs font-bold"
                >
                  [ CLOSE MENU ✕ ]
                </button>
              </div>
              <div className="flex-1 overflow-y-auto" onClick={() => setIsMobileMenuOpen(false)}>
                <TerminalSidebar systemStatus={systemStatus} />
              </div>
            </div>
          </div>

          {/* Main scrollable body */}
          <main className="flex-1 overflow-y-auto p-2 sm:p-3 bg-[#020602]/85">
            {children}
          </main>
        </div>
      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        collections={collections}
        onUploadComplete={(newAsset) => {
          setSelectedAsset(newAsset);
          window.location.reload();
        }}
      />

      {/* Detail Modal */}
      <AssetDetailModal
        asset={selectedAsset}
        collections={collections}
        onClose={() => setSelectedAsset(null)}
        onFindSimilar={handleFindSimilar}
        onToggleCollection={handleToggleCollection}
        onDeleteAsset={handleDeleteAsset}
      />
    </div>
  );
}
