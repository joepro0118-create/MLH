// frontend/src/App.jsx — PACT UI (purple/violet SaaS theme, UICheatSheet Rule of 3)
// Hero: Glow-pulse upload zone  |  Micro: Shimmer skeletons  |  Delight: Confetti on brief
import { useState, useEffect, useRef, useCallback } from 'react'
import { analyzePitch, getMatches, getGraph, getBrief } from './api.js'
import { EcosystemGraph } from './components/EcosystemGraph.jsx'
import './index.css'

/* ─────────────────────────────────────────────────────────────
   DEMO DATA
───────────────────────────────────────────────────────────────*/
const DEMO_PROFILE = {
  company_name: 'SmartTONG',
  country: 'Malaysia',
  sector: 'smart-city',
  solution: 'IoT-enabled smart bins that optimise municipal waste collection routes in real time.',
  capabilities: ['iot-sensors', 'route-optimisation', 'real-time-dashboard', 'waste-analytics'],
  needs: ['municipal-pilot', 'government-procurement', 'local-distribution-network'],
  target_markets: ['Vietnam', 'Ho Chi Minh City', 'Hanoi'],
  partnership_goals: ['pilot', 'distribution', 'market-access'],
}

/* ─────────────────────────────────────────────────────────────
   DELIGHT — canvas confetti, no library needed
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

    const COLORS = ['#7c3aed', '#a78bfa', '#c4b5fd', '#fbbf24', '#34d399', '#60a5fa', '#f472b6', '#ffffff']
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
   SCORE RING — animated SVG circle
───────────────────────────────────────────────────────────────*/
function ScoreRing({ score, size = 72 }) {
  const r = size * 0.39, cx = size / 2, cy = size / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const color = score >= 70 ? '#16a34a' : score >= 40 ? '#d97706' : '#dc2626'
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
        fontSize={size * 0.19} fontWeight="700" fill={color}>{score}</text>
    </svg>
  )
}

/* ─────────────────────────────────────────────────────────────
   SPOTLIGHT CARD — radial glow follows mouse
───────────────────────────────────────────────────────────────*/
function SpotlightCard({ children, className = '' }) {
  const ref = useRef(null)
  const onMove = (e) => {
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
   MICRO — shimmer skeleton for 3 match cards
───────────────────────────────────────────────────────────────*/
function SkeletonMatches() {
  return (
    <div className="matches-grid">
      {[0, 1, 2].map((i) => (
        <div key={i} className="skeleton-card">
          <div className="skeleton" style={{ height: 4, borderRadius: '4px 4px 0 0', marginBottom: '1.25rem' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div className="skeleton skeleton-circle" style={{ width: 72, height: 72, borderRadius: '50%' }} />
            <div style={{ flex: 1 }}>
              <div className="skeleton" style={{ height: 16, width: '75%', marginBottom: 8 }} />
              <div className="skeleton" style={{ height: 12, width: '40%' }} />
            </div>
          </div>
          <div className="skeleton" style={{ height: 11, marginBottom: 7 }} />
          <div className="skeleton" style={{ height: 11, width: '85%', marginBottom: 7 }} />
          <div className="skeleton" style={{ height: 11, width: '60%', marginBottom: '1.5rem' }} />
          <div className="skeleton" style={{ height: 40, borderRadius: 8 }} />
        </div>
      ))}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   STEP INDICATOR
───────────────────────────────────────────────────────────────*/
const STEPS = [
  { label: 'Upload', icon: '🖼️' },
  { label: 'Matches', icon: '🤝' },
  { label: 'Network', icon: '🌐' },
  { label: 'Brief', icon: '📄' },
]

function StepIndicator({ current }) {
  return (
    <div className="steps">
      {STEPS.map((s, i) => {
        const n = i + 1
        const done = n < current
        const active = n === current
        return (
          <div key={s.label} className="step-item-wrap">
            <div className={`step-item ${done ? 'done' : ''} ${active ? 'active' : ''}`}>
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
   STEP 1 — UPLOAD
───────────────────────────────────────────────────────────────*/
function UploadStep({ onProfile }) {
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const inputRef = useRef(null)

  const handleFile = useCallback(async (file) => {
    if (!file) return
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setError('Please upload a PNG, JPG, or WEBP image.')
      return
    }
    if (file.size > 5 * 1024 * 1024) { setError('Image must be under 5 MB.'); return }
    setError(null); setLoading(true)
    try { onProfile(await analyzePitch(file)) }
    catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [onProfile])

  if (loading) return (
    <div className="gemma-loading">
      <div className="gemma-spinner">
        <div className="g-ring" />
        <div className="g-ring r2" />
        <div className="g-ring r3" />
      </div>
      <div className="gemma-loading-title">Gemma 4 is reading your pitch deck…</div>
      <div className="gemma-loading-sub">Extracting startup profile via multimodal AI</div>
    </div>
  )

  return (
    <div className="upload-wrap">
      <div
        className={`upload-zone ${dragging ? 'drag-over' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }}
      >
        <div className="upload-icon-bg">🖼️</div>
        <div className="upload-label">Drop your pitch deck image here</div>
        <div className="upload-hint">PNG · JPG · WEBP · max 5 MB</div>
        <div className="upload-browse-pill">Click to browse files</div>
        <input ref={inputRef} type="file" accept="image/*" className="upload-input"
          onChange={(e) => handleFile(e.target.files[0])} />
      </div>

      <div className="or-divider"><span>or skip to demo</span></div>

      <button className="btn btn-demo" onClick={() => onProfile(DEMO_PROFILE)}>
        <span>🚀</span>
        <span>Use Demo — SmartTONG (Malaysia → Vietnam)</span>
      </button>

      {error && <div className="error-toast">⚠️ {error}</div>}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   PROFILE CARD
───────────────────────────────────────────────────────────────*/
const TAG_COLORS = {
  capabilities: 'tag-blue',
  needs: 'tag-purple',
  target_markets: 'tag-teal',
  partnership_goals: 'tag-orange',
}

function ProfileCard({ profile }) {
  const groups = [
    { key: 'capabilities',     label: 'Capabilities',    values: profile.capabilities },
    { key: 'needs',            label: 'Needs',            values: profile.needs },
    { key: 'target_markets',   label: 'Target Markets',   values: profile.target_markets },
    { key: 'partnership_goals',label: 'Goals',            values: profile.partnership_goals },
  ]
  return (
    <div className="profile-card">
      <div className="profile-header">
        <div className="profile-avatar">{profile.company_name[0]}</div>
        <div className="profile-header-text">
          <div className="profile-name">{profile.company_name}</div>
          <div className="profile-meta">
            <span>📍 {profile.country}</span>
            <span className="sector-chip">{profile.sector}</span>
          </div>
        </div>
        <div className="profile-gemma-badge">via Gemma 4</div>
      </div>
      <div className="profile-solution">"{profile.solution}"</div>
      <div className="profile-tags-grid">
        {groups.map(({ key, label, values }) => (
          <div key={key} className="profile-tag-group">
            <div className="tag-group-label">{label}</div>
            <div className="tag-list">
              {values.map((v) => <span key={v} className={`tag ${TAG_COLORS[key]}`}>{v}</span>)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   MATCH CARD
───────────────────────────────────────────────────────────────*/
const RANK_ACCENT = ['#7c3aed', '#0d9488', '#d97706']
const RANK_LABEL  = ['#1 Best Match', '#2 Strong Match', '#3 Good Match']

function MatchCard({ match, onSelect, rank }) {
  return (
    <SpotlightCard className="match-card">
      <div className="match-stripe" style={{ background: RANK_ACCENT[rank] }}>
        <span className="match-rank">{RANK_LABEL[rank]}</span>
        <span className="match-illustrative">illustrative</span>
      </div>
      <div className="match-body">
        <div className="match-top">
          <div className="match-info">
            <div className="match-name">{match.partner_name || match.name}</div>
            <div className="match-country">📍 {match.country}</div>
          </div>
          <ScoreRing score={match.score} />
        </div>

        <div className="match-reasons">
          <div className="match-section-label">Why it fits</div>
          <ul>
            {(match.reasons || []).map((r, i) => (
              <li key={i}><span className="reason-star">✦</span>{r}</li>
            ))}
          </ul>
        </div>

        {match.opportunity && (
          <div className="match-opportunity">{match.opportunity}</div>
        )}

        <button className="btn btn-primary btn-full" onClick={() => onSelect(match)}>
          Generate Partnership Brief →
        </button>
      </div>
    </SpotlightCard>
  )
}

/* ─────────────────────────────────────────────────────────────
   STEP 2 — PROFILE + MATCHES
───────────────────────────────────────────────────────────────*/
function MatchesStep({ profile, onSelectPartner }) {
  const [matches, setMatches] = useState(null)
  const [error, setError]     = useState(null)

  useEffect(() => {
    getMatches(profile)
      .then((d) => setMatches(d.matches || d))
      .catch((e) => setError(e.message))
  }, [profile])

  return (
    <div className="step-content">
      <ProfileCard profile={profile} />
      <div className="matches-header">
        <div>
          <div className="section-title">Partner Matches</div>
          <div className="section-sub">
            Scored across industry · capabilities · target markets · goals
          </div>
        </div>
      </div>
      {!matches && !error && <SkeletonMatches />}
      {error && <div className="error-toast">⚠️ {error}</div>}
      {matches && (
        <div className="matches-grid">
          {matches.map((m, i) => (
            <MatchCard key={m.partner_id || i} match={m} onSelect={onSelectPartner} rank={i} />
          ))}
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   NETWORK GRAPH — dark card, glowing SVG nodes
───────────────────────────────────────────────────────────────*/
const NODE_COLOR = {
  programme:    '#a78bfa',
  organisation: '#2dd4bf',
  organization: '#2dd4bf',
  startup:      '#fb923c',
  default:      '#94a3b8',
}

function NetworkGraph({ nodes, edges, highlightId }) {
  const W = 720, H = 400, R = 158, CX = W / 2, CY = H / 2

  const pos = nodes.map((n, i) => {
    const a = (2 * Math.PI * i) / nodes.length - Math.PI / 2
    return { ...n, x: CX + R * Math.cos(a), y: CY + R * Math.sin(a) }
  })
  const byId = Object.fromEntries(pos.map((n) => [n.id, n]))

  return (
    <div className="graph-svg-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} xmlns="http://www.w3.org/2000/svg">
        <defs>
          {pos.map((n) => (
            <radialGradient key={`g-${n.id}`} id={`g-${n.id}`}>
              <stop offset="0%" stopColor={NODE_COLOR[n.type] || NODE_COLOR.default} stopOpacity="0.7" />
              <stop offset="100%" stopColor={NODE_COLOR[n.type] || NODE_COLOR.default} stopOpacity="0" />
            </radialGradient>
          ))}
        </defs>

        {/* Edges */}
        {edges.map((e, i) => {
          const s = byId[e.source], t = byId[e.target]
          if (!s || !t) return null
          return (
            <line key={i} x1={s.x} y1={s.y} x2={t.x} y2={t.y}
              stroke="#a78bfa" strokeWidth={1.2}
              strokeOpacity={0.1 + (e.weight || 0.5) * 0.35} />
          )
        })}

        {/* Nodes */}
        {pos.map((n) => {
          const hl = n.id === highlightId
          const col = NODE_COLOR[n.type] || NODE_COLOR.default
          return (
            <g key={n.id}>
              {/* Glow halo */}
              <circle cx={n.x} cy={n.y} r={hl ? 34 : 18}
                fill={`url(#g-${n.id})`} opacity={hl ? 0.9 : 0.5} />
              {/* Pulse on highlighted node */}
              {hl && (
                <circle cx={n.x} cy={n.y} r={20} fill="none" stroke={col} strokeWidth={2} opacity={0.7}>
                  <animate attributeName="r" values="16;28;16" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.7;0;0.7" dur="2s" repeatCount="indefinite" />
                </circle>
              )}
              <circle cx={n.x} cy={n.y} r={hl ? 13 : 8}
                fill={col} stroke={hl ? '#fff' : 'none'} strokeWidth={hl ? 2.5 : 0} />
              <text x={n.x} y={n.y + (hl ? 28 : 21)}
                textAnchor="middle" fontSize={hl ? 10 : 8.5}
                fontWeight={hl ? 700 : 400}
                fill={hl ? '#e2e8f0' : '#64748b'}>
                {(n.label || n.id).slice(0, 18)}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   STEP 3 — GRAPH + BRIEF GENERATION
───────────────────────────────────────────────────────────────*/
function GraphStep({ profile, partner, onBrief }) {
  const [graph, setGraph]     = useState(null)
  const [graphErr, setGErr]   = useState(null)
  const [briefing, setBrief]  = useState(true)
  const [briefErr, setBErr]   = useState(null)

  useEffect(() => {
    getGraph().then(setGraph).catch((e) => setGErr(e.message))
    getBrief(profile, partner.partner_id || partner.id || partner.name)
      .then((b) => { setBrief(false); onBrief(b) })
      .catch((e) => { setBrief(false); setBErr(e.message) })
  }, []) // eslint-disable-line

  return (
    <div className="step-content">
      {/* Selected partner summary */}
      <div className="selected-card">
        <div className="selected-label">Selected Partner</div>
        <div className="selected-row">
          <div className="selected-avatar">{(partner.partner_name || partner.name || '?')[0]}</div>
          <div>
            <div className="selected-name">{partner.partner_name || partner.name}</div>
            <div className="selected-country">📍 {partner.country}</div>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <ScoreRing score={partner.score} size={64} />
          </div>
        </div>
      </div>

      {/* Network graph */}
      <div className="card" style={{ padding: '0.25rem', overflow: 'hidden' }}>
        <EcosystemGraph
          startup={profile}
          highlightIds={[partner.partner_id || partner.id]}
          nodes={graph?.nodes}
          edges={graph?.edges}
        />
      </div>

      {/* Brief generation */}
      {briefing && (
        <div className="brief-generating">
          <div className="gemma-spinner sm">
            <div className="g-ring" /><div className="g-ring r2" />
          </div>
          <div>
            <div className="bgen-title">Gemma 4 is generating your brief…</div>
            <div className="bgen-sub">Crafting a 30-day partnership POC plan with thinking mode</div>
          </div>
        </div>
      )}
      {briefErr && <div className="error-toast">⚠️ {briefErr}</div>}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   STEP 4 — PARTNERSHIP BRIEF  (confetti on mount 🎉)
───────────────────────────────────────────────────────────────*/
const WEEK_CLR = ['#7c3aed', '#2563eb', '#0d9488', '#16a34a']

function BriefStep({ brief, onReset }) {
  useConfetti()

  const obj      = brief.objective
  const concept  = brief.collaboration_concept || brief.collaborationConcept
  const poc      = brief.proposed_poc || brief.proposedPoc
  const timeline = brief.timeline || []
  const metrics  = brief.success_metrics || brief.successMetrics || []

  const copyBrief = () => {
    const t = [
      'PARTNERSHIP BRIEF — Generated by PACT × Gemma 4\n',
      `Objective:\n${obj}\n`,
      `\nCollaboration Concept:\n${concept}\n`,
      `\nProposed POC:\n${poc}\n`,
      `\n30-Day Timeline:\n${timeline.map((t, i) => `${i + 1}. ${t}`).join('\n')}\n`,
      `\nSuccess Metrics:\n${metrics.map((m) => `• ${m}`).join('\n')}`,
      '\n\n⚠️ All content is illustrative and AI-generated for demo purposes.',
    ].join('')
    navigator.clipboard?.writeText(t).catch(() => {})
    alert('✅ Brief copied to clipboard!')
  }

  return (
    <div className="brief-card">
      {/* Header */}
      <div className="brief-header">
        <div>
          <div className="brief-success">🎉 Partnership Brief Ready</div>
          <div className="brief-title">30-Day POC Plan</div>
        </div>
        <div className="brief-actions">
          <button className="btn btn-ghost" onClick={copyBrief}>📋 Copy</button>
          <button className="btn btn-ghost" onClick={onReset}>↩ Start Over</button>
        </div>
      </div>

      {/* Objective — hero block */}
      <div className="brief-objective-block">
        <div className="brief-label">Objective</div>
        <div className="brief-objective-text">{obj}</div>
      </div>

      {/* Two-col: concept + POC */}
      <div className="brief-two-col">
        <div className="brief-section">
          <div className="brief-label">Collaboration Concept</div>
          <p className="brief-text">{concept}</p>
        </div>
        <div className="brief-section">
          <div className="brief-label">Proposed Proof of Concept</div>
          <div className="poc-block">{poc}</div>
        </div>
      </div>

      {/* Timeline stepper */}
      {timeline.length > 0 && (
        <div className="brief-section">
          <div className="brief-label">30-Day Pilot Timeline</div>
          <div className="timeline-stepper">
            {timeline.map((item, i) => (
              <div key={i} className="tl-step">
                <div className="tl-dot" style={{ background: WEEK_CLR[i % 4] }}>
                  {i + 1}
                </div>
                {i < timeline.length - 1 && <div className="tl-connector" />}
                <div className="tl-text">
                  {typeof item === 'string' ? item : item.task || JSON.stringify(item)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Success metrics */}
      {metrics.length > 0 && (
        <div className="brief-section">
          <div className="brief-label">Success Metrics</div>
          <div className="metrics-chips">
            {metrics.map((m, i) => (
              <div key={i} className="metric-chip">
                <span className="metric-check">✓</span>
                {typeof m === 'string' ? m : m.metric || JSON.stringify(m)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="brief-footer">
        <div className="brief-disclaimer">
          ⚠️ All content is <strong>illustrative</strong> and AI-generated for demo purposes only.
        </div>
        <button className="btn btn-primary" onClick={onReset}>🔄 Analyse Another Startup</button>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   APP ROOT
───────────────────────────────────────────────────────────────*/
export default function App() {
  const [step, setStep]       = useState(1)
  const [profile, setProfile] = useState(null)
  const [partner, setPartner] = useState(null)
  const [brief, setBrief]     = useState(null)

  const handleProfile = (p) => { setProfile(p); setStep(2) }
  const handlePartner = (m) => { setPartner(m); setStep(3) }
  const handleBrief   = (b) => { setBrief(b);  setStep(4) }
  const handleReset   = () => { setStep(1); setProfile(null); setPartner(null); setBrief(null) }

  return (
    <>
      {/* ── Nav ── */}
      <nav className="nav">
        <div className="nav-inner">
          <div className="nav-brand">
            <span className="nav-logo">PACT</span>
            <span className="nav-tagline">ASEAN Partnership Toolkit</span>
          </div>
          <StepIndicator current={step} />
          <div className="nav-gemma">✦ Gemma 4</div>
        </div>
      </nav>

      {/* ── Main ── */}
      <main className="main">
        {step === 1 && (
          <>
            {/* Hero banner */}
            <div className="hero-banner">
              <div className="hero-eyebrow">MLH Hacktoberfest KL 2026 · Open Source AI</div>
              <h1 className="hero-title">
                From ASEAN Connections<br />
                <span className="hero-gradient">to Real Outcomes</span>
              </h1>
              <p className="hero-sub">
                Upload your pitch deck · Gemma 4 extracts your startup profile ·
                Discover top ASEAN partners · Get a 30-day action plan.
              </p>
              <div className="hero-badges">
                <span className="hero-badge">🤖 Gemma 4 Multimodal</span>
                <span className="hero-badge">🌏 ASEAN Ecosystem</span>
                <span className="hero-badge">⚡ 4-hour Hackathon Build</span>
              </div>
            </div>
            {/* Upload card */}
            <div className="upload-card">
              <UploadStep onProfile={handleProfile} />
            </div>
            {/* Disclaimer inside step 1 */}
            <div className="disclaimer">
              ⚠️ All partner data shown is <strong>illustrative</strong> and for demonstration purposes only.
              No real partnerships are claimed or implied.
            </div>
          </>
        )}

        {step !== 1 && (
          <div className="disclaimer">
            ⚠️ All partner data is <strong>illustrative</strong> — demo purposes only.
          </div>
        )}

        {step === 2 && profile && <MatchesStep profile={profile} onSelectPartner={handlePartner} />}
        {step === 3 && profile && partner && <GraphStep profile={profile} partner={partner} onBrief={handleBrief} />}
        {step === 4 && brief && <BriefStep brief={brief} onReset={handleReset} />}
      </main>

      {/* ── Footer ── */}
      <footer className="footer">
        Powered by <strong>Gemma 4</strong> (open-weight) · Open source, MIT ·
        MLH Hacktoberfest KL 2026 · Team PACT (Yap · Joe · Amn · Yuhang)
      </footer>
    </>
  )
}
