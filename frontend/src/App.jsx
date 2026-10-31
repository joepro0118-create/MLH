// frontend/src/App.jsx — PACT: AI Cross-Border Startup Partnership Toolkit
// Designed for Founders: Upload 1-3 files + notes + goal -> Gemma fuses into Passport -> Edit -> Match & Graph -> Brief & 30-Day POC
import { useState, useEffect, useRef, useCallback } from 'react'
import { analyzePitch, getMatches, getGraph, getBrief } from './api.js'
import { EcosystemGraph } from './components/EcosystemGraph.jsx'
import './index.css'

/* ─────────────────────────────────────────────────────────────
   DEMO DATA (SmartTONG — Malaysia to Vietnam)
───────────────────────────────────────────────────────────────*/
const DEMO_PROFILE = {
  company_name: 'SmartTONG',
  country: 'Malaysia',
  sector: 'smart-city',
  solution: 'IoT-enabled smart bins that optimise municipal waste collection routes in real time.',
  capabilities: ['IoT Fill-Level Sensors', 'Dynamic Route Optimisation', 'Real-Time Telematics Dashboard', 'Waste Compaction Analytics'],
  needs: ['Municipal Waste Concessions', 'Local Fleet Logistics Partner', 'Government Procurement Access'],
  target_markets: ['Vietnam', 'Ho Chi Minh City', 'Hanoi'],
  partnership_goals: ['30-Day Municipal POC Pilot', 'Local Distribution Partner', 'Tri-Party LOI Framework'],
}

/* ─────────────────────────────────────────────────────────────
   DELIGHT — Canvas Confetti (Milestone Celebration)
───────────────────────────────────────────────────────────────*/
function useConfetti() {
  useEffect(() => {
    const canvas = document.createElement('canvas')
    canvas.style.cssText =
      'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999'
    document.body.appendChild(canvas)
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const COLORS = ['#7c3aed', '#a78bfa', '#c4b5fd', '#fbbf24', '#10b981', '#38bdf8', '#f472b6', '#ffffff']
    const particles = Array.from({ length: 150 }, () => ({
      x: Math.random() * canvas.width,
      y: -30 - Math.random() * 80,
      w: Math.random() * 10 + 4,
      h: Math.random() * 5 + 2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      vy: Math.random() * 3.5 + 1.5,
      vx: (Math.random() - 0.5) * 4,
      rot: Math.random() * 360,
      rotV: (Math.random() - 0.5) * 10,
      alpha: 1,
    }))

    let frame, tick = 0
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach((p) => {
        p.y += p.vy; p.x += p.vx; p.rot += p.rotV; p.vy += 0.055
        if (tick > 100) p.alpha = Math.max(0, p.alpha - 0.012)
        ctx.save()
        ctx.globalAlpha = p.alpha
        ctx.translate(p.x + p.w / 2, p.y + p.h / 2)
        ctx.rotate((p.rot * Math.PI) / 180)
        ctx.fillStyle = p.color
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
        ctx.restore()
      })
      tick++
      if (tick < 240) frame = requestAnimationFrame(draw)
      else canvas.remove()
    }
    draw()
    return () => { cancelAnimationFrame(frame); canvas.parentNode && canvas.remove() }
  }, [])
}

/* ─────────────────────────────────────────────────────────────
   SCORE RING — Animated SVG Circle
───────────────────────────────────────────────────────────────*/
function ScoreRing({ score, size = 68 }) {
  const r = size * 0.38, cx = size / 2, cy = size / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (Math.min(100, Math.max(0, score)) / 100) * circ
  const color = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444'
  return (
    <svg width={size} height={size} style={{ flexShrink: 0 }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#ede9fe" strokeWidth="5" />
      <circle
        cx={cx} cy={cy} r={r} fill="none"
        stroke={color} strokeWidth="5"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: 'stroke-dashoffset 1s ease-out' }}
      />
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central"
        fontSize={size * 0.22} fontWeight="800" fill={color}>{score}</text>
    </svg>
  )
}

/* ─────────────────────────────────────────────────────────────
   SPOTLIGHT CARD — Radial Cursor Glow
───────────────────────────────────────────────────────────────*/
function SpotlightCard({ children, className = '' }) {
  const ref = useRef(null)
  const onMove = (e) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    ref.current.style.setProperty('--mx', `${e.clientX - rect.left}px`)
    ref.current.style.setProperty('--my', `${e.clientY - rect.top}px`)
  }
  return (
    <div ref={ref} onMouseMove={onMove} className={`spotlight-card ${className}`}>
      {children}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   STEP INDICATOR
───────────────────────────────────────────────────────────────*/
const STEPS = [
  { label: 'Upload Files', icon: '📁' },
  { label: 'Startup Passport', icon: '🛂' },
  { label: 'Partner Matches', icon: '🤝' },
  { label: '30-Day POC Plan', icon: '📋' },
]

function StepIndicator({ current, onNavigate }) {
  return (
    <div className="steps">
      {STEPS.map((s, i) => {
        const n = i + 1
        const done = n < current
        const active = n === current
        return (
          <div key={s.label} className="step-item-wrap">
            <div
              className={`step-item ${done ? 'done' : ''} ${active ? 'active' : ''}`}
              onClick={() => done && onNavigate && onNavigate(n)}
              style={done ? { cursor: 'pointer' } : {}}
            >
              <div className="step-dot">{done ? '✓' : active ? s.icon : n}</div>
              <span className="step-label">{s.label}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`step-connector ${done ? 'done' : ''}`} />}
          </div>
        )
      })}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   STEP 1: UPLOAD (1 to 3 files, note, goal, country)
───────────────────────────────────────────────────────────────*/
function UploadStep({ onComplete }) {
  const [files, setFiles] = useState([])
  const [goal, setGoal] = useState('cross-border POC')
  const [targetCountry, setTargetCountry] = useState('Vietnam')
  const [notes, setNotes] = useState('')
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const inputRef = useRef(null)

  const addFiles = (newFiles) => {
    setError(null)
    const valid = Array.from(newFiles).filter((f) =>
      ['image/png', 'image/jpeg', 'image/webp'].includes(f.type)
    )
    if (valid.length === 0) {
      setError('Please upload PNG, JPEG, or WebP images.')
      return
    }
    setFiles((prev) => {
      const combined = [...prev, ...valid].slice(0, 3)
      if (prev.length + valid.length > 3) {
        setError('Maximum 3 files allowed. Kept the first 3.')
      }
      return combined
    })
  }

  const removeFile = (idx) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleAnalyze = async () => {
    if (files.length === 0) {
      setError('Please upload at least 1 pitch deck or brochure image.')
      return
    }
    setError(null)
    setLoading(true)
    try {
      const profile = await analyzePitch(files, {
        notes,
        goal,
        target_country: targetCountry,
      })
      onComplete(profile)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="gemma-loading">
        <div className="gemma-spinner">
          <div className="g-ring" />
          <div className="g-ring r2" />
          <div className="g-ring r3" />
        </div>
        <div className="gemma-loading-title">Gemma 4 is synthesizing your documents…</div>
        <div className="gemma-loading-sub">
          Reading {files.length} document{files.length > 1 ? 's' : ''} & reconciling into a single Startup Passport
        </div>
      </div>
    )
  }

  return (
    <div className="upload-wrap">
      {/* Upload Zone */}
      <div
        className={`upload-zone ${dragging ? 'drag-over' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files) }}
      >
        <div className="upload-icon-bg">📑</div>
        <div className="upload-label">
          {files.length > 0 ? `Selected ${files.length} of 3 file(s)` : 'Upload Pitch Deck, Brochure, or Proposal'}
        </div>
        <div className="upload-hint">Upload 1 to 3 images (PNG, JPG, WEBP, up to 5 MB each)</div>
        <div className="upload-browse-pill">Click or drag & drop files</div>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
          className="upload-input"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {/* Uploaded File Badges */}
      {files.length > 0 && (
        <div className="uploaded-files-list">
          {files.map((f, i) => (
            <div key={i} className="file-chip">
              <span className="file-name">📄 {f.name}</span>
              <span className="file-size">({(f.size / 1024).toFixed(0)} KB)</span>
              <button
                type="button"
                className="btn-chip-remove"
                onClick={(e) => { e.stopPropagation(); removeFile(i) }}
                title="Remove file"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Founder Intent Options */}
      <div className="founder-options-card">
        <div className="founder-options-grid">
          <div className="form-group">
            <label className="form-label">Primary Partnership Objective</label>
            <select
              className="form-select"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
            >
              <option value="cross-border POC">Cross-border POC / Municipal Pilot</option>
              <option value="market expansion">Market Expansion & Local Distribution</option>
              <option value="commercial partnership">Commercial Partnership & Co-development</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Target ASEAN Expansion Market</label>
            <select
              className="form-select"
              value={targetCountry}
              onChange={(e) => setTargetCountry(e.target.value)}
            >
              <option value="Vietnam">Vietnam (Ho Chi Minh City / Hanoi)</option>
              <option value="Singapore">Singapore</option>
              <option value="Indonesia">Indonesia (Jakarta / Surabaya)</option>
              <option value="Thailand">Thailand (Bangkok)</option>
              <option value="Philippines">Philippines (Manila)</option>
              <option value="Malaysia">Malaysia</option>
              <option value="ASEAN">Any ASEAN Nation</option>
            </select>
          </div>
        </div>

        <div className="form-group" style={{ marginTop: '0.85rem' }}>
          <label className="form-label">Founder Note or Specific Requirements (Optional)</label>
          <textarea
            className="form-textarea"
            rows="2"
            placeholder="e.g. We have proven IoT sensors in Malaysia and want to test route optimization for 50 municipal bins in District 1, Ho Chi Minh City."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="upload-cta-row">
        <button
          className="btn btn-primary btn-large"
          onClick={handleAnalyze}
          disabled={files.length === 0}
        >
          <span>🤖</span>
          <span>Analyze & Build Startup Passport</span>
        </button>

        <span className="or-pill">OR</span>

        <button
          className="btn btn-demo"
          onClick={() => onComplete(DEMO_PROFILE)}
        >
          <span>🚀</span>
          <span>Use Demo: SmartTONG (Malaysia → Vietnam)</span>
        </button>
      </div>

      {error && <div className="error-toast">⚠️ {error}</div>}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   STEP 2: STARTUP PASSPORT (Review & Human-in-the-Loop Edit)
───────────────────────────────────────────────────────────────*/
function PassportStep({ profile, onSave, onBack }) {
  const [data, setData] = useState({ ...profile })
  const [newCap, setNewCap] = useState('')
  const [newNeed, setNewNeed] = useState('')
  const [newMarket, setNewMarket] = useState('')
  const [newGoal, setNewGoal] = useState('')

  const handleRemoveChip = (field, idx) => {
    setData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== idx),
    }))
  }

  const handleAddChip = (field, val, setter) => {
    if (!val || !val.trim()) return
    setData((prev) => ({
      ...prev,
      [field]: [...(prev[field] || []), val.trim()],
    }))
    setter('')
  }

  return (
    <div className="step-content">
      <div className="passport-card">
        {/* Header */}
        <div className="passport-header">
          <div className="passport-badge-icon">🛂</div>
          <div>
            <div className="passport-title">Startup Passport</div>
            <div className="passport-sub">
              Review and refine what Gemma extracted. You have full control before finding partners.
            </div>
          </div>
          <div className="passport-ai-tag">Synthesized via Gemma 4</div>
        </div>

        {/* Editable Primary Fields */}
        <div className="passport-fields-grid">
          <div className="form-group">
            <label className="form-label">Company Name</label>
            <input
              type="text"
              className="form-input"
              value={data.company_name}
              onChange={(e) => setData({ ...data, company_name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Home Country</label>
            <input
              type="text"
              className="form-input"
              value={data.country}
              onChange={(e) => setData({ ...data, country: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Sector</label>
            <input
              type="text"
              className="form-input"
              value={data.sector}
              onChange={(e) => setData({ ...data, sector: e.target.value })}
            />
          </div>

          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Core Solution Statement</label>
            <textarea
              className="form-textarea"
              rows="2"
              value={data.solution}
              onChange={(e) => setData({ ...data, solution: e.target.value })}
            />
          </div>
        </div>

        {/* Interactive Chip Groups */}
        <div className="passport-chips-section">
          {/* Capabilities */}
          <div className="chip-editor-group">
            <label className="chip-group-label">Core Capabilities (What you bring)</label>
            <div className="chip-list">
              {(data.capabilities || []).map((c, i) => (
                <span key={i} className="chip chip-blue">
                  {c}
                  <button type="button" onClick={() => handleRemoveChip('capabilities', i)}>✕</button>
                </span>
              ))}
            </div>
            <div className="chip-add-row">
              <input
                type="text"
                placeholder="+ Add capability..."
                value={newCap}
                onChange={(e) => setNewCap(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddChip('capabilities', newCap, setNewCap)}
              />
              <button type="button" onClick={() => handleAddChip('capabilities', newCap, setNewCap)}>Add</button>
            </div>
          </div>

          {/* Needs */}
          <div className="chip-editor-group">
            <label className="chip-group-label">Operational Needs (What you seek)</label>
            <div className="chip-list">
              {(data.needs || []).map((n, i) => (
                <span key={i} className="chip chip-purple">
                  {n}
                  <button type="button" onClick={() => handleRemoveChip('needs', i)}>✕</button>
                </span>
              ))}
            </div>
            <div className="chip-add-row">
              <input
                type="text"
                placeholder="+ Add partner need..."
                value={newNeed}
                onChange={(e) => setNewNeed(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddChip('needs', newNeed, setNewNeed)}
              />
              <button type="button" onClick={() => handleAddChip('needs', newNeed, setNewNeed)}>Add</button>
            </div>
          </div>

          {/* Target Markets */}
          <div className="chip-editor-group">
            <label className="chip-group-label">Target Markets</label>
            <div className="chip-list">
              {(data.target_markets || []).map((m, i) => (
                <span key={i} className="chip chip-teal">
                  {m}
                  <button type="button" onClick={() => handleRemoveChip('target_markets', i)}>✕</button>
                </span>
              ))}
            </div>
            <div className="chip-add-row">
              <input
                type="text"
                placeholder="+ Add target market..."
                value={newMarket}
                onChange={(e) => setNewMarket(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddChip('target_markets', newMarket, setNewMarket)}
              />
              <button type="button" onClick={() => handleAddChip('target_markets', newMarket, setNewMarket)}>Add</button>
            </div>
          </div>

          {/* Partnership Goals */}
          <div className="chip-editor-group">
            <label className="chip-group-label">Partnership Goals</label>
            <div className="chip-list">
              {(data.partnership_goals || []).map((g, i) => (
                <span key={i} className="chip chip-orange">
                  {g}
                  <button type="button" onClick={() => handleRemoveChip('partnership_goals', i)}>✕</button>
                </span>
              ))}
            </div>
            <div className="chip-add-row">
              <input
                type="text"
                placeholder="+ Add goal..."
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddChip('partnership_goals', newGoal, setNewGoal)}
              />
              <button type="button" onClick={() => handleAddChip('partnership_goals', newGoal, setNewGoal)}>Add</button>
            </div>
          </div>
        </div>

        {/* Action Row */}
        <div className="passport-footer">
          <button className="btn btn-ghost" onClick={onBack}>
            ← Upload Different Files
          </button>
          <button className="btn btn-primary btn-large" onClick={() => onSave(data)}>
            <span>🤝</span>
            <span>Confirm Passport & Find Top Partners →</span>
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   STEP 3: MATCHES & NETWORK GRAPH
───────────────────────────────────────────────────────────────*/
const RANK_ACCENT = ['#7c3aed', '#0d9488', '#ea580c']
const RANK_LABEL  = ['#1 Best Match', '#2 Strong Match', '#3 Good Match']

function MatchesStep({ profile, onSelectPartner, onEditPassport }) {
  const [matches, setMatches] = useState(null)
  const [error, setError] = useState(null)
  const [graphData, setGraphData] = useState(null)

  useEffect(() => {
    getMatches(profile)
      .then((d) => setMatches(d.matches || d))
      .catch((e) => setError(e.message))

    getGraph()
      .then(setGraphData)
      .catch((e) => console.warn('Graph error:', e))
  }, [profile])

  return (
    <div className="step-content">
      {/* Mini Profile Summary Bar */}
      <div className="profile-mini-bar">
        <div>
          <span className="mini-company">{profile.company_name}</span>
          <span className="mini-sub">
            📍 {profile.country} &bull; Sector: {profile.sector} &bull; Target: {profile.target_markets.slice(0, 2).join(', ')}
          </span>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={onEditPassport}>
          ✏️ Edit Passport
        </button>
      </div>

      {/* Section Header */}
      <div className="matches-header">
        <div>
          <div className="section-title">Top 3 ASEAN Partner Recommendations</div>
          <div className="section-sub">
            Ranked via deterministic 30/30/20/20 weighted matching. Choose which partner to generate a 30-day POC plan for.
          </div>
        </div>
      </div>

      {error && <div className="error-toast">⚠️ {error}</div>}

      {/* Matches Grid */}
      {matches ? (
        <div className="matches-grid">
          {matches.map((m, i) => (
            <SpotlightCard key={m.partner_id || i} className="match-card">
              <div className="match-stripe" style={{ background: RANK_ACCENT[i] }}>
                <span className="match-rank">{RANK_LABEL[i]}</span>
                <span className="match-illustrative">illustrative</span>
              </div>
              <div className="match-body">
                <div className="match-top">
                  <div className="match-info">
                    <div className="match-name">{m.partner_name || m.name}</div>
                    <div className="match-country">📍 {m.country}</div>
                  </div>
                  <ScoreRing score={m.score} />
                </div>

                <div className="match-reasons">
                  <div className="match-section-label">Why It Fits</div>
                  <ul>
                    {(m.reasons || []).map((r, idx) => (
                      <li key={idx}><span className="reason-star">✦</span>{r}</li>
                    ))}
                  </ul>
                </div>

                {m.opportunity && (
                  <div className="match-opportunity">{m.opportunity}</div>
                )}

                <button
                  className="btn btn-primary btn-full"
                  onClick={() => onSelectPartner(m)}
                >
                  Generate Partnership Brief →
                </button>
              </div>
            </SpotlightCard>
          ))}
        </div>
      ) : (
        <div className="matches-grid">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton-card">
              <div className="skeleton" style={{ height: 32, marginBottom: '1rem' }} />
              <div className="skeleton" style={{ height: 16, width: '70%', marginBottom: 8 }} />
              <div className="skeleton" style={{ height: 12, width: '40%', marginBottom: 16 }} />
              <div className="skeleton" style={{ height: 12, marginBottom: 8 }} />
              <div className="skeleton" style={{ height: 12, width: '85%', marginBottom: 16 }} />
              <div className="skeleton" style={{ height: 36, borderRadius: 8 }} />
            </div>
          ))}
        </div>
      )}

      {/* Network Graph */}
      <div className="card" style={{ padding: '0.25rem', overflow: 'hidden', marginTop: '1rem' }}>
        <EcosystemGraph
          startup={profile}
          matches={matches || []}
          nodes={graphData?.nodes}
          edges={graphData?.edges}
          onNodeClick={(n) => console.log('Clicked node:', n)}
        />
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   STEP 4: PARTNERSHIP BRIEF & 30-DAY POC PLAN
───────────────────────────────────────────────────────────────*/
const WEEK_CLR = ['#7c3aed', '#2563eb', '#0d9488', '#16a34a']

function BriefStep({ profile, partner, onBackToMatches, onReset }) {
  const [brief, setBrief] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useConfetti()

  useEffect(() => {
    setLoading(true)
    setError(null)
    getBrief(profile, partner.partner_id || partner.id || partner.name)
      .then((b) => {
        setBrief(b)
        setLoading(false)
      })
      .catch((e) => {
        setError(e.message)
        setLoading(false)
      })
  }, [profile, partner])

  const copyBrief = () => {
    if (!brief) return
    const text = [
      `PARTNERSHIP ACTION BRIEF: ${profile.company_name} × ${partner.partner_name || partner.name}\n`,
      `Outcome Model: Cross-Border Municipal POC & Pilot\n\n`,
      `OBJECTIVE:\n${brief.objective}\n\n`,
      `COLLABORATION CONCEPT:\n${brief.collaboration_concept || brief.collaborationConcept}\n\n`,
      `PROPOSED 30-DAY PROOF OF CONCEPT:\n${brief.proposed_poc || brief.proposedPoc}\n\n`,
      `PILOT TIMELINE:\n${(brief.timeline || []).map((t, i) => `${i + 1}. ${t}`).join('\n')}\n\n`,
      `SUCCESS METRICS:\n${(brief.success_metrics || brief.successMetrics || []).map((m) => `• ${m}`).join('\n')}\n\n`,
      `Generated by PACT with Gemma 4 (open-weight AI). All records illustrative.`,
    ].join('')

    navigator.clipboard?.writeText(text).catch(() => {})
    alert('✅ Brief copied to clipboard!')
  }

  const downloadMarkdown = () => {
    if (!brief) return
    const md = [
      `# Partnership Action Brief: ${profile.company_name} × ${partner.partner_name || partner.name}\n`,
      `> **Generated by PACT (Partnership Action & Collaboration Toolkit)**  `,
      `> Powered by Gemma 4 (gemma-4-26b-a4b-it) · All data illustrative\n\n`,
      `## 1. Strategic Objective\n${brief.objective}\n\n`,
      `## 2. Collaboration Concept\n${brief.collaboration_concept || brief.collaborationConcept}\n\n`,
      `## 3. Proposed 30-Day Proof of Concept\n${brief.proposed_poc || brief.proposedPoc}\n\n`,
      `## 4. 30-Day Implementation Timeline\n`,
      ...(brief.timeline || []).map((t, i) => `- **Week ${i + 1}:** ${t}\n`),
      `\n## 5. Measurable Success Metrics\n`,
      ...(brief.success_metrics || brief.successMetrics || []).map((m) => `- [ ] ${m}\n`),
      `\n---\n*PACT Hackathon Demo · MLH Hacktoberfest KL 2026*`,
    ].join('')

    const blob = new Blob([md], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `PACT_Brief_${profile.company_name}_x_${(partner.partner_name || 'partner').replace(/\s+/g, '_')}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="brief-generating" style={{ minHeight: 300, justifyContent: 'center' }}>
        <div className="gemma-spinner">
          <div className="g-ring" />
          <div className="g-ring r2" />
        </div>
        <div>
          <div className="bgen-title">Gemma 4 is crafting your 30-day POC plan…</div>
          <div className="bgen-sub">
            Formulating concrete collaboration milestones between {profile.company_name} and {partner.partner_name || partner.name}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="brief-card" style={{ padding: '2rem', textAlign: 'center' }}>
        <div className="error-toast" style={{ marginBottom: '1.5rem' }}>⚠️ {error}</div>
        <button className="btn btn-primary" onClick={onBackToMatches}>
          ← Return to Partner Matches
        </button>
      </div>
    )
  }

  return (
    <div className="brief-card">
      {/* Header */}
      <div className="brief-header">
        <div>
          <div className="brief-success-badge">
            <span>🎉 Match Converted to Action Plan</span>
            <span className="outcome-type-pill">Municipal Pilot Agreement</span>
          </div>
          <div className="brief-title">
            {profile.company_name} <span style={{ color: 'var(--purple-light)' }}>×</span> {partner.partner_name || partner.name}
          </div>
          <div className="brief-sub">📍 {partner.country} &bull; Compatibility Score: {partner.score}/100</div>
        </div>
        <div className="brief-actions">
          <button className="btn btn-ghost" onClick={copyBrief} title="Copy to clipboard">
            📋 Copy Brief
          </button>
          <button className="btn btn-ghost" onClick={downloadMarkdown} title="Download Markdown">
            💾 Download .md
          </button>
          <button className="btn btn-ghost" onClick={onBackToMatches}>
            🤝 Choose Another Partner
          </button>
        </div>
      </div>

      {/* Objective Hero Block */}
      <div className="brief-objective-block">
        <div className="brief-label">Strategic Objective</div>
        <div className="brief-objective-text">{brief.objective}</div>
      </div>

      {/* Collaboration & POC Columns */}
      <div className="brief-two-col">
        <div className="brief-section">
          <div className="brief-label">Collaboration Concept</div>
          <p className="brief-text">{brief.collaboration_concept || brief.collaborationConcept}</p>
        </div>
        <div className="brief-section">
          <div className="brief-label">Proposed Proof of Concept</div>
          <div className="poc-block">{brief.proposed_poc || brief.proposedPoc}</div>
        </div>
      </div>

      {/* 30-Day Timeline Stepper */}
      <div className="brief-section">
        <div className="brief-label">30-Day Implementation Timeline</div>
        <div className="timeline-stepper">
          {(brief.timeline || []).map((item, i) => (
            <div key={i} className="tl-step">
              <div className="tl-dot" style={{ background: WEEK_CLR[i % 4] }}>
                {i + 1}
              </div>
              {i < (brief.timeline || []).length - 1 && <div className="tl-connector" />}
              <div className="tl-text">
                {typeof item === 'string' ? item : item.task || JSON.stringify(item)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Success Metrics */}
      <div className="brief-section">
        <div className="brief-label">Measurable Success Metrics</div>
        <div className="metrics-chips">
          {(brief.success_metrics || brief.successMetrics || []).map((m, i) => (
            <div key={i} className="metric-chip">
              <span className="metric-check">✓</span>
              {typeof m === 'string' ? m : m.metric || JSON.stringify(m)}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="brief-footer">
        <div className="brief-disclaimer">
          ⚠️ All generated outcomes and partner records are <strong>illustrative</strong> for demonstration purposes.
        </div>
        <button className="btn btn-primary" onClick={onReset}>
          🔄 Start New Analysis
        </button>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   MAIN APPLICATION ROOT
───────────────────────────────────────────────────────────────*/
export default function App() {
  const [step, setStep] = useState(1)
  const [profile, setProfile] = useState(null)
  const [selectedPartner, setSelectedPartner] = useState(null)

  const handleUploadDone = (p) => {
    setProfile(p)
    setStep(2) // Advance to Passport Review
  }

  const handlePassportConfirmed = (p) => {
    setProfile(p)
    setStep(3) // Advance to Matches & Graph
  }

  const handlePartnerSelected = (partner) => {
    setSelectedPartner(partner)
    setStep(4) // Advance to Brief
  }

  const handleReset = () => {
    setStep(1)
    setProfile(null)
    setSelectedPartner(null)
  }

  return (
    <>
      {/* ── Top Navigation Bar ── */}
      <nav className="nav">
        <div className="nav-inner">
          <div className="nav-brand">
            <span className="nav-logo">PACT</span>
            <span className="nav-tagline">Partnership Action & Collaboration Toolkit</span>
          </div>

          <StepIndicator current={step} onNavigate={(s) => setStep(s)} />

          <div className="nav-gemma">✦ Gemma 4</div>
        </div>
      </nav>

      {/* ── Main Content Area ── */}
      <main className="main">
        {step === 1 && (
          <>
            <div className="hero-banner">
              <div className="hero-eyebrow">MLH Hacktoberfest KL 2026 &bull; Best Use of Gemma 4</div>
              <h1 className="hero-title">
                From ASEAN Connections<br />
                <span className="hero-gradient">to Real Partner Outcomes</span>
              </h1>
              <p className="hero-sub">
                Upload your pitch deck or brochure &bull; Gemma 4 builds your Startup Passport &bull;
                Discover verified cross-border partner matches &bull; Generate an executable 30-day POC plan.
              </p>
              <div className="hero-badges">
                <span className="hero-badge">🤖 Gemma 4 Vision</span>
                <span className="hero-badge">🌏 ASEAN Ecosystem</span>
                <span className="hero-badge">⚖️ Transparent 30/30/20/20 Match</span>
                <span className="hero-badge">📋 30-Day Action Plans</span>
              </div>
            </div>

            <div className="upload-card">
              <UploadStep onComplete={handleUploadDone} />
            </div>

            <div className="disclaimer">
              ⚠️ All ecosystem records and partner profiles are <strong>illustrative</strong> for demonstration purposes.
            </div>
          </>
        )}

        {step === 2 && profile && (
          <PassportStep
            profile={profile}
            onSave={handlePassportConfirmed}
            onBack={() => setStep(1)}
          />
        )}

        {step === 3 && profile && (
          <MatchesStep
            profile={profile}
            onSelectPartner={handlePartnerSelected}
            onEditPassport={() => setStep(2)}
          />
        )}

        {step === 4 && profile && selectedPartner && (
          <BriefStep
            profile={profile}
            partner={selectedPartner}
            onBackToMatches={() => setStep(3)}
            onReset={handleReset}
          />
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="footer">
        Powered by <strong>Gemma 4</strong> (open-weight AI via Gemini API) &bull; Open source, MIT Licence &bull;
        MLH Hacktoberfest KL 2026 &bull; Team PACT (Yap, Joe, Amn, Yuhang)
      </footer>
    </>
  )
}
