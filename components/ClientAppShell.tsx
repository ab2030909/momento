'use client';

import React from 'react';
import { TerminalSidebar } from '@/components/TerminalSidebar';
import { TerminalHeader } from '@/components/TerminalHeader';
import { UploadModal } from '@/components/UploadModal';
import { AssetDetailModal } from '@/components/AssetDetailModal';
import { VisualAsset, Collection, SystemStatus } from '@/types';
import { useRouter } from 'next/navigation';

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
    <div className="flex flex-col min-h-screen bg-[#030603] text-[#00ff66] font-mono p-2">
      {/* Outer green CRT terminal frame */}
      <div className="flex-1 flex flex-col border border-[#005522] bg-[#020502] overflow-hidden shadow-[0_0_20px_rgba(0,255,102,0.1)]">
        {/* Top Header */}
        <TerminalHeader
          systemStatus={systemStatus}
          onOpenUpload={() => setIsUploadOpen(true)}
        />

        {/* Content body with sidebar */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          <TerminalSidebar systemStatus={systemStatus} />

          <main className="flex-1 overflow-y-auto p-3 bg-[#030703]">
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
