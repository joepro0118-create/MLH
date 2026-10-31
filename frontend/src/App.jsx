import React, { useEffect, useState } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  Award,
  FileCheck2,
  Check,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  X,
  Server,
  Globe2,
} from 'lucide-react';
import UploadStep from './components/UploadStep';
import PassportStep from './components/PassportStep';
import MatchesStep from './components/MatchesStep';
import BriefStep from './components/BriefStep';
import {
  API_BASE_URL,
  checkBackendHealth,
  analyzePitchImage,
  findPartnerMatches,
  generatePartnershipBrief,
} from './services/api';

const STEPS = [
  { id: 1, title: 'Pitch Upload', subtitle: 'Gemma 4 Vision', icon: UploadCloud },
  { id: 2, title: 'Startup Passport', subtitle: 'Editable Profile', icon: FileSpreadsheet },
  { id: 3, title: 'Partner Matches', subtitle: 'Top 3 + Graph', icon: Award },
  { id: 4, title: 'Partnership Brief', subtitle: '30-Day POC Plan', icon: FileCheck2 },
];

export default function App() {
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1 state
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Step 2 state
  const [startupProfile, setStartupProfile] = useState(null);
  const [isMatching, setIsMatching] = useState(false);

  // Step 3 state
  const [matches, setMatches] = useState([]);
  const [generatingPartnerId, setGeneratingPartnerId] = useState(null);

  // Step 4 state
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [partnershipBrief, setPartnershipBrief] = useState(null);

  // Backend & Fallback state
  const [backendOnline, setBackendOnline] = useState(null);
  const [allowOfflineFallback, setAllowOfflineFallback] = useState(true);

  // Toasts
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  useEffect(() => {
    let mounted = true;
    checkBackendHealth().then((res) => {
      if (mounted) setBackendOnline(res.online);
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Handlers
  const handleSelectImage = (file, previewUrl) => {
    setImageFile(file);
    setImagePreview(previewUrl);
  };

  const handleClearImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleAnalyzePitch = async () => {
    if (!imageFile) {
      addToast('Please select or load a demo pitch image first.', 'error');
      return;
    }
    setIsAnalyzing(true);
    try {
      const res = await analyzePitchImage(imageFile, { allowOfflineFallback });
      setStartupProfile(res.data);
      if (res.source === 'mock-fallback') {
        setBackendOnline(false);
        addToast(
          'Backend :8000 unreachable — extracted profile using local illustrative demo fallback.',
          'info'
        );
      } else {
        setBackendOnline(true);
        addToast('Startup Passport extracted with Gemma 4!', 'success');
      }
      setCurrentStep(2);
    } catch (err) {
      addToast(err.message || 'Failed to analyze pitch image.', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFindPartners = async () => {
    if (!startupProfile) return;
    setIsMatching(true);
    try {
      const res = await findPartnerMatches(startupProfile, { allowOfflineFallback });
      setMatches(res.data);
      if (res.source === 'mock-fallback') {
        setBackendOnline(false);
        addToast(
          'Ranked top 3 illustrative ASEAN partners (offline demo fallback).',
          'info'
        );
      } else {
        setBackendOnline(true);
        addToast('Ranked top 3 ASEAN partners!', 'success');
      }
      setCurrentStep(3);
    } catch (err) {
      addToast(err.message || 'Failed to find partner matches.', 'error');
    } finally {
      setIsMatching(false);
    }
  };

  const handleGenerateBrief = async (partnerMatch) => {
    if (!startupProfile || !partnerMatch) return;
    setGeneratingPartnerId(partnerMatch.partner_id);
    try {
      const res = await generatePartnershipBrief(
        startupProfile,
        partnerMatch.partner_id,
        partnerMatch,
        { allowOfflineFallback }
      );
      setSelectedPartner(partnerMatch);
      setPartnershipBrief(res.data);
      if (res.source === 'mock-fallback') {
        setBackendOnline(false);
        addToast(
          'Generated illustrative 30-day POC brief (offline demo fallback).',
          'info'
        );
      } else {
        setBackendOnline(true);
        addToast('Partnership Brief & 30-Day POC Plan ready!', 'success');
      }
      setCurrentStep(4);
    } catch (err) {
      addToast(err.message || 'Failed to generate partnership brief.', 'error');
    } finally {
      setGeneratingPartnerId(null);
    }
  };

  const handleRestart = () => {
    setCurrentStep(1);
    setPartnershipBrief(null);
    setSelectedPartner(null);
  };

  const canNavigateToStep = (stepId) => {
    if (stepId === 1) return true;
    if (stepId === 2) return Boolean(startupProfile);
    if (stepId === 3) return Boolean(startupProfile && matches.length > 0);
    if (stepId === 4) return Boolean(partnershipBrief);
    return false;
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Toast Notification Stack */}
      <div
        aria-live="polite"
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full px-4 sm:px-0 pointer-events-none"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start justify-between gap-3 rounded-xl border px-4 py-3 shadow-2xl backdrop-blur-md transition-all ${
              t.type === 'error'
                ? 'border-rose-500/50 bg-rose-950/90 text-rose-100'
                : t.type === 'success'
                ? 'border-emerald-500/50 bg-emerald-950/90 text-emerald-100'
                : 'border-cyan-500/50 bg-slate-900/95 text-slate-100'
            }`}
          >
            <div className="flex items-start gap-2.5 text-xs sm:text-sm font-medium">
              {t.type === 'error' ? (
                <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              )}
              <span>{t.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setToasts((prev) => prev.filter((item) => item.id !== t.id))}
              className="text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Top Navigation & Brand Header */}
      <div>
        <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
            {/* Brand Identity */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 text-slate-950 font-extrabold text-lg shadow-md shadow-emerald-500/20">
                P
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-extrabold tracking-tight text-white">
                    PACT
                  </span>
                  <span className="rounded-md bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[11px] font-bold text-emerald-300">
                    ASEAN Outcome Conversion
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Partnership Action & Collaboration Toolkit • Cross-Border Startup Matching
                </p>
              </div>
            </div>

            {/* API Status & Demo Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-1.5 text-xs">
                <Server className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-slate-400">API:</span>
                <code className="font-mono-code text-slate-200">{API_BASE_URL}</code>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    backendOnline
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      backendOnline ? 'bg-emerald-400' : 'bg-amber-400'
                    }`}
                  />
                  {backendOnline ? 'Connected' : 'Mock Ready'}
                </span>
              </div>

              <label className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-1.5 text-xs text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={allowOfflineFallback}
                  onChange={(e) => setAllowOfflineFallback(e.target.checked)}
                  className="accent-emerald-500 rounded cursor-pointer"
                />
                <span>Resilient Demo Fallback</span>
              </label>
            </div>
          </div>
        </header>

        {/* 4-Step Progress Stepper Bar */}
        <div className="border-b border-slate-800/60 bg-slate-900/40">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
            <nav aria-label="Progress" className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {STEPS.map((step) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                const isClickable = canNavigateToStep(step.id);

                return (
                  <button
                    key={step.id}
                    type="button"
                    disabled={!isClickable}
                    onClick={() => isClickable && setCurrentStep(step.id)}
                    className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                      isActive
                        ? 'border-emerald-500/60 bg-emerald-500/10 shadow-md shadow-emerald-500/5'
                        : isCompleted
                        ? 'border-slate-700 bg-slate-900/80 hover:border-emerald-500/40 cursor-pointer'
                        : 'border-slate-800/70 bg-slate-950/40 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-bold text-xs ${
                        isActive
                          ? 'bg-emerald-500 text-slate-950'
                          : isCompleted
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {isCompleted ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400">
                          Step {step.id}
                        </span>
                      </div>
                      <p className="truncate text-sm font-bold text-white">{step.title}</p>
                      <p className="truncate text-[11px] text-slate-400">{step.subtitle}</p>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Step Container */}
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {currentStep === 1 && (
            <UploadStep
              imageFile={imageFile}
              imagePreview={imagePreview}
              onSelectImage={handleSelectImage}
              onClearImage={handleClearImage}
              onAnalyze={handleAnalyzePitch}
              isAnalyzing={isAnalyzing}
              onErrorToast={(msg) => addToast(msg, 'error')}
            />
          )}

          {currentStep === 2 && (
            <PassportStep
              profile={startupProfile}
              onChangeProfile={setStartupProfile}
              onFindPartners={handleFindPartners}
              onBack={() => setCurrentStep(1)}
              isMatching={isMatching}
            />
          )}

          {currentStep === 3 && (
            <MatchesStep
              startup={startupProfile}
              matches={matches}
              onSelectPartnerForBrief={handleGenerateBrief}
              generatingPartnerId={generatingPartnerId}
              onBack={() => setCurrentStep(2)}
              allowOfflineFallback={allowOfflineFallback}
            />
          )}

          {currentStep === 4 && (
            <BriefStep
              startup={startupProfile}
              partner={selectedPartner}
              brief={partnershipBrief}
              onBackToMatches={() => setCurrentStep(3)}
              onRestart={handleRestart}
              onSuccessToast={(msg) => addToast(msg, 'success')}
            />
          )}
        </main>
      </div>

      {/* Required Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/90 py-5 mt-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2 font-semibold text-slate-200">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            <span>Powered by Gemma 4 (open-weight) - Open source, MIT</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <Globe2 className="h-3.5 w-3.5 text-cyan-400" />
            <span>
              PACT • All partner records & outcomes are illustrative demo data for MLH Hacktoberfest Hack Day KL
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
