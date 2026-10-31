import React, { useEffect, useState } from 'react';
import {
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
  { id: 1, title: 'Upload' },
  { id: 2, title: 'Passport' },
  { id: 3, title: 'Matches' },
  { id: 4, title: 'Brief' },
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
    <div className="min-h-screen flex flex-col justify-between bg-[#f8fafc] text-[#1e293b]">
      {/* Toast Notification Stack */}
      <div
        aria-live="polite"
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full px-4 sm:px-0 pointer-events-none"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start justify-between gap-3 rounded-xl border px-4 py-3 shadow-lg transition-all ${
              t.type === 'error'
                ? 'border-red-300 bg-red-50 text-red-900'
                : t.type === 'success'
                ? 'border-green-300 bg-green-50 text-green-900'
                : 'border-blue-200 bg-white text-slate-800'
            }`}
          >
            <div className="flex items-start gap-2.5 text-xs sm:text-sm font-medium">
              {t.type === 'error' ? (
                <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
              )}
              <span>{t.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setToasts((prev) => prev.filter((item) => item.id !== t.id))}
              className="text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <div>
        {/* Sticky Top Navbar (Yap Style) */}
        <header className="sticky top-0 z-30 bg-white border-b border-[#e2e8f0] shadow-xs">
          <div className="mx-auto max-w-[1100px] px-6 min-h-[60px] py-2 flex flex-wrap items-center justify-between gap-4">
            {/* Left: Logo & Subtitle */}
            <div className="flex items-center gap-4">
              <span className="text-[1.4rem] font-extrabold text-[#2563eb] tracking-[-0.5px]">
                PACT
              </span>
              <span className="hidden sm:inline-block text-[0.8rem] text-[#64748b] border-l-2 border-[#e2e8f0] pl-4">
                Partnership Action & Collaboration Toolkit · ASEAN
              </span>
            </div>

            {/* Right: Connected Circular Step Indicator (Yap Style) */}
            <nav aria-label="Progress" className="flex items-center">
              {STEPS.map((step, i) => {
                const isDone = step.id < currentStep;
                const isActive = step.id === currentStep;
                const isClickable = canNavigateToStep(step.id);

                return (
                  <div key={step.id} className="flex items-center">
                    <button
                      type="button"
                      disabled={!isClickable}
                      onClick={() => isClickable && setCurrentStep(step.id)}
                      className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full transition-all ${
                        isActive
                          ? 'bg-[#eff6ff] text-[#2563eb] font-semibold'
                          : isDone
                          ? 'text-[#16a34a] font-medium hover:bg-green-50 cursor-pointer'
                          : 'text-[#64748b] opacity-60 cursor-not-allowed'
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[0.65rem] font-bold shrink-0 ${
                          isActive
                            ? 'bg-[#2563eb] text-white'
                            : isDone
                            ? 'bg-[#16a34a] text-white'
                            : 'bg-[#e2e8f0] text-[#64748b]'
                        }`}
                      >
                        {isDone ? '✓' : step.id}
                      </span>
                      <span>{step.title}</span>
                    </button>
                    {i < STEPS.length - 1 && (
                      <div className="w-4 sm:w-5 h-[2px] bg-[#e2e8f0]" />
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
        </header>

        {/* Main Content Container (Yap 1100px layout) */}
        <main className="mx-auto max-w-[1100px] px-6 py-8">
          {/* Illustrative Banner + API Status Bar */}
          <div className="mb-6 rounded-lg border border-[#fcd34d] bg-[#fffbeb] px-4 py-2.5 text-[0.82rem] text-[#92400e] flex flex-wrap items-center justify-between gap-3">
            <div>
              <strong>Illustrative Demo Data:</strong> All partner organisations, scores, and outcomes are synthetic for the MLH Hacktoberfest Hack Day KL demonstration.
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-white/90 border border-amber-300 px-2.5 py-0.5 text-slate-700">
                <Server className="h-3 w-3 text-[#2563eb]" />
                <code className="font-mono-code text-[11px]">{API_BASE_URL}</code>
                <span
                  className={`inline-flex items-center gap-1 font-semibold ${
                    backendOnline ? 'text-[#16a34a]' : 'text-[#d97706]'
                  }`}
                >
                  • {backendOnline ? 'API Connected' : 'Mock Fallback'}
                </span>
              </span>

              <label className="inline-flex items-center gap-1.5 text-amber-900 font-medium cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={allowOfflineFallback}
                  onChange={(e) => setAllowOfflineFallback(e.target.checked)}
                  className="accent-[#2563eb] rounded cursor-pointer"
                />
                <span>Offline Fallback</span>
              </label>
            </div>
          </div>

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
      <footer className="border-t border-[#e2e8f0] bg-white py-5 mt-12">
        <div className="mx-auto max-w-[1100px] px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#64748b]">
          <div className="flex items-center gap-2 font-semibold text-[#1e293b]">
            <Sparkles className="h-4 w-4 text-[#2563eb]" />
            <span>Powered by Gemma 4 (open-weight) - Open source, MIT</span>
          </div>
          <div className="flex items-center gap-2">
            <Globe2 className="h-3.5 w-3.5 text-[#2563eb]" />
            <span>
              PACT · All partner records & outcomes are illustrative demo data
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
