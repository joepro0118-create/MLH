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
    <div className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-4 space-y-3">
      <div>
        <h4 className="text-sm font-bold text-[#1e293b]">{title}</h4>
        <p className="text-xs text-[#64748b]">{subtitle}</p>
      </div>

      <div className="flex flex-wrap gap-2 min-h-[32px]">
        {items.map((item, idx) => (
          <span
            key={idx}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-xs font-medium ${colorClass}`}
          >
            <span>{item}</span>
            <button
              type="button"
              onClick={() => onRemove(idx)}
              aria-label={`Remove ${item}`}
              className="rounded-full p-0.5 hover:bg-black/10 transition cursor-pointer"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        {items.length === 0 && (
          <span className="text-xs italic text-[#64748b]">
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
          className="flex-1 rounded-lg border border-[#e2e8f0] bg-white px-3 py-1.5 text-xs text-[#1e293b] placeholder-[#64748b] focus:border-[#2563eb] focus:outline-none"
        />
        <button
          type="submit"
          className="inline-flex items-center gap-1 rounded-lg border border-[#e2e8f0] bg-white px-3 py-1.5 text-xs font-semibold text-[#1e293b] hover:bg-slate-100 transition cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5 text-[#2563eb]" />
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
      <div className="rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-green-50 border border-green-200 px-3 py-0.5 text-xs font-semibold text-[#16a34a]">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Step 2 of 4 · Verified Startup Passport (Pydantic Schema)
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#1e293b]">
              2. Review & Customize Your Startup Passport
            </h2>
            <p className="text-sm text-[#64748b] max-w-2xl">
              Gemma 4 extracted the structured profile below. Edit any field or add/remove tags before running the deterministic ASEAN partner matching engine.
            </p>
          </div>

          <button
            type="button"
            onClick={onBack}
            disabled={isMatching}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-4 py-2 text-xs font-semibold text-[#1e293b] hover:bg-slate-200/70 transition cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Upload
          </button>
        </div>
      </div>

      {/* Main Editable Passport Card */}
      <div className="rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-xs space-y-6">
        {/* Core Identity Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#64748b] mb-1.5">
              <Building2 className="h-3.5 w-3.5 text-[#2563eb]" />
              Company Name
            </label>
            <input
              type="text"
              value={profile.company_name || ''}
              onChange={(e) => updateField('company_name', e.target.value)}
              className="w-full rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-3.5 py-2 text-sm font-semibold text-[#1e293b] focus:border-[#2563eb] focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#64748b] mb-1.5">
              <Globe className="h-3.5 w-3.5 text-[#2563eb]" />
              Home Country (ASEAN)
            </label>
            <input
              type="text"
              value={profile.country || ''}
              onChange={(e) => updateField('country', e.target.value)}
              className="w-full rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-3.5 py-2 text-sm font-semibold text-[#1e293b] focus:border-[#2563eb] focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#64748b] mb-1.5">
              <Layers className="h-3.5 w-3.5 text-[#7c3aed]" />
              Industry Sector
            </label>
            <input
              type="text"
              value={profile.sector || ''}
              onChange={(e) => updateField('sector', e.target.value)}
              className="w-full rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-3.5 py-2 text-sm font-semibold text-[#1e293b] focus:border-[#2563eb] focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* Solution Summary */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#64748b] mb-1.5">
            <FileText className="h-3.5 w-3.5 text-[#2563eb]" />
            Solution Summary
          </label>
          <textarea
            rows={2}
            value={profile.solution || ''}
            onChange={(e) => updateField('solution', e.target.value)}
            className="w-full rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-3.5 py-2 text-sm text-[#1e293b] leading-relaxed focus:border-[#2563eb] focus:bg-white focus:outline-none"
          />
        </div>

        {/* 4 Chip Editors (Yap Tag Colors) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ChipListEditor
            title="Core Capabilities"
            subtitle="What your startup brings to a cross-border partner (30% weight)"
            items={profile.capabilities}
            colorClass="border-blue-200 bg-[#dbeafe] text-[#1d4ed8]"
            onAdd={(val) => addChip('capabilities', val)}
            onRemove={(idx) => removeChip('capabilities', idx)}
          />

          <ChipListEditor
            title="Partnership Needs"
            subtitle="What local support, permits, or infrastructure you need (30% weight)"
            items={profile.needs}
            colorClass="border-amber-200 bg-[#fef3c7] text-[#92400e]"
            onAdd={(val) => addChip('needs', val)}
            onRemove={(idx) => removeChip('needs', idx)}
          />

          <ChipListEditor
            title="Target ASEAN Markets"
            subtitle="Priority expansion countries for pilot deployment (20% weight)"
            items={profile.target_markets}
            colorClass="border-green-200 bg-[#dcfce7] text-[#15803d]"
            onAdd={(val) => addChip('target_markets', val)}
            onRemove={(idx) => removeChip('target_markets', idx)}
          />

          <ChipListEditor
            title="Partnership Goals"
            subtitle="Concrete 30-day POC & outcome conversion goals (20% weight)"
            items={profile.partnership_goals}
            colorClass="border-purple-200 bg-[#ede9fe] text-[#6d28d9]"
            onAdd={(val) => addChip('partnership_goals', val)}
            onRemove={(idx) => removeChip('partnership_goals', idx)}
          />
        </div>

        {/* Footer Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-[#e2e8f0] pt-5">
          <div className="text-xs text-[#64748b]">
            <span className="font-semibold text-[#1e293b]">Matching Weights (Deterministic Python):</span>{' '}
            Industry 30% · Capabilities/Needs 30% · Target Market 20% · Objectives 20%
          </div>

          <button
            type="button"
            onClick={onFindPartners}
            disabled={isMatching || !profile.company_name}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#2563eb] px-6 py-3 text-sm font-semibold text-white shadow-xs hover:bg-blue-700 transition cursor-pointer disabled:opacity-50"
          >
            {isMatching ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Ranking ASEAN Partners...
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Find Partners (Top 3 Matches) →
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
