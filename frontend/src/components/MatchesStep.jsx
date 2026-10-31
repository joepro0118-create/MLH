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
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, Number(score) || 0));
  const offset = circumference - (clamped / 100) * circumference;

  const strokeColor =
    clamped >= 70 ? '#16a34a' : clamped >= 40 ? '#d97706' : '#dc2626';

  return (
    <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
      <svg className="h-16 w-16 -rotate-90 transform" viewBox="0 0 64 64">
        <circle
          cx="32"
          cy="32"
          r={radius}
          stroke="#e2e8f0"
          strokeWidth="6"
          fill="transparent"
        />
        <circle
          cx="32"
          cy="32"
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
        <span className="text-sm font-extrabold text-[#1e293b] leading-none">
          {clamped}%
        </span>
        <span className="text-[9px] font-semibold uppercase tracking-wider text-[#64748b] mt-0.5">
          Score
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
  const [activeTab, setActiveTab] = useState('cards');

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f5f3ff] border border-violet-200 px-3 py-0.5 text-xs font-semibold text-[#7c3aed]">
                <Award className="h-3.5 w-3.5" />
                Step 3 of 4 · Deterministic Weighted Partner Matching
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-[#fcd34d] bg-[#fffbeb] px-3 py-0.5 text-xs font-bold text-[#92400e]">
                <ShieldAlert className="h-3.5 w-3.5 text-[#d97706]" />
                Illustrative Demo Data
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-[#1e293b]">
              3. Top 3 Partner Matches for{' '}
              <span className="text-[#7c3aed]">{startup?.company_name}</span>
            </h2>
            <p className="text-sm text-[#64748b] max-w-3xl">
              Ranked deterministically in Python against ASEAN ecosystem records. Select a partner to generate an actionable{' '}
              <strong className="text-[#1e293b]">Gemma 4 Partnership Brief & 30-Day POC Plan</strong>.
            </p>
          </div>

          <button
            type="button"
            onClick={onBack}
            disabled={Boolean(generatingPartnerId)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-4 py-2 text-xs font-semibold text-[#1e293b] hover:bg-slate-200/70 transition cursor-pointer disabled:opacity-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Edit Passport
          </button>
        </div>

        {/* Deterministic Weights Pill Bar & View Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#e2e8f0] pt-4">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold text-[#64748b]">Scoring Weights:</span>
            <span className="rounded-full bg-[#dbeafe] px-2.5 py-0.5 text-[#1d4ed8] font-medium">
              Industry 30%
            </span>
            <span className="rounded-full bg-[#fef3c7] px-2.5 py-0.5 text-[#92400e] font-medium">
              Capabilities/Needs 30%
            </span>
            <span className="rounded-full bg-[#dcfce7] px-2.5 py-0.5 text-[#15803d] font-medium">
              Target Market 20%
            </span>
            <span className="rounded-full bg-[#ede9fe] px-2.5 py-0.5 text-[#6d28d9] font-medium">
              Objective 20%
            </span>
          </div>

          {/* Segmented View Control */}
          <div
            role="tablist"
            className="inline-flex rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-1"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'cards'}
              onClick={() => setActiveTab('cards')}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                activeTab === 'cards'
                  ? 'bg-[#7c3aed] text-white shadow-2xs'
                  : 'text-[#64748b] hover:text-[#1e293b]'
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
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                activeTab === 'graph'
                  ? 'bg-[#7c3aed] text-white shadow-2xs'
                  : 'text-[#64748b] hover:text-[#1e293b]'
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
        <div className="rounded-xl border border-violet-200 bg-[#f5f3ff] p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white border border-violet-200 text-[#7c3aed]">
              <Sparkles className="h-5 w-5 animate-spin" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#1e293b]">
                Gemma 4 is Drafting Your Cross-Border Partnership Brief & 30-Day POC Plan...
              </h3>
              <p className="text-xs text-[#64748b]">
                Synthesizing alignment between <strong className="text-[#1e293b]">{startup?.company_name}</strong> and partner ID{' '}
                <code className="font-mono-code text-[#7c3aed]">{generatingPartnerId}</code> via{' '}
                <code className="font-mono-code text-[#7c3aed]">POST /api/partnership/brief</code>
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            <div className="h-12 rounded-lg animate-shimmer" />
            <div className="h-12 rounded-lg animate-shimmer" />
            <div className="h-12 rounded-lg animate-shimmer" />
          </div>
        </div>
      )}

      {/* Partner Match Cards View */}
      {activeTab === 'cards' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {matches.map((match, idx) => {
            const isGeneratingThis = generatingPartnerId === match.partner_id;
            const isTopMatch = idx === 0;
            // Kanban-style column tint per rank
            const column = [
              { label: 'Best Fit', head: 'bg-violet-50 border-violet-200 text-violet-800' },
              { label: 'Strong Fit', head: 'bg-blue-50 border-blue-200 text-blue-800' },
              { label: 'Good Fit', head: 'bg-green-50 border-green-200 text-green-800' },
            ][idx] || { label: 'Match', head: 'bg-gray-100 border-gray-200 text-gray-700' };

            return (
              <div key={match.partner_id || idx} className="flex flex-col rounded-xl border border-gray-200 bg-gray-50/70">
                <div className={`flex items-center justify-between rounded-t-xl border-b px-4 py-2.5 text-sm font-semibold ${column.head}`}>
                  <span>{column.label}</span>
                  <span className="rounded-md bg-white px-1.5 text-xs font-bold text-gray-600 border border-gray-200">
                    #{idx + 1}
                  </span>
                </div>
                <div className="p-3 flex-1 flex">
              <div
                className={`flex-1 flex flex-col justify-between rounded-xl border bg-white p-5 shadow-xs transition-all hover:shadow-md ${
                  isTopMatch
                    ? 'border-[#7c3aed] ring-1 ring-violet-200'
                    : 'border-[#e2e8f0]'
                }`}
              >
                <div className="space-y-4">
                  {/* Card Top Bar */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                            isTopMatch
                              ? 'bg-[#7c3aed] text-white'
                              : 'bg-[#f1f5f9] text-[#64748b]'
                          }`}
                        >
                          #{idx + 1} {isTopMatch ? 'Top Match' : 'Match'}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-md bg-[#f5f3ff] px-2 py-0.5 text-[11px] font-semibold text-[#7c3aed]">
                          <Globe2 className="h-3 w-3" />
                          {match.country}
                        </span>
                        <span className="rounded-md border border-[#fcd34d] bg-[#fffbeb] px-2 py-0.5 text-[10px] font-semibold text-[#92400e]">
                          Illustrative
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-[#1e293b] leading-snug pt-0.5">
                        {match.partner_name}
                      </h3>
                      <p className="text-[11px] font-mono-code text-[#64748b]">
                        ID: {match.partner_id}
                      </p>
                    </div>

                    <ScoreRing score={match.score} />
                  </div>

                  {/* Linear Score Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-[#64748b]">
                      <span>Compatibility Score</span>
                      <span className="font-bold text-[#1e293b]">{match.score} / 100</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-[#e2e8f0]">
                      <div
                        className="h-full rounded-full bg-[#16a34a] transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(0, match.score))}%` }}
                      />
                    </div>
                  </div>

                  {/* Match Reasons */}
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748b]">
                      Why They Match
                    </h4>
                    <ul className="space-y-1.5">
                      {(match.reasons || []).map((reason, rIdx) => (
                        <li
                          key={rIdx}
                          className="flex items-start gap-2 text-xs text-[#1e293b] leading-relaxed"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 text-[#16a34a] shrink-0 mt-0.5" />
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Opportunity Callout */}
                  <div className="rounded-lg border-l-3 border-l-[#7c3aed] bg-[#f5f3ff] p-3 space-y-1">
                    <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#1d4ed8]">
                      <Zap className="h-3.5 w-3.5" />
                      Pilot Opportunity
                    </div>
                    <p className="text-xs text-[#1d4ed8] leading-relaxed">
                      {match.opportunity}
                    </p>
                  </div>
                </div>

                {/* Action Button */}
                <div className="mt-5 pt-4 border-t border-[#e2e8f0]">
                  <button
                    type="button"
                    onClick={() => onSelectPartnerForBrief(match)}
                    disabled={Boolean(generatingPartnerId)}
                    className={`w-full inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold transition cursor-pointer disabled:opacity-50 ${
                      isTopMatch
                        ? 'bg-[#7c3aed] text-white hover:bg-violet-700 shadow-2xs'
                        : 'border border-[#7c3aed] bg-white text-[#7c3aed] hover:bg-[#f5f3ff]'
                    }`}
                  >
                    {isGeneratingThis ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Generating Brief...
                      </>
                    ) : (
                      <>
                        <FileText className="h-4 w-4" />
                        Generate Partnership Brief →
                      </>
                    )}
                  </button>
                </div>
              </div>
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
