'use client';

import React from 'react';
import { SystemStatus } from '@/types';
import { Copy, Check } from 'lucide-react';

export default function SettingsPage() {
  const [status, setStatus] = React.useState<SystemStatus | null>(null);
  const [copiedEnv, setCopiedEnv] = React.useState(false);

  React.useEffect(() => {
    fetch('/api/status')
      .then((res) => res.json())
      .then((data) => setStatus(data))
      .catch(console.error);
  }, []);

  const envSample = `# Cloudinary Pipeline
CLOUDINARY_CLOUD_NAME=tgjvnqns
CLOUDINARY_API_KEY=945815459198857
CLOUDINARY_API_SECRET=35YfxQEMSBCKQ02YgwxAqungi1U
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=tgjvnqns

# Groq LPU Ultra-Fast AI Multimodal Inference
GROQ_API_KEY=gsk_...
`;

  const copyEnv = () => {
    navigator.clipboard.writeText(envSample);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2000);
  };

  return (
    <div className="space-y-3 font-mono text-xs text-[#00ff66] max-w-4xl mx-auto">
      {/* Header */}
      <div className="border border-[#005522] bg-[#020602] p-3">
        <h1 className="text-sm font-bold tracking-wider text-[#00ff66]">
          // SYSTEM CONFIGURATION &amp; SUBSYSTEM TELEMETRY
        </h1>
        <p className="text-[10px] text-[#00aa44]">
          HARDWARE INTERFACES, PIPELINES &amp; CLOUD CREDENTIALS
        </p>
      </div>

      {/* Subsystem grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="border border-[#005522] bg-[#020602] p-3 space-y-2">
          <div className="flex items-center justify-between font-bold text-[11px]">
            <span>// CLOUDINARY ENGINE</span>
            <span className={status?.cloudinaryConfigured ? "text-[#00ff66]" : "text-amber-400"}>
              [{status?.cloudinaryConfigured ? "ONLINE" : "OFFLINE"}]
            </span>
          </div>
          <div className="text-[10px] text-[#00aa44] space-y-1">
            <div>CLOUD NAME: <span className="text-[#00ff66]">{status?.cloudName || 'N/A'}</span></div>
            <div>STATUS: <span className="text-[#00ff66]">SIGNED DIRECT UPLOADS ACTIVE</span></div>
            <div>OPTIMIZATION: <span className="text-[#00ff66]">F_AUTO / Q_AUTO ENABLED</span></div>
          </div>
        </div>

        <div className="border border-[#005522] bg-[#020602] p-3 space-y-2">
          <div className="flex items-center justify-between font-bold text-[11px]">
            <span>// AI MULTIMODAL INFERENCE</span>
            <span className={status?.aiConfigured ? "text-[#00ff66]" : "text-amber-400"}>
              [{status?.aiConfigured ? "ONLINE" : "STANDBY"}]
            </span>
          </div>
          <div className="text-[10px] text-[#00aa44] space-y-1">
            <div>PROVIDER: <span className="text-[#00ff66]">{status?.aiProvider}</span></div>
            <div>OCR EXTRACTION: <span className="text-[#00ff66]">ACTIVE</span></div>
            <div>VECTOR RETRIEVAL: <span className="text-[#00ff66]">ACTIVE</span></div>
          </div>
        </div>
      </div>

      {/* Config File Inspector */}
      <div className="border border-[#005522] bg-[#020602] p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-bold text-[11px] text-[#00ff66]">
            // ACTIVE ENVIRONMENT SCHEMA (.env.local)
          </span>
          <button
            onClick={copyEnv}
            className="border border-[#005522] hover:border-[#00ff66] px-2 py-0.5 text-[9px] text-[#00ff66]"
          >
            {copiedEnv ? '[ COPIED ]' : '[ COPY CONFIG ]'}
          </button>
        </div>
        <pre className="border border-[#003311] bg-black p-3 text-[10px] text-[#00aa44] overflow-x-auto leading-relaxed">
          {envSample}
        </pre>
      </div>

      {/* Persistence Info */}
      <div className="border border-[#005522] bg-[#020602] p-3 text-[10px] text-[#00aa44]">
        DATABASE SCHEMA: <span className="text-[#00ff66]">{status?.databaseType}</span> | TOTAL ASSETS: <span className="text-[#00ff66]">{status?.totalAssets}</span> | COLLECTIONS: <span className="text-[#00ff66]">{status?.totalCollections}</span>
      </div>
    </div>
  );
}
