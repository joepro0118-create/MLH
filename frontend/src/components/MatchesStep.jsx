import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  Sparkles,
  Globe2,
  ArrowLeft,
  Network,
  LayoutGrid,
  ShieldAlert,
  FileText,
  Zap,
} from 'lucide-react';
import EcosystemGraph from './EcosystemGraph';

function ScoreRing({ score = 0 }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, Number(score) || 0));
  const offset = circumference - (clamped / 100) * circumference;

  const strokeColor =
    clamped >= 88 ? '#10b981' : clamped >= 75 ? '#38bdf8' : '#f59e0b';

  return (
    <div className="relative flex h-18 w-18 shrink-0 items-center justify-center">
      <svg className="h-18 w-18 -rotate-90 transform" viewBox="0 0 68 68">
        <circle
          cx="34"
          cy="34"
          r={radius}
          stroke="rgba(51, 65, 85, 0.6)"
          strokeWidth="6"
          fill="transparent"
        />
        <circle
          cx="34"
          cy="34"
          r={radius}
          stroke={strokeColor}
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-base font-extrabold text-white leading-none">
          {clamped}%
        </span>
        <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 mt-0.5">
          Match
        </span>
      </div>
    </div>
  );
}

export default function MatchesStep({
  startup,
  matches = [],
  onSelectPartnerForBrief,
  generatingPartnerId,
  onBack,
  allowOfflineFallback,
}) {
  const [activeTab, setActiveTab] = useState('cards'); // 'cards' | 'graph' | 'split'

  return (
    <div className="space-y-6">
      {/* Top Header & Illustrative Demo Notice */}
      <div className="rounded-2xl border border-emerald-500/25 bg-gradient-to-r from-emerald-950/60 via-slate-900/90 to-cyan-950/50 p-6 shadow-lg space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                <Award className="h-3.5 w-3.5" />
                Step 3 of 4 • Deterministic Weighted Partner Matching
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/50 bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-300 shadow-sm">
                <ShieldAlert className="h-3.5 w-3.5" />
                Illustrative Demo Data
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Top 3 Cross-Border Partner Matches for{' '}
              <span className="text-emerald-400">{startup?.company_name}</span>
            </h2>
            <p className="text-sm text-slate-300 max-w-3xl">
              Ranked deterministically in Python against ASEAN ecosystem records. Select a partner to generate an actionable{' '}
              <strong className="text-white">Gemma 4 Partnership Brief & 30-Day POC Plan</strong>.
            </p>
          </div>

          <button
            type="button"
            onClick={onBack}
            disabled={Boolean(generatingPartnerId)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition cursor-pointer disabled:opacity-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Edit Passport
          </button>
        </div>

        {/* Deterministic Weights Pill Bar & View Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-800/80 pt-4">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold text-slate-400">MVP Scoring Weights:</span>
            <span className="rounded-lg border border-slate-700 bg-slate-900/90 px-2.5 py-1 text-emerald-300 font-medium">
              Industry Compatibility 30%
            </span>
            <span className="rounded-lg border border-slate-700 bg-slate-900/90 px-2.5 py-1 text-amber-300 font-medium">
              Complementary Capabilities/Needs 30%
            </span>
            <span className="rounded-lg border border-slate-700 bg-slate-900/90 px-2.5 py-1 text-cyan-300 font-medium">
              Target Market 20%
            </span>
            <span className="rounded-lg border border-slate-700 bg-slate-900/90 px-2.5 py-1 text-purple-300 font-medium">
              Partnership Objective 20%
            </span>
          </div>

          {/* Segmented View Control */}
          <div
            role="tablist"
            className="inline-flex rounded-xl border border-slate-800 bg-slate-950 p-1"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'cards'}
              onClick={() => setActiveTab('cards')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                activeTab === 'cards'
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Partner Cards ({matches.length})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'graph'}
              onClick={() => setActiveTab('graph')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                activeTab === 'graph'
                  ? 'bg-cyan-400 text-slate-950 shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Network className="h-3.5 w-3.5" />
              ASEAN Ecosystem Graph
            </button>
          </div>
        </div>
      </div>

      {/* Gemma 4 Brief Generation Overlay Skeleton when a partner is clicked */}
      {generatingPartnerId && (
        <div className="rounded-2xl border border-emerald-500/40 bg-slate-900/95 p-6 shadow-2xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-400 text-emerald-300">
              <Sparkles className="h-6 w-6 animate-spin" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Gemma 4 is Drafting Your Cross-Border Partnership Brief & 30-Day POC Plan...
              </h3>
              <p className="text-xs text-slate-300">
                Synthesizing alignment between <strong className="text-emerald-300">{startup?.company_name}</strong> and partner ID{' '}
                <code className="font-mono-code text-cyan-300">{generatingPartnerId}</code> via{' '}
                <code className="font-mono-code text-emerald-300">POST /api/partnership/brief</code>
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            <div className="h-16 rounded-xl animate-shimmer" />
            <div className="h-16 rounded-xl animate-shimmer" />
            <div className="h-16 rounded-xl animate-shimmer" />
          </div>
        </div>
      )}

      {/* Partner Match Cards View */}
      {activeTab === 'cards' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {matches.map((match, idx) => {
            const isGeneratingThis = generatingPartnerId === match.partner_id;
            const isTopMatch = idx === 0;

            return (
              <div
                key={match.partner_id || idx}
                className={`flex flex-col justify-between rounded-2xl border p-6 shadow-xl transition-all ${
                  isTopMatch
                    ? 'border-emerald-500/50 bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-950/25 ring-1 ring-emerald-500/30'
                    : 'border-slate-800 bg-slate-900/85 hover:border-slate-700'
                }`}
              >
                <div className="space-y-4">
                  {/* Card Top Bar */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`rounded-md px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wider ${
                            isTopMatch
                              ? 'bg-emerald-500 text-slate-950'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          #{idx + 1} {isTopMatch ? 'Best Fit' : 'Match'}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-md border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[11px] font-semibold text-cyan-300">
                          <Globe2 className="h-3 w-3" />
                          {match.country}
                        </span>
                        <span className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                          Illustrative
                        </span>
                      </div>

                      <h3 className="text-lg font-extrabold text-white leading-snug">
                        {match.partner_name}
                      </h3>
                      <p className="text-[11px] font-mono-code text-slate-400">
                        ID: {match.partner_id}
                      </p>
                    </div>

                    <ScoreRing score={match.score} />
                  </div>

                  {/* Linear Score Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Compatibility Score</span>
                      <span className="font-bold text-slate-200">{match.score} / 100</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(0, match.score))}%` }}
                      />
                    </div>
                  </div>

                  {/* Match Reasons */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Why This Partner Matches
                    </h4>
                    <ul className="space-y-2">
                      {(match.reasons || []).map((reason, rIdx) => (
                        <li
                          key={rIdx}
                          className="flex items-start gap-2 text-xs text-slate-200 leading-relaxed"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Opportunity Callout */}
                  <div className="rounded-xl border border-emerald-500/25 bg-emerald-950/30 p-3.5 space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                      <Zap className="h-3.5 w-3.5" />
                      Concrete Pilot Opportunity
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      {match.opportunity}
                    </p>
                  </div>
                </div>

                {/* Action Button */}
                <div className="mt-6 pt-4 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => onSelectPartnerForBrief(match)}
                    disabled={Boolean(generatingPartnerId)}
                    className={`w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-bold transition cursor-pointer disabled:opacity-50 ${
                      isTopMatch
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-teal-400'
                        : 'border border-emerald-500/40 bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/25'
                    }`}
                  >
                    {isGeneratingThis ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Generating Brief with Gemma 4...
                      </>
                    ) : (
                      <>
                        <FileText className="h-4 w-4" />
                        Generate Partnership Brief
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ASEAN Ecosystem Graph Tab */}
      {activeTab === 'graph' && (
        <EcosystemGraph
          startup={startup}
          matches={matches}
          allowOfflineFallback={allowOfflineFallback}
        />
      )}
    </div>
  );
}
