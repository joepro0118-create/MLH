import React, { useEffect, useState } from 'react';
import {
  UploadCloud,
  IdCard,
  Award,
  FileCheck2,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  X,
  Star,
  Globe2,
  PanelLeft,
  RotateCcw,
  Check,
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

// The 4-step demo journey. Titles/subtitles also drive the page header.
const STEPS = [
  { id: 1, nav: 'Pitch Upload', title: 'Pitch Upload', subtitle: 'Upload a pitch slide and let Gemma 4 read it', icon: UploadCloud },
  { id: 2, nav: 'Startup Passport', title: 'Startup Passport', subtitle: 'Review and edit what Gemma 4 extracted', icon: IdCard },
  { id: 3, nav: 'Partner Matches', title: 'Partner Matches', subtitle: 'Top 3 ASEAN partners ranked by explainable weights', icon: Award },
  { id: 4, nav: 'Partnership Brief', title: 'Partnership Brief', subtitle: 'Gemma 4 brief and 30-day POC plan', icon: FileCheck2 },
];

// Country dots shown in the sidebar (illustrative ecosystem coverage).
const MARKETS = [
  { name: 'Vietnam', color: '#16a34a' },
  { name: 'Malaysia', color: '#2563eb' },
  { name: 'Singapore', color: '#ef4444' },
  { name: 'Thailand', color: '#8b5cf6' },
  { name: 'Indonesia', color: '#f59e0b' },
];

export default function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [startupProfile, setStartupProfile] = useState(null);
  const [isMatching, setIsMatching] = useState(false);

  const [matches, setMatches] = useState([]);
  const [generatingPartnerId, setGeneratingPartnerId] = useState(null);

  const [selectedPartner, setSelectedPartner] = useState(null);
  const [partnershipBrief, setPartnershipBrief] = useState(null);

  const [backendOnline, setBackendOnline] = useState(null);
  const [allowOfflineFallback, setAllowOfflineFallback] = useState(true);

  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4500);
  };

  useEffect(() => {
    let mounted = true;
    checkBackendHealth().then((res) => mounted && setBackendOnline(res.online));
    return () => {
      mounted = false;
    };
  }, []);

  // Shared toast + status handling for every API result
  const reportSource = (source, okMsg, fallbackMsg) => {
    const live = source !== 'mock-fallback';
    setBackendOnline(live);
    addToast(live ? okMsg : fallbackMsg, live ? 'success' : 'info');
  };

  const handleAnalyzePitch = async () => {
    if (!imageFile) return addToast('Please select or load a demo pitch image first.', 'error');
    setIsAnalyzing(true);
    try {
      const res = await analyzePitchImage(imageFile, { allowOfflineFallback });
      setStartupProfile(res.data);
      reportSource(res.source, 'Startup Passport extracted with Gemma 4!', 'Backend unreachable — using illustrative demo profile.');
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
      reportSource(res.source, 'Ranked top 3 ASEAN partners!', 'Ranked illustrative partners (offline fallback).');
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
      const res = await generatePartnershipBrief(startupProfile, partnerMatch.partner_id, partnerMatch, { allowOfflineFallback });
      setSelectedPartner(partnerMatch);
      setPartnershipBrief(res.data);
      reportSource(res.source, 'Partnership brief & 30-day POC ready!', 'Generated illustrative brief (offline fallback).');
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

  const canNavigateToStep = (id) =>
    id === 1 ||
    (id === 2 && Boolean(startupProfile)) ||
    (id === 3 && Boolean(startupProfile && matches.length)) ||
    (id === 4 && Boolean(partnershipBrief));

  const step = STEPS[currentStep - 1];

  return (
    <div className="min-h-screen flex bg-[#f9fafb] text-[#111827]">
      {/* Toasts */}
      <div aria-live="polite" className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start justify-between gap-3 rounded-xl border bg-white px-4 py-3 text-sm shadow-lg ${
              t.type === 'error' ? 'border-red-200' : t.type === 'success' ? 'border-green-200' : 'border-violet-200'
            }`}
          >
            <div className="flex items-start gap-2.5 font-medium text-gray-800">
              {t.type === 'error' ? (
                <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className={`h-4 w-4 shrink-0 mt-0.5 ${t.type === 'success' ? 'text-green-500' : 'text-violet-500'}`} />
              )}
              <span>{t.message}</span>
            </div>
            <button
              type="button"
              aria-label="Dismiss"
              onClick={() => setToasts((prev) => prev.filter((i) => i.id !== t.id))}
              className="text-gray-400 hover:text-gray-700 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {/* ── Sidebar ── */}
      {sidebarOpen && (
        <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-gray-200 bg-white sticky top-0 h-screen">
          <div className="flex items-center gap-2 px-5 h-14 border-b border-gray-100">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-blue-500 text-white text-sm font-extrabold">
              P
            </div>
            <span className="text-base font-bold tracking-tight">PACT</span>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-6 text-sm">
            <div>
              <p className="px-2 mb-2 text-xs font-medium text-gray-500">Navigation</p>
              <ul className="space-y-0.5">
                {STEPS.map((s) => {
                  const Icon = s.icon;
                  const active = s.id === currentStep;
                  const done = s.id < currentStep && canNavigateToStep(s.id);
                  const enabled = canNavigateToStep(s.id);
                  return (
                    <li key={s.id}>
                      <button
                        type="button"
                        disabled={!enabled}
                        onClick={() => setCurrentStep(s.id)}
                        className={`w-full flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition ${
                          active
                            ? 'bg-violet-50 text-violet-700 font-semibold'
                            : enabled
                            ? 'text-gray-700 hover:bg-gray-100 cursor-pointer'
                            : 'text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="flex-1">{s.nav}</span>
                        {done && <Check className="h-3.5 w-3.5 text-green-500" />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div>
              <p className="px-2 mb-2 flex items-center gap-1.5 text-xs font-medium text-gray-500">
                <Star className="h-3.5 w-3.5" /> Demo story
              </p>
              <div className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-gray-700">
                <span className="h-2 w-2 rounded-full bg-orange-400" />
                <span className="flex-1">SmartTONG MY → VN</span>
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              </div>
            </div>

            <div>
              <p className="px-2 mb-2 flex items-center gap-1.5 text-xs font-medium text-gray-500">
                <Globe2 className="h-3.5 w-3.5" /> ASEAN markets
              </p>
              <ul className="space-y-0.5">
                {MARKETS.map((m) => (
                  <li key={m.name} className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-gray-700">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: m.color }} />
                    {m.name}
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          <div className="m-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-[11px] leading-relaxed text-amber-800">
            All partner records and outcomes are <strong>illustrative demo data</strong>.
          </div>
        </aside>
      )}

      {/* ── Main column ── */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-14 flex items-center justify-between gap-3 border-b border-gray-200 bg-white/90 backdrop-blur px-4 sm:px-6">
          <button
            type="button"
            aria-label="Toggle sidebar"
            onClick={() => setSidebarOpen((v) => !v)}
            className="hidden md:flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 cursor-pointer"
          >
            <PanelLeft className="h-4 w-4" />
          </button>
          <span className="md:hidden text-base font-bold">PACT</span>

          <div className="flex items-center gap-2 sm:gap-3 text-xs">
            <span
              title={API_BASE_URL}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 font-medium text-gray-700"
            >
              <span className={`h-2 w-2 rounded-full ${backendOnline ? 'bg-green-500' : 'bg-amber-400'}`} />
              {backendOnline ? 'API connected' : 'Mock fallback'}
            </span>
            <label className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 font-medium text-gray-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={allowOfflineFallback}
                onChange={(e) => setAllowOfflineFallback(e.target.checked)}
                className="accent-violet-600 cursor-pointer"
              />
              Offline fallback
            </label>
            <div className="flex items-center gap-2 pl-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-violet-700 text-xs font-bold">KL</div>
              <span className="hidden lg:inline text-sm font-medium text-gray-800">Team PACT</span>
            </div>
          </div>
        </header>

        {/* Mobile step pills (sidebar hidden on small screens) */}
        <div className="md:hidden flex gap-1.5 overflow-x-auto border-b border-gray-200 bg-white px-4 py-2">
          {STEPS.map((s) => (
            <button
              key={s.id}
              type="button"
              disabled={!canNavigateToStep(s.id)}
              onClick={() => setCurrentStep(s.id)}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                s.id === currentStep ? 'bg-violet-600 text-white' : 'bg-gray-100 text-gray-600 disabled:opacity-50'
              }`}
            >
              {s.id}. {s.nav}
            </button>
          ))}
        </div>

        <main className="flex-1 px-4 sm:px-8 py-7 max-w-[1280px] w-full mx-auto">
          {/* Page header */}
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{step.title}</h1>
              <p className="mt-0.5 text-sm text-gray-500">
                Step {step.id} of 4 · {step.subtitle}
              </p>
            </div>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handleRestart}
                className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-700 transition cursor-pointer"
              >
                <RotateCcw className="h-4 w-4" />
                New analysis
              </button>
            )}
          </div>

          {currentStep === 1 && (
            <UploadStep
              imageFile={imageFile}
              imagePreview={imagePreview}
              onSelectImage={(file, url) => {
                setImageFile(file);
                setImagePreview(url);
              }}
              onClearImage={() => {
                setImageFile(null);
                setImagePreview(null);
              }}
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

        <footer className="border-t border-gray-200 bg-white px-6 py-4 text-xs text-gray-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 font-medium text-gray-800">
            <Sparkles className="h-4 w-4 text-violet-600" />
            Powered by Gemma 4 (open-weight) - Open source, MIT
          </span>
          <span>PACT · Illustrative demo data · MLH Hacktoberfest Hack Day KL</span>
        </footer>
      </div>
    </div>
  );
}
