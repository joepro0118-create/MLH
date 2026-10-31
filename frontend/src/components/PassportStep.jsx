import React, { useState } from 'react';
import {
  Building2,
  Globe,
  Layers,
  FileText,
  Plus,
  X,
  Search,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

function ChipListEditor({ title, subtitle, items = [], colorClass, onAdd, onRemove }) {
  const [draft, setDraft] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setDraft('');
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/65 p-4 space-y-3">
      <div>
        <h4 className="text-sm font-bold text-white">{title}</h4>
        <p className="text-xs text-slate-400">{subtitle}</p>
      </div>

      <div className="flex flex-wrap gap-2 min-h-[34px]">
        {items.map((item, idx) => (
          <span
            key={idx}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium ${colorClass}`}
          >
            <span>{item}</span>
            <button
              type="button"
              onClick={() => onRemove(idx)}
              aria-label={`Remove ${item}`}
              className="rounded-full p-0.5 hover:bg-black/30 transition cursor-pointer"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        {items.length === 0 && (
          <span className="text-xs italic text-slate-500">
            No items added yet. Add one below.
          </span>
        )}
      </div>

      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={`Add to ${title.toLowerCase()}...`}
          className="flex-1 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
        />
        <button
          type="submit"
          className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          Add
        </button>
      </form>
    </div>
  );
}

export default function PassportStep({
  profile,
  onChangeProfile,
  onFindPartners,
  onBack,
  isMatching,
}) {
  if (!profile) return null;

  const updateField = (key, value) => {
    onChangeProfile({ ...profile, [key]: value });
  };

  const addChip = (key, value) => {
    const current = Array.isArray(profile[key]) ? profile[key] : [];
    onChangeProfile({ ...profile, [key]: [...current, value] });
  };

  const removeChip = (key, index) => {
    const current = Array.isArray(profile[key]) ? profile[key] : [];
    onChangeProfile({
      ...profile,
      [key]: current.filter((_, idx) => idx !== index),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-emerald-500/25 bg-gradient-to-r from-emerald-950/60 via-slate-900/90 to-slate-900 p-6 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Step 2 of 4 • Verified Startup Passport (Pydantic Schema)
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Review & Customize Your Startup Passport
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl">
              Gemma 4 extracted the structured profile below. Edit any field or add/remove tags before running the deterministic ASEAN partner matching engine.
            </p>
          </div>

          <button
            type="button"
            onClick={onBack}
            disabled={isMatching}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Pitch Upload
          </button>
        </div>
      </div>

      {/* Main Editable Passport Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/85 p-6 shadow-xl space-y-6">
        {/* Core Identity Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              <Building2 className="h-3.5 w-3.5 text-emerald-400" />
              Company Name
            </label>
            <input
              type="text"
              value={profile.company_name || ''}
              onChange={(e) => updateField('company_name', e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm font-semibold text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              <Globe className="h-3.5 w-3.5 text-cyan-400" />
              Home Country (ASEAN)
            </label>
            <input
              type="text"
              value={profile.country || ''}
              onChange={(e) => updateField('country', e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm font-semibold text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              <Layers className="h-3.5 w-3.5 text-amber-400" />
              Industry Sector
            </label>
            <input
              type="text"
              value={profile.sector || ''}
              onChange={(e) => updateField('sector', e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm font-semibold text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Solution Summary */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            <FileText className="h-3.5 w-3.5 text-emerald-400" />
            Solution Summary
          </label>
          <textarea
            rows={2}
            value={profile.solution || ''}
            onChange={(e) => updateField('solution', e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 leading-relaxed focus:border-emerald-500 focus:outline-none"
          />
        </div>

        {/* 4 Chip Editors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ChipListEditor
            title="Core Capabilities"
            subtitle="What your startup brings to a cross-border partner (30% weight)"
            items={profile.capabilities}
            colorClass="border-emerald-500/40 bg-emerald-500/15 text-emerald-200"
            onAdd={(val) => addChip('capabilities', val)}
            onRemove={(idx) => removeChip('capabilities', idx)}
          />

          <ChipListEditor
            title="Partnership Needs"
            subtitle="What local support, permits, or infrastructure you need (30% weight)"
            items={profile.needs}
            colorClass="border-amber-500/40 bg-amber-500/15 text-amber-200"
            onAdd={(val) => addChip('needs', val)}
            onRemove={(idx) => removeChip('needs', idx)}
          />

          <ChipListEditor
            title="Target ASEAN Markets"
            subtitle="Priority expansion countries for pilot deployment (20% weight)"
            items={profile.target_markets}
            colorClass="border-cyan-500/40 bg-cyan-500/15 text-cyan-200"
            onAdd={(val) => addChip('target_markets', val)}
            onRemove={(idx) => removeChip('target_markets', idx)}
          />

          <ChipListEditor
            title="Partnership Goals"
            subtitle="Concrete 30-day POC & outcome conversion goals (20% weight)"
            items={profile.partnership_goals}
            colorClass="border-purple-500/40 bg-purple-500/15 text-purple-200"
            onAdd={(val) => addChip('partnership_goals', val)}
            onRemove={(idx) => removeChip('partnership_goals', idx)}
          />
        </div>

        {/* Footer Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-slate-800 pt-5">
          <div className="text-xs text-slate-400">
            <span className="font-semibold text-slate-200">Matching Formula (Deterministic Python):</span>{' '}
            Industry 30% + Capabilities/Needs 30% + Target Market 20% + Objectives 20%
          </div>

          <button
            type="button"
            onClick={onFindPartners}
            disabled={isMatching || !profile.company_name}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-teal-400 transition cursor-pointer disabled:opacity-50"
          >
            {isMatching ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                Ranking ASEAN Partners...
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Find Partners (Top 3 Matches)
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
