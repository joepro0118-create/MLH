// frontend/src/App.jsx — PACT: AI Cross-Border Startup Partnership Toolkit
// Designed for Founders: Upload 1-3 files + notes + goal -> Gemma fuses into Passport -> Edit -> Match & Graph -> Brief & 30-Day POC
import { useState, useEffect, useRef } from 'react'
import { analyzePitch, getMatches, getGraph, getBrief, healthCheck } from './api.js'
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

const FALLBACK_MATCHES = [
  {
    partner_id: 'partner-vn-01',
    partner_name: 'Saigon Green Urban Waste Board (illustrative)',
    country: 'Vietnam',
    score: 88,
    reasons: [
      'Sector alignment: smart-city ↔ smart-waste, cleantech, govtech',
      'Your capabilities match their needs: iot fill level sensors, route optimization software',
      'Shared target market: Vietnam, Ho Chi Minh City',
    ],
    opportunity:
      "Saigon Green Urban Waste Board's municipal concessions and landfill jurisdiction give SmartTONG a direct path to piloting smart bin sensors in District 1 and District 3 without cold-start procurement delays.",
  },
  {
    partner_id: 'partner-vn-03',
    partner_name: 'Mekong Green Horizons Accelerator (illustrative)',
    country: 'Vietnam',
    score: 76,
    reasons: [
      'Sector alignment: smart-city ↔ cleantech, smart-waste',
      'They can fulfill your needs: vietnam market entry support, pilot project subsidies',
      'Shared target market: Vietnam, Malaysia',
    ],
    opportunity:
      'Mekong Green Horizons Accelerator provides matching pilot grants and bilateral regulatory fast-tracking specifically designed for Malaysian cleantech innovators deploying in Vietnam.',
  },
  {
    partner_id: 'partner-vn-02',
    partner_name: 'VinaFleet EcoLogistics (illustrative)',
    country: 'Vietnam',
    score: 70,
    reasons: [
      'Your capabilities match their needs: route optimization software, iot fill level sensors',
      'They can fulfill your needs: electric waste truck fleet, field maintenance',
      'Shared target market: Vietnam',
    ],
    opportunity:
      "VinaFleet EcoLogistics' commercial electric waste truck fleet serves as the immediate operational fleet partner to install SmartTONG sensors and validate dynamic route scheduling across northern and southern industrial parks.",
  },
]

const FALLBACK_BRIEF = {
  objective:
    'SmartTONG and Saigon Green Urban Waste Board will jointly pilot IoT smart-bin route optimisation across Ho Chi Minh City District 1 and District 3 to demonstrate a ≥20% reduction in collection vehicle diesel emissions and eliminate bin overflow complaints (RECOMMENDATION).',
  collaboration_concept:
    'SmartTONG deploys 50 solar-assisted IoT ultrasonic fill-level sensors and provides live access to its route-optimisation telematics dashboard. Saigon Green Urban Waste Board provides municipal bin concession sites, coordinates driver route dispatch, and provides local maintenance personnel. Weekly joint operational steering reviews ensure rapid calibration against Ho Chi Minh City traffic patterns.',
  proposed_poc:
    'Deploy 50 IoT smart bin sensor nodes across commercial corridors in District 1 and District 3 over Days 1–7. Run live route-optimisation for municipal collection trucks from Days 8–28. Measure fuel savings, overflow incident reduction, and sensor reliability in a final joint audit on Day 30 (ILLUSTRATIVE).',
  timeline: [
    'Week 1: MOU signing, site survey in District 1/3, sensor installation on 50 civic bins',
    'Week 2: Dashboard onboarding for municipal dispatchers; baseline route fuel telemetry capture',
    'Week 3: Live dynamic routing execution; daily driver sync with Saigon Green operations team',
    'Week 4: Joint performance audit report, city council showcase, and Phase 2 scale-up proposal',
  ],
  success_metrics: [
    '≥20% reduction in collection truck trip miles and diesel consumption vs. baseline',
    '≥90% fill-rate telemetry accuracy across all 50 pilot bins over 30 days',
    'Formal Letter of Intent from Saigon Green Urban Waste Board for municipal-wide expansion',
  ],
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

function StepIndicator({ current, onNavigate, maxStepReached }) {
  return (
    <div className="steps">
      {STEPS.map((s, i) => {
        const n = i + 1
        const done = n < current
        const active = n === current
        const clickable = n <= maxStepReached && n !== current
        return (
          <div key={s.label} className="step-item-wrap">
            <div
              className={`step-item ${done ? 'done' : ''} ${active ? 'active' : ''}`}
              onClick={() => clickable && onNavigate && onNavigate(n)}
              style={clickable ? { cursor: 'pointer' } : {}}
              title={clickable ? `Go to Step ${n}: ${s.label}` : s.label}
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
function UploadStep({ onComplete, onNotify }) {
  const [files, setFiles] = useState([])
  const [previews, setPreviews] = useState([])
  const [goal, setGoal] = useState('cross-border POC')
  const [targetCountry, setTargetCountry] = useState('Vietnam')
  const [notes, setNotes] = useState('')
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingSample, setLoadingSample] = useState(false)
  const [error, setError] = useState(null)
  const inputRef = useRef(null)

  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f))
    setPreviews(urls)
    return () => urls.forEach((u) => URL.revokeObjectURL(u))
  }, [files])

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

  const handleLoadSampleSlide = async (e) => {
    e?.stopPropagation()
    setError(null)
    setLoadingSample(true)
    try {
      const res = await fetch('/sample_pitch_deck.png')
      if (!res.ok) throw new Error('Sample pitch slide not found.')
      const blob = await res.blob()
      const sampleFile = new File([blob], 'sample_pitch_deck.png', { type: 'image/png' })
      setFiles((prev) => {
        const filtered = prev.filter((f) => f.name !== 'sample_pitch_deck.png')
        return [...filtered, sampleFile].slice(0, 3)
      })
      if (!notes) {
        setNotes('We have proven IoT smart-bin sensors in Malaysia and seek a 30-day municipal waste collection pilot in Ho Chi Minh City, Vietnam.')
      }
      onNotify?.('Loaded SmartTONG sample pitch slide — ready for Gemma 4 Vision!')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingSample(false)
    }
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
      onNotify?.('Startup Passport synthesized by Gemma 4!')
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
          Reading {files.length} document{files.length > 1 ? 's' : ''} &amp; reconciling founder intent into a single Startup Passport
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
          {files.length > 0 ? `Selected ${files.length} of 3 document(s)` : 'Upload Pitch Deck, Brochure, or Proposal'}
        </div>
        <div className="upload-hint">Upload 1 to 3 images (PNG, JPG, WEBP, up to 5 MB each)</div>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.35rem' }}>
          <div className="upload-browse-pill">📁 Click or drag &amp; drop files</div>
          <button
            type="button"
            className="upload-sample-pill"
            onClick={handleLoadSampleSlide}
            disabled={loadingSample}
          >
            🖼️ {loadingSample ? 'Loading Slide…' : 'Load Sample Pitch Slide'}
          </button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
          className="upload-input"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {/* Uploaded File Previews & Badges */}
      {files.length > 0 && (
        <div className="uploaded-previews-grid">
          {files.map((f, i) => (
            <div key={i} className="file-preview-card">
              <div className="file-preview-thumb-wrap">
                {previews[i] && <img src={previews[i]} alt={f.name} className="file-preview-thumb" />}
                <span className="file-index-badge">Doc #{i + 1}</span>
                <button
                  type="button"
                  className="file-preview-remove"
                  onClick={(e) => { e.stopPropagation(); removeFile(i) }}
                  title="Remove file"
                >
                  ✕
                </button>
              </div>
              <div className="file-preview-meta">
                <span className="file-name" title={f.name}>📄 {f.name}</span>
                <span className="file-size">{(f.size / 1024).toFixed(0)} KB</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Founder Intent Options */}
      <div className="founder-options-card">
        <div className="founder-options-header">
          <span className="founder-options-badge">✦ Founder Expansion Context</span>
          <span className="founder-options-hint">Fused with your uploaded visuals by Gemma 4</span>
        </div>
        <div className="founder-options-grid">
          <div className="form-group">
            <label className="form-label">Primary Partnership Objective</label>
            <select
              className="form-select"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
            >
              <option value="cross-border POC">Cross-border POC / Municipal Pilot</option>
              <option value="market expansion">Market Expansion &amp; Local Distribution</option>
              <option value="commercial partnership">Commercial Partnership &amp; Co-development</option>
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
          <span>Analyze &amp; Build Startup Passport</span>
        </button>

        <span className="or-pill">OR</span>

        <button
          className="btn btn-demo"
          onClick={() => {
            onNotify?.('Loaded SmartTONG demo Startup Passport!')
            onComplete(DEMO_PROFILE)
          }}
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
const SECTOR_OPTIONS = [
  'smart-city',
  'sustainability',
  'cleantech',
  'logistics',
  'fintech',
  'agritech',
  'healthtech',
  'edtech',
  'govtech',
  'other',
]

function PassportStep({ profile, onSave, onBack, onNotify }) {
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
            <div className="passport-title">ASEAN Startup Passport</div>
            <div className="passport-sub">
              Review and refine what Gemma 4 extracted. Your edits directly drive the 30/30/20/20 partner matching engine.
            </div>
          </div>
          <div className="passport-header-right">
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => {
                setData({ ...profile })
                onNotify?.('Reset Passport fields to extracted values')
              }}
              title="Reset changes"
            >
              ↺ Reset
            </button>
            <div className="passport-ai-tag">✦ Synthesized via Gemma 4</div>
          </div>
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
            <label className="form-label">
              Sector <span className="weight-mini-pill">30% Weight</span>
            </label>
            <input
              type="text"
              list="sector-suggestions"
              className="form-input"
              value={data.sector}
              onChange={(e) => setData({ ...data, sector: e.target.value })}
            />
            <datalist id="sector-suggestions">
              {SECTOR_OPTIONS.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
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
            <div className="chip-group-header">
              <label className="chip-group-label">Core Capabilities (What you bring)</label>
              <span className="weight-mini-pill">30% Weight</span>
            </div>
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
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddChip('capabilities', newCap, setNewCap))}
              />
              <button type="button" onClick={() => handleAddChip('capabilities', newCap, setNewCap)}>Add</button>
            </div>
          </div>

          {/* Needs */}
          <div className="chip-editor-group">
            <div className="chip-group-header">
              <label className="chip-group-label">Operational Needs (What you seek)</label>
              <span className="weight-mini-pill">30% Weight</span>
            </div>
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
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddChip('needs', newNeed, setNewNeed))}
              />
              <button type="button" onClick={() => handleAddChip('needs', newNeed, setNewNeed)}>Add</button>
            </div>
          </div>

          {/* Target Markets */}
          <div className="chip-editor-group">
            <div className="chip-group-header">
              <label className="chip-group-label">Target Markets</label>
              <span className="weight-mini-pill">20% Weight</span>
            </div>
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
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddChip('target_markets', newMarket, setNewMarket))}
              />
              <button type="button" onClick={() => handleAddChip('target_markets', newMarket, setNewMarket)}>Add</button>
            </div>
          </div>

          {/* Partnership Goals */}
          <div className="chip-editor-group">
            <div className="chip-group-header">
              <label className="chip-group-label">Partnership Goals</label>
              <span className="weight-mini-pill">20% Weight</span>
            </div>
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
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddChip('partnership_goals', newGoal, setNewGoal))}
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
            <span>Confirm Passport &amp; Find Top Partners →</span>
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

function MatchesStep({ profile, onSelectPartner, onEditPassport, onNotify }) {
  const [matches, setMatches] = useState(null)
  const [error, setError] = useState(null)
  const [graphData, setGraphData] = useState(null)
  const [viewMode, setViewMode] = useState('both') // 'both' | 'cards' | 'graph'

  useEffect(() => {
    setMatches(null)
    setError(null)
    getMatches(profile)
      .then((d) => setMatches(d.matches || d))
      .catch((e) => {
        console.warn('Matches API error, using illustrative fallback:', e)
        setMatches(FALLBACK_MATCHES)
        onNotify?.('Using illustrative partner matches (offline fallback)')
      })

    getGraph()
      .then(setGraphData)
      .catch((e) => console.warn('Graph error:', e))
  }, [profile])

  return (
    <div className="step-content">
      {/* Mini Profile Summary Bar */}
      <div className="profile-mini-bar">
        <div className="mini-left">
          <span className="mini-company">🛂 {profile.company_name}</span>
          <span className="mini-sub">
            📍 {profile.country} &bull; Sector: <strong>{profile.sector}</strong> &bull; Target: {(profile.target_markets || []).slice(0, 3).join(', ')}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="view-mode-pills">
            <button
              type="button"
              className={`view-pill ${viewMode === 'both' ? 'active' : ''}`}
              onClick={() => setViewMode('both')}
            >
              ✦ Cards + Graph
            </button>
            <button
              type="button"
              className={`view-pill ${viewMode === 'cards' ? 'active' : ''}`}
              onClick={() => setViewMode('cards')}
            >
              🤝 Top 3 Cards
            </button>
            <button
              type="button"
              className={`view-pill ${viewMode === 'graph' ? 'active' : ''}`}
              onClick={() => setViewMode('graph')}
            >
              🕸️ Network Graph
            </button>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onEditPassport}>
            ✏️ Edit Passport
          </button>
        </div>
      </div>

      {/* Section Header + Weights Breakdown */}
      <div className="matches-header">
        <div>
          <div className="section-title">Top 3 ASEAN Partner Recommendations</div>
          <div className="section-sub">
            Ranked via deterministic 30/30/20/20 weighted matching. Select any partner to generate an executable 30-day POC plan.
          </div>
        </div>
        <div className="weights-legend">
          <span className="weight-badge wb-purple">Industry 30%</span>
          <span className="weight-badge wb-blue">Caps ↔ Needs 30%</span>
          <span className="weight-badge wb-teal">Market 20%</span>
          <span className="weight-badge wb-orange">Goals 20%</span>
        </div>
      </div>

      {error && <div className="error-toast">⚠️ {error}</div>}

      {/* Matches Grid */}
      {viewMode !== 'graph' && (
        matches ? (
          <div className="matches-grid">
            {matches.map((m, i) => (
              <SpotlightCard key={m.partner_id || i} className="match-card">
                <div className="match-stripe" style={{ background: RANK_ACCENT[i] || '#7c3aed' }}>
                  <span className="match-rank">{RANK_LABEL[i] || `#${i + 1} Match`}</span>
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
        )
      )}

      {/* Network Graph */}
      {viewMode !== 'cards' && (
        <div className="card" style={{ padding: '0.25rem', overflow: 'hidden', marginTop: '0.5rem' }}>
          <EcosystemGraph
            startup={profile}
            matches={matches || []}
            nodes={graphData?.nodes}
            edges={graphData?.edges}
            onNodeClick={(n) => {
              if (!n || !matches) return
              const found = matches.find((m) => m.partner_id === n.id || m.partner_name === n.label)
              if (found) {
                onNotify?.(`Selected top match: ${found.partner_name}`)
              }
            }}
          />
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   STEP 4: PARTNERSHIP BRIEF & 30-DAY POC PLAN
───────────────────────────────────────────────────────────────*/
const WEEK_CLR = ['#7c3aed', '#2563eb', '#0d9488', '#16a34a']

function BriefStep({ profile, partner, onBackToMatches, onReset, onNotify }) {
  const [brief, setBrief] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [checkedMetrics, setCheckedMetrics] = useState({})

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
        console.warn('Brief API error, using illustrative fallback:', e)
        setBrief(FALLBACK_BRIEF)
        setLoading(false)
        onNotify?.('Generated illustrative 30-day POC plan (offline fallback)')
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
    onNotify?.('✅ Partnership Brief copied to clipboard!')
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
    onNotify?.('💾 Downloaded 30-Day POC Plan as Markdown (.md)!')
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
          <div className="brief-sub">📍 {partner.country} &bull; Compatibility Score: <strong>{partner.score}/100</strong></div>
        </div>
        <div className="brief-actions">
          <button className="btn btn-ghost" onClick={copyBrief} title="Copy to clipboard">
            📋 Copy Brief
          </button>
          <button className="btn btn-primary" onClick={downloadMarkdown} title="Download Markdown">
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
        <div className="brief-label">30-Day Implementation Timeline (Week 1 – Week 4)</div>
        <div className="timeline-stepper">
          {(brief.timeline || []).map((item, i) => (
            <div key={i} className="tl-step">
              <div className="tl-top-row">
                <div className="tl-dot" style={{ background: WEEK_CLR[i % 4] }}>
                  {i + 1}
                </div>
                <span className="tl-week-badge">Week {i + 1} &bull; Days {i * 7 + 1}–{Math.min(30, (i + 1) * 7 + (i === 3 ? 2 : 0))}</span>
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
        <div className="brief-label">Measurable Success Metrics &amp; Target KPIs (Click to check off)</div>
        <div className="metrics-chips">
          {(brief.success_metrics || brief.successMetrics || []).map((m, i) => {
            const checked = !!checkedMetrics[i]
            return (
              <div
                key={i}
                className={`metric-chip ${checked ? 'checked' : ''}`}
                onClick={() => setCheckedMetrics((prev) => ({ ...prev, [i]: !prev[i] }))}
                style={{ cursor: 'pointer' }}
              >
                <span className="metric-check">{checked ? '☑' : '✓'}</span>
                {typeof m === 'string' ? m : m.metric || JSON.stringify(m)}
              </div>
            )
          })}
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
  const [apiStatus, setApiStatus] = useState({ online: null, mock: false })
  const [toast, setToast] = useState(null)

  const notify = (msg) => {
    setToast(msg)
    setTimeout(() => {
      setToast((curr) => (curr === msg ? null : curr))
    }, 3600)
  }

  useEffect(() => {
    healthCheck()
      .then((d) => setApiStatus({ online: d?.status === 'ok', mock: !!d?.mock_mode }))
      .catch(() => setApiStatus({ online: false, mock: false }))
  }, [])

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

  const maxStepReached = selectedPartner ? 4 : profile ? 3 : 1

  return (
    <>
      {/* ── Toast Notification ── */}
      {toast && (
        <div className="pact-toast" onClick={() => setToast(null)}>
          <span>{toast}</span>
        </div>
      )}

      {/* ── Top Navigation Bar ── */}
      <nav className="nav">
        <div className="nav-inner">
          <div className="nav-brand" onClick={handleReset} style={{ cursor: 'pointer' }} title="Return to Step 1">
            <span className="nav-logo">PACT</span>
            <span className="nav-tagline">Partnership Action &amp; Collaboration Toolkit</span>
          </div>

          <StepIndicator
            current={step}
            maxStepReached={maxStepReached}
            onNavigate={(s) => setStep(s)}
          />

          <div className="nav-right-pills">
            <span
              className={`nav-status-pill ${apiStatus.online ? 'online' : 'offline'}`}
              title={apiStatus.online ? 'FastAPI Backend Connected' : 'Offline Fallback Ready'}
            >
              <span className="status-dot" />
              {apiStatus.online ? (apiStatus.mock ? 'Mock Mode' : 'API Live') : 'Demo Ready'}
            </span>
            <div className="nav-gemma">✦ Gemma 4</div>
          </div>
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
                Upload 1–3 pitch slides or brochures &bull; Gemma 4 builds your Startup Passport &bull;
                Discover verified cross-border partner matches &bull; Generate an executable 30-day POC plan.
              </p>
              <div className="hero-badges">
                <span className="hero-badge">🤖 Gemma 4 Multi-Doc Vision</span>
                <span className="hero-badge">🌏 ASEAN Ecosystem</span>
                <span className="hero-badge">⚖️ Transparent 30/30/20/20 Match</span>
                <span className="hero-badge">📋 30-Day Action Plans</span>
              </div>
            </div>

            <div className="upload-card">
              <UploadStep onComplete={handleUploadDone} onNotify={notify} />
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
            onNotify={notify}
          />
        )}

        {step === 3 && profile && (
          <MatchesStep
            profile={profile}
            onSelectPartner={handlePartnerSelected}
            onEditPassport={() => setStep(2)}
            onNotify={notify}
          />
        )}

        {step === 4 && profile && selectedPartner && (
          <BriefStep
            profile={profile}
            partner={selectedPartner}
            onBackToMatches={() => setStep(3)}
            onReset={handleReset}
            onNotify={notify}
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
