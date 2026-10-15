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
    <div className="relative flex flex-col min-h-screen bg-[#020502] text-[#00ff66] font-mono p-2 overflow-hidden">
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
        />

        {/* Content body with sidebar */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          <TerminalSidebar systemStatus={systemStatus} />

          <main className="flex-1 overflow-y-auto p-3 bg-[#020602]/85">
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
