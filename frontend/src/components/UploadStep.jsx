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
      {/* Top Header Card */}
      <div className="rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#eff6ff] border border-blue-200 px-3 py-0.5 text-xs font-semibold text-[#2563eb]">
              <Cpu className="h-3.5 w-3.5" />
              Step 1 of 4 · Multimodal Vision Extraction (`gemma-4-26b-a4b-it`)
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#1e293b]">
              1. Upload Your Startup Pitch Slide
            </h2>
            <p className="text-sm text-[#64748b] max-w-2xl">
              Upload a pitch deck slide or one-pager image. Gemma 4 extracts a structured{' '}
              <span className="font-semibold text-[#2563eb]">ASEAN Startup Passport</span>{' '}
              to power deterministic cross-border partner matching.
            </p>
          </div>

          <button
            type="button"
            onClick={handleUseDemoPitch}
            disabled={isAnalyzing || loadingDemoSlide}
            className="shrink-0 inline-flex items-center justify-center gap-2 rounded-lg border border-blue-200 bg-[#eff6ff] px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#2563eb] hover:bg-blue-100 transition cursor-pointer disabled:opacity-50"
          >
            <Wand2 className="h-4 w-4" />
            {loadingDemoSlide ? 'Loading Demo Slide...' : 'Use Demo Pitch (SmartTONG MY → VN)'}
          </button>
        </div>
      </div>

      {/* Main Upload / Preview Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8">
          <div className="rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-xs">
            {!imagePreview ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`group flex flex-col items-center justify-center rounded-xl border-[2.5px] border-dashed p-10 text-center transition-all cursor-pointer min-h-[300px] ${
                  isDragging
                    ? 'border-[#2563eb] bg-[#eff6ff]'
                    : 'border-[#e2e8f0] bg-[#f8fafc] hover:border-[#2563eb] hover:bg-[#eff6ff]'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) => validateAndSetFile(e.target.files?.[0])}
                  className="hidden"
                />

                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-[#2563eb] group-hover:scale-105 transition-transform">
                  <UploadCloud className="h-7 w-7" />
                </div>

                <h3 className="text-base font-semibold text-[#1e293b]">
                  Drag & drop your pitch image here, or click to browse
                </h3>
                <p className="mt-1 text-xs text-[#64748b] max-w-md">
                  PNG, JPEG, or WebP · Max {MAX_FILE_SIZE_MB} MB
                </p>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#e2e8f0] bg-white px-3.5 py-2 text-xs font-semibold text-[#1e293b] shadow-2xs">
                    <FileImage className="h-4 w-4 text-[#2563eb]" />
                    Browse Image
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUseDemoPitch();
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-[#eff6ff] px-3.5 py-2 text-xs font-semibold text-[#2563eb] hover:bg-blue-100 transition cursor-pointer"
                  >
                    <Wand2 className="h-4 w-4" />
                    Use Demo Pitch — SmartTONG (Malaysia → Vietnam)
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e2e8f0] pb-3">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-5 w-5 text-[#16a34a] shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-[#1e293b]">{imageFile?.name}</p>
                      <p className="text-xs text-[#64748b]">
                        {imageFile?.type?.toUpperCase()} ·{' '}
                        {((imageFile?.size || 0) / 1024).toFixed(1)} KB · Ready for Gemma 4 Vision
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isAnalyzing}
                      className="rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-3 py-1.5 text-xs font-semibold text-[#1e293b] hover:bg-slate-200/70 transition cursor-pointer disabled:opacity-50"
                    >
                      Replace Image
                    </button>
                    <button
                      type="button"
                      onClick={onClearImage}
                      disabled={isAnalyzing}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-[#dc2626] hover:bg-red-100 transition cursor-pointer disabled:opacity-50"
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
                <div className="relative overflow-hidden rounded-xl border border-[#e2e8f0] bg-slate-900">
                  <img
                    src={imagePreview}
                    alt="Uploaded Startup Pitch Preview"
                    className="max-h-[380px] w-full object-contain mx-auto"
                  />

                  {isAnalyzing && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 backdrop-blur-xs p-6 text-center">
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#eff6ff] border border-blue-200 text-[#2563eb]">
                        <Sparkles className="h-6 w-6 animate-spin" />
                      </div>
                      <h4 className="text-base font-bold text-[#1e293b]">
                        Analyzing Pitch Slide with Gemma 4...
                      </h4>
                      <p className="mt-1 text-xs text-[#64748b] max-w-md">
                        Extracting company profile, capabilities, partnership needs, and target ASEAN expansion markets via{' '}
                        <code className="font-mono-code text-[#2563eb]">POST /api/pitch/analyze</code>
                      </p>
                      <div className="mt-4 w-full max-w-xs space-y-2">
                        <div className="h-2 w-full rounded-full animate-shimmer" />
                        <div className="h-2 w-4/5 mx-auto rounded-full animate-shimmer" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Action Box & Demo Story Guide */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-[#1e293b] flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#2563eb]" />
              Gemma 4 Extraction Pipeline
            </h3>

            <ul className="space-y-2.5 text-xs text-[#64748b]">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#eff6ff] text-[10px] font-bold text-[#2563eb]">
                  1
                </span>
                <span>
                  Extracts pitch details using open-weight{' '}
                  <strong className="text-[#1e293b]">gemma-4-26b-a4b-it</strong>.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#eff6ff] text-[10px] font-bold text-[#2563eb]">
                  2
                </span>
                <span>
                  Validates output strictly against Pydantic{' '}
                  <code className="font-mono-code text-[#2563eb]">StartupProfile</code> schema.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#eff6ff] text-[10px] font-bold text-[#2563eb]">
                  3
                </span>
                <span>
                  Opens an editable <strong className="text-[#1e293b]">Startup Passport</strong> so founders can refine before partner matching.
                </span>
              </li>
            </ul>

            <button
              type="button"
              onClick={onAnalyze}
              disabled={!imageFile || isAnalyzing}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#2563eb] px-5 py-3 text-sm font-semibold text-white shadow-xs hover:bg-blue-700 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
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
          <div className="rounded-xl border border-[#fcd34d] bg-[#fffbeb] p-4 text-xs text-[#92400e] space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertTriangle className="h-4 w-4 shrink-0 text-[#d97706]" />
              Featured Demo Story
            </div>
            <p className="leading-relaxed">
              <strong>SmartTONG (EcoGenius Malaysia)</strong> builds AI smart-waste bins and seeks a{' '}
              <strong>30-day municipal pilot in Vietnam</strong>. Click{' '}
              <span className="underline font-semibold">"Use Demo Pitch"</span> to load the bundled slide.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
