'use client';

import React from 'react';
import {
  UploadCloud,
  X,
  FileImage,
  AlertCircle,
  CheckCircle2,
  Loader2,
  FolderPlus,
  Sparkles,
} from 'lucide-react';
import { Collection, VisualAsset } from '@/types';
import { useAuth } from '@/lib/auth/AuthContext';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  collections: Collection[];
  onUploadComplete: (newAsset: VisualAsset) => void;
}

export function UploadModal({
  isOpen,
  onClose,
  collections,
  onUploadComplete,
}: UploadModalProps) {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [selectedCollectionId, setSelectedCollectionId] = React.useState<string>('');
  const [status, setStatus] = React.useState<'idle' | 'uploading' | 'analyzing' | 'done' | 'error'>('idle');
  const [progressMsg, setProgressMsg] = React.useState<string>('');
  const [errorMsg, setErrorMsg] = React.useState<string>('');

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setStatus('idle');
    setProgressMsg('');
    setErrorMsg('');
    onClose();
  };

  if (!isOpen) return null;

  // Gatekeeper: If user is not logged in, require Google Authentication
  if (!user) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm font-mono text-xs text-[#00ff66]">
        <div className="relative w-full max-w-md border-2 border-[#00ff66] bg-[#020502] p-6 shadow-[0_0_25px_rgba(0,255,102,0.25)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#005522]">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-[#00ff66] animate-pulse" />
              <h3 className="font-bold text-[#00ff66] tracking-wider text-sm">
                // AUTHENTICATION_REQUIRED
              </h3>
            </div>
            <button
              onClick={handleClose}
              className="border border-[#00ff66] bg-[#00220a] hover:bg-[#ff3333] hover:text-black px-2 py-0.5 font-bold"
            >
              [ X ]
            </button>
          </div>

          <div className="border border-[#005522] bg-[#010401] p-3 text-[11px] space-y-2 text-[#00aa44]">
            <p className="text-[#00ff66] font-bold">
              [!] ACCESS RESTRICTED TO VERIFIED USERS
            </p>
            <p>
              Anonymous uploads are disabled. To ingest visual memories and isolate them into your private vault, please log in with your Google account.
            </p>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-[#005522]">
            <button
              type="button"
              onClick={handleClose}
              className="border border-[#005522] bg-[#010401] px-3 py-1.5 text-[10px] text-[#00aa44] hover:text-[#00ff66]"
            >
              [ CANCEL ]
            </button>
            <a
              href="/login"
              className="border-2 border-[#00ff66] bg-[#00220a] hover:bg-[#004414] px-4 py-1.5 text-[10px] font-bold text-[#00ff66] transition-all hover:shadow-[0_0_12px_#00ff66]"
            >
              [ GO TO GOOGLE LOGIN ]
            </a>
          </div>
        </div>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setErrorMsg('');
      setStatus('idle');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setStatus('uploading');
      setProgressMsg('ACQUIRING CLOUDINARY SIGNATURE TOKEN & COMPRESSION PROFILE...');

      const signRes = await fetch('/api/cloudinary/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder: 'momento_memories' }),
      });
      const signData = await signRes.json();

      let secureUrl = '';
      let cloudinaryPublicId = '';
      let width = 1200;
      let height = 800;
      let bytes = selectedFile.size;
      let format = selectedFile.type.split('/')[1] || 'png';

      if (signData.configured && signData.signature) {
        setProgressMsg('TRANSMITTING TO CLOUDINARY WITH AUTO-COMPRESSION (f_auto, q_auto)...');
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('api_key', signData.apiKey);
        formData.append('timestamp', signData.timestamp.toString());
        formData.append('signature', signData.signature);
        formData.append('folder', signData.folder);

        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/${signData.cloudName}/image/upload`,
          {
            method: 'POST',
            body: formData,
          }
        );

        if (!uploadRes.ok) {
          const errData = await uploadRes.json().catch(() => ({}));
          throw new Error(errData?.error?.message || 'Cloudinary upload transmission failed');
        }

        const uploadData = await uploadRes.json();
        secureUrl = uploadData.secure_url;
        cloudinaryPublicId = uploadData.public_id;
        width = uploadData.width;
        height = uploadData.height;
        format = uploadData.format;
        bytes = uploadData.bytes;
      } else {
        setProgressMsg('SANDBOX MODE: Converting to local binary data uri...');
        secureUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(selectedFile);
        });
      }

      setStatus('analyzing');
      setProgressMsg('EXECUTING GROQ LPU MULTIMODAL INFERENCE...');

      const assetRes = await fetch('/api/assets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user?.id ? { 'x-user-id': user.id } : {}),
        },
        body: JSON.stringify({
          originalFilename: selectedFile.name,
          secureUrl,
          cloudinaryPublicId: cloudinaryPublicId || undefined,
          width,
          height,
          format,
          bytes,
          collectionIds: selectedCollectionId ? [selectedCollectionId] : [],
          userId: user?.id || undefined,
        }),
      });

      if (!assetRes.ok) {
        throw new Error('Indexing pipeline rejected payload');
      }

      const { asset } = await assetRes.json();

      setStatus('done');
      setProgressMsg('PAYLOAD ACQUIRED, COMPRESSED & INDEXED SUCCESSFULLY!');
      setTimeout(() => {
        onUploadComplete(asset);
        handleClose();
      }, 1000);
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setErrorMsg(err.message || 'Operation failed.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm font-mono text-xs text-[#00ff66]">
      <div className="relative w-full max-w-lg border-2 border-[#00ff66] bg-[#020502] p-5 shadow-[0_0_25px_rgba(0,255,102,0.25)]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#005522]">
          <div>
            <h3 className="font-bold text-[#00ff66] tracking-wider text-sm">
              // TRANSMIT VISUAL MEMORY PAYLOAD
            </h3>
            <p className="text-[10px] text-[#00aa44]">
              Target: Cloudinary Storage &amp; Groq AI Pipeline
            </p>
          </div>
          <button
            onClick={handleClose}
            className="border border-[#00ff66] bg-[#00220a] hover:bg-[#ff3333] hover:text-black px-2 py-0.5 font-bold"
          >
            [ X ]
          </button>
        </div>

        {/* Upload Dropzone */}
        <div className="mt-4 space-y-3">
          {!previewUrl ? (
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-[#005522] bg-[#010401] p-6 text-center cursor-pointer hover:border-[#00ff66] transition-all">
              <UploadCloud className="h-8 w-8 text-[#00ff66] mb-2 animate-bounce" />
              <p className="text-xs font-bold text-[#00ff66]">
                SELECT IMAGE FILE TO INGEST
              </p>
              <p className="text-[9px] text-[#00aa44] mt-1">
                PNG, JPG, WEBP, GIF (AUTO-COMPRESSED VIA CLOUDINARY)
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          ) : (
            <div className="relative border border-[#005522] bg-black p-2">
              <img
                src={previewUrl}
                alt="Upload preview"
                className="h-44 w-full object-contain filter contrast-110"
              />
              <button
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewUrl(null);
                }}
                className="absolute top-2 right-2 border border-[#00ff66] bg-black px-1.5 py-0.5 text-[9px] text-[#ff6666]"
              >
                [ RESET ]
              </button>
            </div>
          )}

          {/* Compression notice */}
          {selectedFile && (
            <div className="border border-[#005522] bg-[#010401] p-2 text-[10px] text-[#00aa44] flex items-center justify-between">
              <div>
                FILE SIZE: <span className="text-[#00ff66] font-bold">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</span>
              </div>
              <div className="text-[9px] text-[#00ff66]">
                [✓] CLOUDINARY AUTO-OPTIMIZE: ACTIVE
              </div>
            </div>
          )}

          {/* Collection Assignment */}
          {collections.length > 0 && (
            <div>
              <label className="block text-[10px] text-[#00aa44] mb-1 font-bold">
                ASSIGN COLLECTION (OPTIONAL):
              </label>
              <select
                value={selectedCollectionId}
                onChange={(e) => setSelectedCollectionId(e.target.value)}
                className="w-full border border-[#005522] bg-[#010401] px-2.5 py-1.5 text-[10px] text-[#00ff66] focus:border-[#00ff66] focus:outline-none"
              >
                <option value="">[ NONE / UNCLASSIFIED ]</option>
                {collections.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Progress / Status feedback */}
          {status !== 'idle' && (
            <div
              className={`p-2 border text-[10px] font-bold ${
                status === 'error'
                  ? 'border-[#ff3333] bg-[#220000] text-[#ff6666]'
                  : status === 'done'
                  ? 'border-[#00ff66] bg-[#00220a] text-[#00ff66]'
                  : 'border-[#00aa44] bg-[#010401] text-[#00ff66]'
              }`}
            >
              &gt; {errorMsg || progressMsg}
            </div>
          )}

          {/* Submit buttons */}
          <div className="pt-2 flex justify-end gap-2 border-t border-[#005522]">
            <button
              type="button"
              onClick={handleClose}
              className="border border-[#005522] bg-[#010401] px-3 py-1.5 text-[10px] text-[#00aa44] hover:text-[#00ff66]"
            >
              [ CANCEL ]
            </button>
            <button
              type="button"
              disabled={!selectedFile || status === 'uploading' || status === 'analyzing'}
              onClick={handleUpload}
              className="border border-[#00ff66] bg-[#00220a] hover:bg-[#004414] px-4 py-1.5 text-[10px] font-bold text-[#00ff66] disabled:opacity-40 transition-all hover:shadow-[0_0_8px_#00ff66]"
            >
              [ {status === 'analyzing' ? 'ANALYZING...' : status === 'uploading' ? 'UPLOADING...' : 'TRANSMIT & SCAN'} ]
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
