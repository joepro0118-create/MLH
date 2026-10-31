import React, { useRef, useState } from 'react';
import {
  UploadCloud,
  Sparkles,
  FileImage,
  CheckCircle2,
  AlertTriangle,
  Wand2,
  Trash2,
  Cpu,
  ArrowRight,
} from 'lucide-react';
import { generateDemoPitchFile } from '../services/demoData';

const MAX_FILE_SIZE_MB = 10;
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

export default function UploadStep({
  imageFile,
  imagePreview,
  onSelectImage,
  onClearImage,
  onAnalyze,
  isAnalyzing,
  onErrorToast,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [loadingDemoSlide, setLoadingDemoSlide] = useState(false);
  const fileInputRef = useRef(null);

  const validateAndSetFile = (file) => {
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      onErrorToast(
        'Unsupported file type. Please upload a PNG, JPG, or WEBP pitch image.'
      );
      return;
    }
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > MAX_FILE_SIZE_MB) {
      onErrorToast(
        `File is too large (${sizeMB.toFixed(1)} MB). Maximum allowed size is ${MAX_FILE_SIZE_MB} MB.`
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      onSelectImage(file, e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer?.files?.[0];
    validateAndSetFile(file);
  };

  const handleUseDemoPitch = async () => {
    setLoadingDemoSlide(true);
    try {
      const { file, dataUrl } = await generateDemoPitchFile();
      onSelectImage(file, dataUrl);
    } catch {
      onErrorToast('Could not generate bundled demo pitch slide.');
    } finally {
      setLoadingDemoSlide(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Hero Banner */}
      <div className="rounded-2xl border border-emerald-500/25 bg-gradient-to-r from-emerald-950/60 via-slate-900/90 to-cyan-950/50 p-6 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
              <Cpu className="h-3.5 w-3.5" />
              Step 1 of 4 • Multimodal Vision Extraction (`gemma-4-26b-a4b-it`)
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Upload Your Startup Pitch Slide
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl">
              Drop a one-page pitch slide or architecture snapshot. Gemma 4 extracts a structured{' '}
              <span className="text-emerald-300 font-medium">ASEAN Startup Passport</span>{' '}
              to power deterministic cross-border partner matching.
            </p>
          </div>

          <button
            type="button"
            onClick={handleUseDemoPitch}
            disabled={isAnalyzing || loadingDemoSlide}
            className="shrink-0 inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-400/40 bg-cyan-500/15 px-4 py-3 text-sm font-bold text-cyan-200 hover:bg-cyan-500/25 hover:border-cyan-400 transition shadow-md cursor-pointer disabled:opacity-50"
          >
            <Wand2 className="h-4 w-4 text-cyan-300" />
            {loadingDemoSlide ? 'Loading Demo Slide...' : 'Use Demo Pitch (SmartTONG MY → VN)'}
          </button>
        </div>
      </div>

      {/* Main Upload / Preview Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8">
          {!imagePreview ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 text-center transition-all cursor-pointer min-h-[340px] ${
                isDragging
                  ? 'border-emerald-400 bg-emerald-500/10 scale-[1.01]'
                  : 'border-slate-700 bg-slate-900/60 hover:border-emerald-500/60 hover:bg-slate-900/90'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => validateAndSetFile(e.target.files?.[0])}
                className="hidden"
              />

              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 group-hover:scale-110 transition-transform">
                <UploadCloud className="h-8 w-8" />
              </div>

              <h3 className="text-lg font-bold text-white">
                Drag & drop your pitch slide image here
              </h3>
              <p className="mt-1.5 text-sm text-slate-400 max-w-md">
                Supports <span className="text-slate-200 font-medium">PNG, JPG, WEBP</span> up to{' '}
                <span className="text-slate-200 font-medium">{MAX_FILE_SIZE_MB} MB</span>. Or click to browse from your device.
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-200 border border-slate-700">
                  <FileImage className="h-4 w-4 text-emerald-400" />
                  Browse Local Image
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUseDemoPitch();
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/20 px-3.5 py-2 text-xs font-semibold text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition cursor-pointer"
                >
                  <Wand2 className="h-4 w-4" />
                  Load SmartTONG Demo Pitch
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-white">{imageFile?.name}</p>
                    <p className="text-xs text-slate-400">
                      {imageFile?.type?.toUpperCase()} •{' '}
                      {((imageFile?.size || 0) / 1024).toFixed(1)} KB • Ready for Gemma 4 Vision
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isAnalyzing}
                    className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition cursor-pointer disabled:opacity-50"
                  >
                    Replace Image
                  </button>
                  <button
                    type="button"
                    onClick={onClearImage}
                    disabled={isAnalyzing}
                    className="inline-flex items-center gap-1 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(e) => validateAndSetFile(e.target.files?.[0])}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Image Preview Container */}
              <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
                <img
                  src={imagePreview}
                  alt="Uploaded Startup Pitch Preview"
                  className="max-h-[420px] w-full object-contain mx-auto"
                />

                {isAnalyzing && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/85 backdrop-blur-sm p-6 text-center">
                    <div className="relative mb-4 flex h-16 w-16 items-center justify-center">
                      <div className="absolute inset-0 animate-ping rounded-full bg-emerald-500/30" />
                      <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300">
                        <Sparkles className="h-7 w-7 animate-pulse" />
                      </div>
                    </div>
                    <h4 className="text-lg font-bold text-white">
                      Gemma 4 Vision is Analyzing Pitch Slide...
                    </h4>
                    <p className="mt-1 text-xs text-slate-300 max-w-md">
                      Extracting company profile, core capabilities, partnership needs, and target ASEAN expansion markets via{' '}
                      <code className="font-mono-code text-emerald-300">POST /api/pitch/analyze</code>
                    </p>
                    <div className="mt-5 w-full max-w-xs space-y-2">
                      <div className="h-2 w-full rounded-full animate-shimmer" />
                      <div className="h-2 w-4/5 mx-auto rounded-full animate-shimmer" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Action Box & Demo Story Guide */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              Gemma 4 Extraction Pipeline
            </h3>

            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-[10px] font-bold text-emerald-300">
                  1
                </span>
                <span>
                  Reads pitch slide typography, architecture blocks, and market tags with{' '}
                  <strong className="text-white">gemma-4-26b-a4b-it</strong>.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-[10px] font-bold text-emerald-300">
                  2
                </span>
                <span>
                  Validates output strictly against Pydantic{' '}
                  <code className="font-mono-code text-cyan-300">StartupProfile</code> schema.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-[10px] font-bold text-emerald-300">
                  3
                </span>
                <span>
                  Opens an editable <strong className="text-white">Startup Passport</strong> so founders can refine before partner matching.
                </span>
              </li>
            </ul>

            <button
              type="button"
              onClick={onAnalyze}
              disabled={!imageFile || isAnalyzing}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-teal-400 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                  Analyzing with Gemma 4...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Analyze with Gemma 4
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>

          {/* Demo Story Context Card */}
          <div className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-4 text-xs text-slate-300 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-amber-300">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              Featured Demo Story
            </div>
            <p className="leading-relaxed">
              <strong>SmartTONG (EcoGenius Malaysia)</strong> builds AI edge-sorting smart waste bins and wants to launch a{' '}
              <strong>30-day municipal smart-waste pilot in Vietnam</strong>. Click{' '}
              <span className="text-cyan-300 font-semibold">"Use Demo Pitch"</span> above to load the slide immediately.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
