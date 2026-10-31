// frontend/src/App.jsx — PACT v2: AI Cross-Border Partnership Toolkit
// UICheatSheet Rule of 3:
//   Hero    → Border-beam upload zone with glow pulse
//   Micro   → Shimmer skeletons + Spotlight cards + Expandable/editable dash cards
//   Delight → Confetti + Export/Copy/Download/Share action toolbar
import { useState, useEffect, useRef, useCallback } from 'react'
import { analyzePitch, getMatches, getGraph, getBrief } from './api.js'
import { EcosystemGraph } from './components/EcosystemGraph.jsx'
import './index.css'

/* ─────────────────────────────────────────────────────────────
   DEMO DATA (SmartTONG — Malaysia → Vietnam municipal pilot)
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
   TOAST NOTIFICATION SYSTEM
   Light, non-blocking, auto-dismisses in 3s
───────────────────────────────────────────────────────────────*/
function useToast() {
  const [toasts, setToasts] = useState([])
  const show = useCallback((msg, type = 'success') => {
    const id = Date.now()
    setToasts((t) => [...t, { id, msg, type }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000)
  }, [])
  return { toasts, show }
}

function ToastContainer({ toasts }) {
  if (!toasts.length) return null
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast-msg toast-${t.type}`}>{t.msg}</div>
      ))}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   CANVAS CONFETTI — Milestone Delight
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
   SPOTLIGHT CARD — Radial Cursor Glow (UICheatSheet #7)
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
  { label: 'POC Dashboard', icon: '📋' },
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
      if (prev.length + valid.length > 3) setError('Maximum 3 files allowed. Kept the first 3.')
      return combined
    })
  }

  const removeFile = (idx) => setFiles((prev) => prev.filter((_, i) => i !== idx))

  const handleAnalyze = async () => {
    if (files.length === 0) { setError('Please upload at least 1 pitch deck or brochure image.'); return }
    setError(null); setLoading(true)
    try {
      const profile = await analyzePitch(files, { notes, goal, target_country: targetCountry })
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
          Reading {files.length} document{files.length > 1 ? 's' : ''} &amp; reconciling into a single Startup Passport
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
        <div className="upload-browse-pill">Click or drag &amp; drop files</div>
        <input
          ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp"
          multiple className="upload-input"
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
              <button type="button" className="btn-chip-remove"
                onClick={(e) => { e.stopPropagation(); removeFile(i) }} title="Remove">✕</button>
            </div>
          ))}
        </div>
      )}

      {/* Founder Intent */}
      <div className="founder-options-card">
        <div className="founder-options-grid">
          <div className="form-group">
            <label className="form-label">Primary Partnership Objective</label>
            <select className="form-select" value={goal} onChange={(e) => setGoal(e.target.value)}>
              <option value="cross-border POC">Cross-border POC / Municipal Pilot</option>
              <option value="market expansion">Market Expansion &amp; Local Distribution</option>
              <option value="commercial partnership">Commercial Partnership &amp; Co-development</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Target ASEAN Expansion Market</label>
            <select className="form-select" value={targetCountry} onChange={(e) => setTargetCountry(e.target.value)}>
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
            className="form-textarea" rows="2"
            placeholder="e.g. We have proven IoT sensors in Malaysia and want to test route optimization for 50 municipal bins in District 1, Ho Chi Minh City."
            value={notes} onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="upload-cta-row">
        <button className="btn btn-primary btn-large" onClick={handleAnalyze} disabled={files.length === 0}>
          <span>🤖</span>
          <span>Analyze &amp; Build Startup Passport</span>
        </button>
        <span className="or-pill">OR</span>
        <button className="btn btn-demo" onClick={() => onComplete(DEMO_PROFILE)}>
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

  const handleRemoveChip = (field, idx) =>
    setData((prev) => ({ ...prev, [field]: prev[field].filter((_, i) => i !== idx) }))

  const handleAddChip = (field, val, setter) => {
    if (!val || !val.trim()) return
    setData((prev) => ({ ...prev, [field]: [...(prev[field] || []), val.trim()] }))
    setter('')
  }

  return (
    <div className="step-content">
      <div className="passport-card">
        <div className="passport-header">
          <div className="passport-badge-icon">🛂</div>
          <div>
            <div className="passport-title">Startup Passport</div>
            <div className="passport-sub">Review and refine what Gemma extracted. You have full control before finding partners.</div>
          </div>
          <div className="passport-ai-tag">Synthesized via Gemma 4</div>
        </div>

        <div className="passport-fields-grid">
          <div className="form-group">
            <label className="form-label">Company Name</label>
            <input type="text" className="form-input" value={data.company_name}
              onChange={(e) => setData({ ...data, company_name: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Home Country</label>
            <input type="text" className="form-input" value={data.country}
              onChange={(e) => setData({ ...data, country: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Sector</label>
            <input type="text" className="form-input" value={data.sector}
              onChange={(e) => setData({ ...data, sector: e.target.value })} />
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Core Solution Statement</label>
            <textarea className="form-textarea" rows="2" value={data.solution}
              onChange={(e) => setData({ ...data, solution: e.target.value })} />
          </div>
        </div>

        <div className="passport-chips-section">
          {[
            { field: 'capabilities', label: 'Core Capabilities (What you bring)', cls: 'chip-blue', val: newCap, setter: setNewCap, ph: '+ Add capability...' },
            { field: 'needs', label: 'Operational Needs (What you seek)', cls: 'chip-purple', val: newNeed, setter: setNewNeed, ph: '+ Add partner need...' },
            { field: 'target_markets', label: 'Target Markets', cls: 'chip-teal', val: newMarket, setter: setNewMarket, ph: '+ Add target market...' },
            { field: 'partnership_goals', label: 'Partnership Goals', cls: 'chip-orange', val: newGoal, setter: setNewGoal, ph: '+ Add goal...' },
          ].map(({ field, label, cls, val, setter, ph }) => (
            <div key={field} className="chip-editor-group">
              <label className="chip-group-label">{label}</label>
              <div className="chip-list">
                {(data[field] || []).map((c, i) => (
                  <span key={i} className={`chip ${cls}`}>
                    {c}
                    <button type="button" onClick={() => handleRemoveChip(field, i)}>✕</button>
                  </span>
                ))}
              </div>
              <div className="chip-add-row">
                <input type="text" placeholder={ph} value={val} onChange={(e) => setter(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddChip(field, val, setter)} />
                <button type="button" onClick={() => handleAddChip(field, val, setter)}>Add</button>
              </div>
            </div>
          ))}
        </div>

        <div className="passport-footer">
          <button className="btn btn-ghost" onClick={onBack}>← Upload Different Files</button>
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

function MatchesStep({ profile, onSelectPartner, onEditPassport }) {
  const [matches, setMatches] = useState(null)
  const [error, setError] = useState(null)
  const [graphData, setGraphData] = useState(null)

  useEffect(() => {
    getMatches(profile).then((d) => setMatches(d.matches || d)).catch((e) => setError(e.message))
    getGraph().then(setGraphData).catch((e) => console.warn('Graph error:', e))
  }, [profile])

  return (
    <div className="step-content">
      <div className="profile-mini-bar">
        <div>
          <span className="mini-company">{profile.company_name}</span>
          <span className="mini-sub">
            📍 {profile.country} &bull; Sector: {profile.sector} &bull; Target: {profile.target_markets.slice(0, 2).join(', ')}
          </span>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={onEditPassport}>✏️ Edit Passport</button>
      </div>

      <div className="matches-header">
        <div>
          <div className="section-title">Top 3 ASEAN Partner Recommendations</div>
          <div className="section-sub">Ranked via deterministic 30/30/20/20 weighted matching. Choose which partner to generate a 30-day POC plan for.</div>
        </div>
      </div>

      {error && <div className="error-toast">⚠️ {error}</div>}

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
                {m.opportunity && <div className="match-opportunity">{m.opportunity}</div>}
                <button className="btn btn-primary btn-full" onClick={() => onSelectPartner(m)}>
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
              <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div className="skeleton" style={{ height: 16, width: '70%' }} />
                <div className="skeleton" style={{ height: 12, width: '40%' }} />
                <div style={{ height: 8 }} />
                <div className="skeleton" style={{ height: 12 }} />
                <div className="skeleton" style={{ height: 12, width: '85%' }} />
                <div style={{ height: 8 }} />
                <div className="skeleton" style={{ height: 36, borderRadius: 8 }} />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="card" style={{ padding: '0.25rem', overflow: 'hidden', marginTop: '0.5rem' }}>
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
   DASH CARD — Collapsible + Editable card for Step 4
───────────────────────────────────────────────────────────────*/
function DashCard({ icon, title, children, className = '', defaultOpen = true, editMode = false, onEdit, onDone }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className={`dash-card ${className}`}>
      <div className="dash-card-header" onClick={() => setOpen((v) => !v)}>
        <div className="dch-left">
          <span className="dch-icon">{icon}</span>
          <span className="dch-title">{title}</span>
        </div>
        <div className="dch-right" onClick={(e) => e.stopPropagation()}>
          {onEdit && !editMode && (
            <button className="dch-edit-btn" onClick={onEdit}>✏️ Edit</button>
          )}
          {editMode && (
            <button className="dch-edit-btn active" onClick={onDone}>✓ Done</button>
          )}
          <button className="dch-collapse-btn" onClick={(e) => { e.stopPropagation(); setOpen((v) => !v) }}>
            {open ? '▲' : '▼'}
          </button>
        </div>
      </div>
      <div className={`dash-card-body ${open ? '' : 'collapsed'}`}>
        {children}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   STEP 4: BRIEF DASHBOARD — Redesigned
   Export / Copy / Download / Share / Edit cards / Resize layout
───────────────────────────────────────────────────────────────*/
const WEEK_CLR = ['#7c3aed', '#2563eb', '#0d9488', '#16a34a']

function BriefStep({ profile, partner, onBackToMatches, onReset }) {
  const [brief, setBrief] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  // Editable brief state
  const [editedBrief, setEditedBrief] = useState(null)
  // Per-card edit mode
  const [editingCard, setEditingCard] = useState(null)
  // Layout: 'two-col' | 'single'
  const [layout, setLayout] = useState('two-col')
  // New metric input
  const [newMetric, setNewMetric] = useState('')

  const { toasts, show: showToast } = useToast()

  useConfetti()

  useEffect(() => {
    setLoading(true); setError(null)
    getBrief(profile, partner.partner_id || partner.id || partner.name)
      .then((b) => { setBrief(b); setEditedBrief({ ...b }); setLoading(false) })
      .catch((e) => { setError(e.message); setLoading(false) })
  }, [profile, partner])

  // ── Helpers ────────────────────────────────────────────────
  const eb = editedBrief || {}

  const buildText = () => [
    `PARTNERSHIP ACTION BRIEF: ${profile.company_name} × ${partner.partner_name || partner.name}\n`,
    `Outcome Model: Cross-Border Municipal POC & Pilot\n\n`,
    `OBJECTIVE:\n${eb.objective || ''}\n\n`,
    `COLLABORATION CONCEPT:\n${eb.collaboration_concept || eb.collaborationConcept || ''}\n\n`,
    `PROPOSED 30-DAY PROOF OF CONCEPT:\n${eb.proposed_poc || eb.proposedPoc || ''}\n\n`,
    `PILOT TIMELINE:\n${(eb.timeline || []).map((t, i) => `${i + 1}. ${typeof t === 'string' ? t : t.task}`).join('\n')}\n\n`,
    `SUCCESS METRICS:\n${(eb.success_metrics || eb.successMetrics || []).map((m) => `• ${typeof m === 'string' ? m : m.metric}`).join('\n')}\n\n`,
    `Generated by PACT with Gemma 4 (open-weight AI). All records illustrative.`,
  ].join('')

  const buildMarkdown = () => [
    `# Partnership Action Brief: ${profile.company_name} × ${partner.partner_name || partner.name}\n`,
    `> **Generated by PACT (Partnership Action & Collaboration Toolkit)**  \n`,
    `> Powered by Gemma 4 (gemma-4-26b-a4b-it) · All data illustrative\n\n`,
    `## 1. Strategic Objective\n${eb.objective || ''}\n\n`,
    `## 2. Collaboration Concept\n${eb.collaboration_concept || eb.collaborationConcept || ''}\n\n`,
    `## 3. Proposed 30-Day Proof of Concept\n${eb.proposed_poc || eb.proposedPoc || ''}\n\n`,
    `## 4. 30-Day Implementation Timeline\n`,
    ...(eb.timeline || []).map((t, i) => `- **Week ${i + 1}:** ${typeof t === 'string' ? t : t.task}\n`),
    `\n## 5. Measurable Success Metrics\n`,
    ...(eb.success_metrics || eb.successMetrics || []).map((m) => `- [ ] ${typeof m === 'string' ? m : m.metric}\n`),
    `\n---\n*PACT Hackathon Demo · MLH Hacktoberfest KL 2026*`,
  ].join('')

  const handleCopy = () => {
    navigator.clipboard?.writeText(buildText()).then(() => showToast('📋 Brief copied to clipboard!', 'success'))
      .catch(() => showToast('Copy failed — try Download instead', 'info'))
  }

  const handleDownloadMd = () => {
    const blob = new Blob([buildMarkdown()], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `PACT_Brief_${profile.company_name}_x_${(partner.partner_name || 'partner').replace(/\s+/g, '_')}.md`
    a.click()
    URL.revokeObjectURL(url)
    showToast('💾 Markdown brief downloaded!', 'success')
  }

  const handleDownloadTxt = () => {
    const blob = new Blob([buildText()], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `PACT_Brief_${profile.company_name}.txt`
    a.click()
    URL.revokeObjectURL(url)
    showToast('📄 Text brief downloaded!', 'success')
  }

  const handleExportJSON = () => {
    const payload = {
      generated_at: new Date().toISOString(),
      startup: profile,
      partner: { id: partner.partner_id, name: partner.partner_name || partner.name, country: partner.country, score: partner.score },
      brief: editedBrief,
      disclaimer: 'All records are illustrative for demo purposes.',
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `PACT_Export_${profile.company_name}.json`; a.click()
    URL.revokeObjectURL(url)
    showToast('📦 JSON exported!', 'success')
  }

  const handleShare = async () => {
    const shareData = {
      title: `PACT Brief: ${profile.company_name} × ${partner.partner_name || partner.name}`,
      text: `Check out this AI-generated ASEAN partnership brief via PACT!\n\nObjective: ${eb.objective || ''}`,
      url: window.location.href,
    }
    if (navigator.share) {
      try { await navigator.share(shareData); showToast('Shared successfully!', 'success') }
      catch { /* user cancelled */ }
    } else {
      await navigator.clipboard?.writeText(`${shareData.title}\n\n${shareData.text}`)
      showToast('🔗 Share link copied to clipboard!', 'info')
    }
  }

  // Timeline item edit
  const updateTimeline = (idx, val) => {
    const tl = [...(eb.timeline || [])]
    tl[idx] = val
    setEditedBrief((b) => ({ ...b, timeline: tl }))
  }

  // Metric edit / add / remove
  const updateMetric = (idx, val) => {
    const m = [...(eb.success_metrics || eb.successMetrics || [])]
    m[idx] = val
    setEditedBrief((b) => ({ ...b, success_metrics: m, successMetrics: m }))
  }
  const removeMetric = (idx) => {
    const m = (eb.success_metrics || eb.successMetrics || []).filter((_, i) => i !== idx)
    setEditedBrief((b) => ({ ...b, success_metrics: m, successMetrics: m }))
  }
  const addMetric = () => {
    if (!newMetric.trim()) return
    const m = [...(eb.success_metrics || eb.successMetrics || []), newMetric.trim()]
    setEditedBrief((b) => ({ ...b, success_metrics: m, successMetrics: m }))
    setNewMetric('')
  }

  // ── Loading ───────────────────────────────────────────────
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
      <div className="dash-card" style={{ padding: '2rem', textAlign: 'center' }}>
        <div className="error-toast" style={{ marginBottom: '1.5rem' }}>⚠️ {error}</div>
        <button className="btn btn-primary" onClick={onBackToMatches}>← Return to Partner Matches</button>
      </div>
    )
  }

  return (
    <div className="brief-dashboard">
      {/* ── Dashboard Header Strip ── */}
      <div className="brief-dash-header">
        <div className="bdh-top">
          <div>
            <div className="bdh-badges">
              <span className="bdh-badge bdh-badge-success">🎉 Match Converted to Action Plan</span>
              <span className="bdh-badge bdh-badge-type">Municipal Pilot Agreement</span>
              <span className="bdh-badge bdh-badge-type">illustrative</span>
            </div>
            <div className="bdh-title">
              {profile.company_name}
              <span className="bdh-title-x">×</span>
              {partner.partner_name || partner.name}
            </div>
            <div className="bdh-sub">📍 {partner.country} &bull; Powered by Gemma 4 (gemma-4-26b-a4b-it)</div>
            <div className="bdh-score-pill">
              Compatibility Score &nbsp;<span className="bdh-score-num">{partner.score}</span>&nbsp;/ 100
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="bdh-actions">
            {/* Layout toggle */}
            <div className="layout-toggle">
              <button className={`layout-btn ${layout === 'two-col' ? 'active' : ''}`}
                title="2-column layout" onClick={() => setLayout('two-col')}>⊞</button>
              <button className={`layout-btn ${layout === 'single' ? 'active' : ''}`}
                title="Single column layout" onClick={() => setLayout('single')}>☰</button>
            </div>

            <div className="dash-divider" />

            <button className="btn-dash" onClick={handleCopy} title="Copy brief as text">
              📋 Copy
            </button>
            <button className="btn-dash btn-dash-primary" onClick={handleDownloadMd} title="Download Markdown">
              💾 .md
            </button>
            <button className="btn-dash" onClick={handleDownloadTxt} title="Download as .txt">
              📄 .txt
            </button>
            <button className="btn-dash btn-dash-export" onClick={handleExportJSON} title="Export as JSON">
              📦 Export JSON
            </button>
            <button className="btn-dash btn-dash-share" onClick={handleShare} title="Share brief">
              🔗 Share
            </button>

            <div className="dash-divider" />

            <button className="btn-dash" onClick={onBackToMatches}>🤝 Switch Partner</button>
            <button className="btn-dash" onClick={onReset}>🔄 New Analysis</button>
          </div>
        </div>
      </div>

      {/* ── Dashboard Cards Grid ── */}
      <div className={`dash-grid ${layout === 'single' ? 'dash-grid-single-col' : ''}`}
        style={layout === 'single' ? { gridTemplateColumns: '1fr' } : {}}>

        {/* Card 1 — Strategic Objective (full width) */}
        <DashCard icon="🎯" title="Strategic Objective" className="dash-grid-full"
          editMode={editingCard === 'objective'}
          onEdit={() => setEditingCard('objective')}
          onDone={() => setEditingCard(null)}>
          <div className="brief-objective-block">
            <div className="brief-label">Objective</div>
            {editingCard === 'objective' ? (
              <textarea
                className="brief-objective-text"
                style={{ minHeight: 80 }}
                value={eb.objective || ''}
                onChange={(e) => setEditedBrief((b) => ({ ...b, objective: e.target.value }))}
              />
            ) : (
              <div className="brief-objective-text">{eb.objective}</div>
            )}
          </div>
        </DashCard>

        {/* Card 2 — Collaboration Concept */}
        <DashCard icon="🤝" title="Collaboration Concept"
          editMode={editingCard === 'collab'}
          onEdit={() => setEditingCard('collab')}
          onDone={() => setEditingCard(null)}>
          {editingCard === 'collab' ? (
            <textarea className="editable-text" rows={6}
              value={eb.collaboration_concept || eb.collaborationConcept || ''}
              onChange={(e) => setEditedBrief((b) => ({ ...b, collaboration_concept: e.target.value, collaborationConcept: e.target.value }))}
            />
          ) : (
            <div className="brief-text">{eb.collaboration_concept || eb.collaborationConcept}</div>
          )}
        </DashCard>

        {/* Card 3 — Proof of Concept */}
        <DashCard icon="🧪" title="Proposed Proof of Concept"
          editMode={editingCard === 'poc'}
          onEdit={() => setEditingCard('poc')}
          onDone={() => setEditingCard(null)}>
          {editingCard === 'poc' ? (
            <div className="poc-block">
              <textarea rows={5}
                value={eb.proposed_poc || eb.proposedPoc || ''}
                onChange={(e) => setEditedBrief((b) => ({ ...b, proposed_poc: e.target.value, proposedPoc: e.target.value }))}
              />
            </div>
          ) : (
            <div className="poc-block">{eb.proposed_poc || eb.proposedPoc}</div>
          )}
        </DashCard>

        {/* Card 4 — 30-Day Timeline (full width) */}
        <DashCard icon="📅" title="30-Day Implementation Timeline" className="dash-grid-full"
          editMode={editingCard === 'timeline'}
          onEdit={() => setEditingCard('timeline')}
          onDone={() => setEditingCard(null)}>
          <div className="timeline-stepper">
            {(eb.timeline || []).map((item, i) => {
              const text = typeof item === 'string' ? item : item.task || JSON.stringify(item)
              return (
                <div key={i} className="tl-step">
                  <div className="tl-dot" style={{ background: WEEK_CLR[i % 4] }}>{i + 1}</div>
                  {i < (eb.timeline || []).length - 1 && <div className="tl-connector" />}
                  <div className={`tl-text ${editingCard === 'timeline' ? 'is-editing' : ''}`}>
                    {editingCard === 'timeline' ? (
                      <textarea rows={3} value={text} onChange={(e) => updateTimeline(i, e.target.value)} />
                    ) : text}
                  </div>
                </div>
              )
            })}
          </div>
        </DashCard>

        {/* Card 5 — Success Metrics */}
        <DashCard icon="📊" title="Measurable Success Metrics" className="dash-grid-full"
          editMode={editingCard === 'metrics'}
          onEdit={() => setEditingCard('metrics')}
          onDone={() => setEditingCard(null)}>
          <div className="metrics-chips">
            {(eb.success_metrics || eb.successMetrics || []).map((m, i) => {
              const text = typeof m === 'string' ? m : m.metric || JSON.stringify(m)
              return (
                <div key={i} className={`metric-chip ${editingCard === 'metrics' ? 'is-editing' : ''}`}>
                  <span className="metric-check">✓</span>
                  {editingCard === 'metrics' ? (
                    <>
                      <textarea rows={1} value={text} onChange={(e) => updateMetric(i, e.target.value)} />
                      <button onClick={() => removeMetric(i)}
                        style={{ background: 'transparent', border: 'none', color: '#dc2626', fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>
                        ✕
                      </button>
                    </>
                  ) : text}
                </div>
              )
            })}
            {editingCard === 'metrics' && (
              <div className="metric-add-row">
                <input type="text" placeholder="+ Add success metric…"
                  value={newMetric} onChange={(e) => setNewMetric(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addMetric()} />
                <button onClick={addMetric}>Add</button>
              </div>
            )}
          </div>
        </DashCard>
      </div>

      {/* ── Dashboard Footer ── */}
      <div className="brief-footer">
        <div className="brief-disclaimer">
          ⚠️ All generated outcomes and partner records are <strong>illustrative</strong> for demonstration purposes.
          Powered by Gemma 4 · Open source, MIT Licence.
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button className="btn btn-ghost btn-sm" onClick={handleCopy}>📋 Copy Brief</button>
          <button className="btn btn-ghost btn-sm" onClick={handleDownloadMd}>💾 Download .md</button>
          <button className="btn btn-primary btn-sm" onClick={onReset}>🔄 Start New Analysis</button>
        </div>
      </div>

      <ToastContainer toasts={toasts} />
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

  const handleUploadDone = (p) => { setProfile(p); setStep(2) }
  const handlePassportConfirmed = (p) => { setProfile(p); setStep(3) }
  const handlePartnerSelected = (partner) => { setSelectedPartner(partner); setStep(4) }
  const handleReset = () => { setStep(1); setProfile(null); setSelectedPartner(null) }

  return (
    <>
      {/* ── Top Navigation Bar ── */}
      <nav className="nav">
        <div className="nav-inner">
          <div className="nav-brand">
            <span className="nav-logo">PACT</span>
            <span className="nav-tagline">Partnership Action &amp; Collaboration Toolkit</span>
          </div>
          <StepIndicator current={step} onNavigate={(s) => s < step && setStep(s)} />
          <div className="nav-gemma">✦ Gemma 4</div>
        </div>
      </nav>

      {/* ── Main Content Area ── */}
      <main className="main">
        {step === 1 && (
          <>
            {/* Hero Banner — SaaS style with 3-metric bar */}
            <div className="hero-banner">
              <div className="hero-eyebrow">✦ MLH Hacktoberfest KL 2026 &bull; Best Use of Gemma 4</div>
              <h1 className="hero-title">
                Cross-Border Expansion is Chaotic.<br />
                <span className="hero-gradient">We Automated the POC.</span>
              </h1>
              <p className="hero-sub">
                Upload your pitch deck or brochure &bull; Gemma 4 builds your Startup Passport &bull;
                Discover cross-border partner matches &bull; Generate an executable 30-day POC plan.
              </p>

              {/* 3-Metric Stats Bar (from reference design) */}
              <div className="hero-stats">
                <div className="hero-stat">
                  <div className="stat-number">30</div>
                  <div className="stat-label">Days to executable cross-border POC</div>
                </div>
                <div className="hero-stat">
                  <div className="stat-number">100%</div>
                  <div className="stat-label">Deterministic, transparent matching</div>
                </div>
                <div className="hero-stat">
                  <div className="stat-number">12+</div>
                  <div className="stat-label">ASEAN ecosystem hubs mapped</div>
                </div>
              </div>

              <div className="hero-badges">
                <span className="hero-badge">🤖 Gemma 4 Multimodal Vision</span>
                <span className="hero-badge">🌏 ASEAN Ecosystem Network</span>
                <span className="hero-badge">⚖️ 30/30/20/20 Weighted Match</span>
                <span className="hero-badge">📋 Editable 30-Day Action Plans</span>
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
          <PassportStep profile={profile} onSave={handlePassportConfirmed} onBack={() => setStep(1)} />
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
