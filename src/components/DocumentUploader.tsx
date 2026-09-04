"use client";

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { extractDocumentAction, verifyDocumentAction } from '@/lib/actions/extract';

// ── Pipeline stages for the loading view ──────────────────────────────────────
const PIPELINE_STAGES = [
  { id: 'compress',  label: 'Document Detection',  sub: 'Reading image data' },
  { id: 'extract',   label: 'AI Field Extraction',  sub: 'Gemini reading document' },
  { id: 'registry',  label: 'Registry Lookup',      sub: 'Querying Supabase' },
  { id: 'compare',   label: 'Field Comparison',     sub: 'Matching 7 fields' },
  { id: 'rules',     label: 'Rule Evaluation',      sub: 'Deterministic engine' },
  { id: 'audit',     label: 'Audit Generation',     sub: 'SHA-256 + Supabase write' },
];

type StageState = 'idle' | 'active' | 'done';

function formatFileSize(bytes: number) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// ── Loading overlay with pipeline stages ──────────────────────────────────────
function PipelineLoader({ stageIndex }: { stageIndex: number }) {
  return (
    <div className="fixed inset-0 z-50 bg-[#050b14]/95 backdrop-blur-sm flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white">Verifying Document</h2>
          <p className="text-sm text-slate-400 mt-1">Please wait — this takes 5–15 seconds</p>
        </div>

        <div className="space-y-2">
          {PIPELINE_STAGES.map((stage, i) => {
            const state: StageState = i < stageIndex ? 'done' : i === stageIndex ? 'active' : 'idle';
            return (
              <div
                key={stage.id}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                  state === 'done'   ? 'border-emerald-500/30 bg-emerald-500/5' :
                  state === 'active' ? 'border-cyan-500/50 bg-cyan-500/10' :
                                       'border-slate-800 bg-slate-900/30 opacity-40'
                }`}
              >
                {/* Icon */}
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                  state === 'done'   ? 'bg-emerald-500/20' :
                  state === 'active' ? 'bg-cyan-500/20' :
                                       'bg-slate-800'
                }`}>
                  {state === 'done' ? (
                    <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : state === 'active' ? (
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-slate-600" />
                  )}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-semibold ${
                    state === 'done' ? 'text-emerald-400' :
                    state === 'active' ? 'text-cyan-300' : 'text-slate-600'
                  }`}>
                    {stage.label}
                  </div>
                  {state === 'active' && (
                    <div className="text-xs text-slate-500 mt-0.5">{stage.sub}</div>
                  )}
                </div>

                {/* Status tag */}
                {state === 'done' && (
                  <span className="text-xs text-emerald-500 font-semibold shrink-0">Done</span>
                )}
                {state === 'active' && (
                  <span className="text-xs text-cyan-400 font-semibold shrink-0 animate-pulse">Running</span>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          Synthetic demo data only · No real documents are processed
        </p>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function DocumentUploader() {
  const [file, setFile]           = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pipelineStage, setPipelineStage] = useState(0);
  const [error, setError]         = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length > 0) processFile(e.dataTransfer.files[0]);
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) processFile(e.target.files[0]);
  };

  const processFile = (selectedFile: File) => {
    setError(null);
    const validTypes = ['image/jpeg', 'image/png'];
    if (!validTypes.includes(selectedFile.type)) {
      setError('Unsupported format. Please upload a JPG or PNG passport image.');
      return;
    }
    setFile(selectedFile);
    if (selectedFile.type.startsWith('image/')) {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const removeFile = () => {
    setFile(null);
    setError(null);
    if (previewUrl) { URL.revokeObjectURL(previewUrl); setPreviewUrl(null); }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const compressImage = async (inputFile: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const MAX_WIDTH = 1200, MAX_HEIGHT = 1600;
          let { width, height } = img;
          console.log(`Original: ${width}×${height}, ${(inputFile.size / 1024 / 1024).toFixed(2)} MB`);

          if (width > height ? width > MAX_WIDTH : height > MAX_HEIGHT) {
            if (width > height) { height = Math.round(height * MAX_WIDTH / width); width = MAX_WIDTH; }
            else { width = Math.round(width * MAX_HEIGHT / height); height = MAX_HEIGHT; }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width; canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject(new Error('Canvas unavailable'));
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => {
            if (!blob) return reject(new Error('Compression failed'));
            console.log(`Compressed: ${width}×${height}, ${(blob.size / 1024).toFixed(1)} KB`);
            resolve(new File([blob], inputFile.name.replace(/\.[^/.]+$/, '') + '.jpg', { type: 'image/jpeg' }));
          }, 'image/jpeg', 0.8);
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = event.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(inputFile);
    });
  };

  const friendlyError = (raw: string): string => {
    if (raw.includes('GEMINI_API_KEY') || raw.includes('API key'))
      return 'AI extraction service is unavailable. Please check server configuration.';
    if (raw.includes('not found for API') || raw.includes('generateContent'))
      return 'AI model is temporarily unavailable. Please try again in a moment.';
    if (raw.includes('timeout') || raw.includes('TIMEOUT') || raw.includes('UND_ERR'))
      return 'The AI extraction timed out. Please try again — it usually succeeds on retry.';
    if (raw.includes('Failed to extract mandatory'))
      return 'AI could not read the document clearly. Ensure the image is well-lit and not blurry.';
    if (raw.includes('No data returned'))
      return 'AI returned an empty response. Please try uploading again.';
    return raw.length > 200 ? 'An unexpected error occurred. Please try again.' : raw;
  };

  const handleVerify = async () => {
    if (!file) return;
    setIsLoading(true);
    setError(null);
    setPipelineStage(0); // Stage 0: Document Detection / Compress

    try {
      const compressedFile = await compressImage(file);
      setPipelineStage(1); // Stage 1: AI Extraction

      const formData = new FormData();
      formData.append('document', compressedFile);

      const extractRes = await extractDocumentAction(formData);
      setPipelineStage(2); // Stage 2: Registry Lookup

      if (!extractRes.success) throw new Error(extractRes.error || 'Extraction failed.');
      if (!extractRes.data)    throw new Error('No data returned from extraction.');

      setPipelineStage(3); // Stage 3: Field Comparison
      await new Promise(r => setTimeout(r, 150)); // tiny visual breath

      setPipelineStage(4); // Stage 4: Rule Evaluation
      const verificationResult = await verifyDocumentAction(extractRes.data);

      setPipelineStage(5); // Stage 5: Audit Generation
      await new Promise(r => setTimeout(r, 200));

      sessionStorage.setItem('vx_extracted', JSON.stringify(extractRes.data));
      sessionStorage.setItem('vx_result',    JSON.stringify(verificationResult));
      sessionStorage.removeItem('vx_demo');

      router.push('/result/demo');

    } catch (err: any) {
      console.error('[VerifyX]', err);
      setError(friendlyError(err.message || 'An unexpected error occurred.'));
      setIsLoading(false);
      setPipelineStage(0);
    }
  };

  return (
    <>
      {isLoading && <PipelineLoader stageIndex={pipelineStage} />}

      <div className="w-full max-w-2xl mx-auto">
        {/* Drop zone */}
        <div
          className={`relative border-2 border-dashed rounded-3xl p-10 text-center transition-all ${
            isDragging
              ? 'border-cyan-400 bg-cyan-500/10'
              : file
                ? 'border-slate-600 bg-slate-900/60'
                : 'border-slate-700 hover:border-slate-500 bg-slate-900/50 hover:bg-slate-800/50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !file && fileInputRef.current?.click()}
          style={{ cursor: file ? 'default' : 'pointer' }}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/jpeg,image/png"
            onChange={handleFileChange}
          />

          {!file ? (
            <div className="flex flex-col items-center justify-center py-8 pointer-events-none">
              <div className="w-16 h-16 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Drop your passport here</h3>
              <p className="text-slate-400 mb-6">or click to browse files</p>
              <div className="flex flex-wrap justify-center gap-3 text-xs">
                <span className="bg-slate-800 border border-slate-700 text-slate-400 px-3 py-1 rounded-full">
                  Supported Document: Passport
                </span>
                <span className="bg-slate-800 border border-slate-700 text-slate-400 px-3 py-1 rounded-full">
                  JPG or PNG
                </span>
                <span className="bg-amber-500/10 border border-amber-500/20 text-amber-400 px-3 py-1 rounded-full font-semibold">
                  Synthetic Demo Data Only
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              {previewUrl ? (
                <div className="relative w-44 h-60 mb-5 rounded-xl overflow-hidden border border-slate-600 bg-black shadow-lg">
                  <img src={previewUrl} alt="Document preview" className="w-full h-full object-cover" />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-2 pb-2 pt-4">
                    <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                      Ready to verify
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-44 h-60 mb-5 rounded-xl border border-slate-700 bg-slate-800 flex flex-col items-center justify-center">
                  <svg className="w-10 h-10 text-slate-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span className="text-slate-400 text-sm font-medium">Passport</span>
                </div>
              )}

              <div className="text-center mb-5 w-full max-w-xs">
                <h4 className="text-white font-semibold truncate mb-1" title={file.name}>{file.name}</h4>
                <p className="text-slate-400 text-sm">
                  {file.type.split('/')[1].toUpperCase()} · {formatFileSize(file.size)}
                </p>
              </div>

              <button
                onClick={(e) => { e.stopPropagation(); removeFile(); }}
                className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
                disabled={isLoading}
              >
                Remove file
              </button>
            </div>
          )}
        </div>

        {/* CTA + error */}
        <div className="mt-6 flex flex-col items-center gap-4">
          {error && (
            <div className="w-full bg-red-500/10 border border-red-500/20 rounded-xl px-5 py-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <div className="text-sm font-semibold text-red-400 mb-0.5">Verification Error</div>
                  <div className="text-sm text-red-300/80">{error}</div>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleVerify}
            disabled={!file || isLoading}
            className={`w-full max-w-sm py-4 rounded-full font-bold text-lg transition-all ${
              !file
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_24px_rgba(6,182,212,0.3)] active:scale-[0.98]'
            }`}
          >
            Verify Document
          </button>

          <div className="text-center text-xs text-slate-600 space-y-1 mt-2">
            <p>Synthetic demo data only · No real documents are stored</p>
            <p>Image is compressed in-browser before transmission</p>
          </div>
        </div>
      </div>
    </>
  );
}
