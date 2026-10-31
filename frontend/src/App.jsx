// App.jsx — PACT main application
import { useState, useEffect, useRef, useCallback } from 'react'
import { analyzePitch, getMatches, getGraph, getBrief } from './api.js'

/* ─── Demo data ─────────────────────────────────────────────────── */
const DEMO_PROFILE = {
  company_name:      'SmartTONG',
  country:           'Malaysia',
  sector:            'smart-city',
  solution:          'IoT-enabled smart bins that optimise municipal waste collection routes in real time.',
  capabilities:      ['iot-sensors', 'route-optimisation', 'real-time-dashboard', 'waste-analytics'],
  needs:             ['municipal-pilot', 'government-procurement', 'local-distribution-network'],
  target_markets:    ['Vietnam', 'Ho Chi Minh City', 'Hanoi'],
  partnership_goals: ['pilot', 'distribution', 'market-access'],
}

/* ─── Helpers ───────────────────────────────────────────────────── */
function scoreClass(score) {
  if (score >= 70) return 'score-green'
  if (score >= 40) return 'score-orange'
  return 'score-red'
}

function Spinner({ label = 'Loading…' }) {
  return (
    <div className="spinner-wrap">
      <div className="spinner" />
      <span>{label}</span>
    </div>
  )
}

function ErrorBox({ message }) {
  return <div className="error-box">⚠ {message}</div>
}

/* ─── Step Indicator ─────────────────────────────────────────────── */
const STEP_LABELS = ['Upload', 'Matches', 'Graph', 'Brief']

function StepIndicator({ current }) {
  return (
    <div className="steps">
      {STEP_LABELS.map((label, i) => {
        const num = i + 1
        const state = num < current ? 'done' : num === current ? 'active' : ''
        return (
          <div key={label} style={{ display: 'flex', alignItems: 'center' }}>
            <div className={`step-item ${state}`}>
              <div className="step-dot">{num < current ? '✓' : num}</div>
              {label}
            </div>
            {i < STEP_LABELS.length - 1 && <div className="step-sep" />}
          </div>
        )
      })}
    </div>
  )
}

/* ─── Step 1: Upload ─────────────────────────────────────────────── */
function UploadStep({ onProfile }) {
  const [dragging, setDragging]   = useState(false)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState(null)
  const inputRef                  = useRef(null)

  const handleFile = useCallback(async (file) => {
    if (!file) return
    setError(null)
    setLoading(true)
    try {
      const profile = await analyzePitch(file)
      onProfile(profile)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [onProfile])

  const onDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  if (loading) return <Spinner label="Analysing your pitch deck…" />

  return (
    <div className="upload-wrap">
      <div
        className={`upload-zone ${dragging ? 'drag-over' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        <div className="upload-icon">🖼️</div>
        <div className="upload-label">Drop your pitch deck image here</div>
        <div className="upload-hint">or click to browse · PNG, JPG, WEBP accepted</div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="upload-input"
          onChange={(e) => handleFile(e.target.files[0])}
        />
      </div>

      <div className="or-sep">or</div>

      <button
        className="btn btn-accent"
        onClick={() => onProfile(DEMO_PROFILE)}
      >
        🚀 Use Demo — SmartTONG
      </button>

      {error && <ErrorBox message={error} />}
    </div>
  )
}

/* ─── Startup Profile Card ───────────────────────────────────────── */
function ProfileCard({ profile }) {
  const fields = [
    { label: 'Company',        value: profile.company_name },
    { label: 'Country',        value: profile.country },
    { label: 'Sector',         value: profile.sector },
    { label: 'Solution',       value: profile.solution, wide: true },
    { label: 'Capabilities',   value: profile.capabilities,      tags: true },
    { label: 'Needs',          value: profile.needs,             tags: true },
    { label: 'Target Markets', value: profile.target_markets,    tags: true },
    { label: 'Goals',          value: profile.partnership_goals, tags: true },
  ]

  return (
    <div className="card">
      <div className="card-title">🏢 Startup Profile</div>
      <div className="profile-grid">
        {fields.map(({ label, value, tags, wide }) => (
          <div
            key={label}
            className="profile-field"
            style={wide ? { gridColumn: '1 / -1' } : {}}
          >
            <label>{label}</label>
            {tags ? (
              <div className="tag-list">
                {(Array.isArray(value) ? value : [value]).map((v) => (
                  <span key={v} className="tag">{v}</span>
                ))}
              </div>
            ) : (
              <div className="value">{value}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Match Card ─────────────────────────────────────────────────── */
function MatchCard({ match, onSelect }) {
  return (
    <div className="match-card">
      <div className="match-header">
        <div>
          <div className="match-name">{match.name || match.partner_name}</div>
          <div className="match-country">{match.country}</div>
        </div>
        <span className={`score-badge ${scoreClass(match.score)}`}>
          {match.score}
        </span>
      </div>

      <div>
        <div className="match-section-label">Why it fits</div>
        <ul className="reason-list">
          {(match.reasons || []).map((r, i) => <li key={i}>{r}</li>)}
        </ul>
      </div>

      {match.opportunity && (
        <div>
          <div className="match-section-label">Opportunity</div>
          <div className="opportunity-text">{match.opportunity}</div>
        </div>
      )}

      <button className="btn btn-primary btn-full" onClick={() => onSelect(match)}>
        Select Partner →
      </button>
    </div>
  )
}

/* ─── Step 2: Profile + Matches ──────────────────────────────────── */
function MatchesStep({ profile, onSelectPartner }) {
  const [matches, setMatches] = useState(null)
  const [error, setError]     = useState(null)

  useEffect(() => {
    getMatches(profile)
      .then((data) => setMatches(data.matches || data))
      .catch((e) => setError(e.message))
  }, [profile])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <ProfileCard profile={profile} />

      <div>
        <div className="section-header">
          <div className="section-title">🤝 Partner Matches</div>
        </div>
        <div className="section-sub">
          Top 3 recommended ASEAN partners based on your startup profile.
        </div>

        {!matches && !error && <Spinner label="Finding your best partners…" />}
        {error && <ErrorBox message={error} />}

        {matches && (
          <div className="matches-grid">
            {matches.map((m, i) => (
              <MatchCard key={m.partner_id || i} match={m} onSelect={onSelectPartner} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Network Graph (circular layout, SVG) ───────────────────────── */
const NODE_COLORS = {
  programme:    '#7c3aed',  // purple
  organization: '#0d9488',  // teal
  organisation: '#0d9488',  // teal (alt spelling)
  startup:      '#ea580c',  // orange
  default:      '#64748b',
}

function NetworkGraph({ nodes, edges, highlightId }) {
  const W = 700, H = 380, CX = W / 2, CY = H / 2, R = 145

  // Assign positions in a circle
  const positioned = nodes.map((n, i) => {
    const angle = (2 * Math.PI * i) / nodes.length - Math.PI / 2
    return {
      ...n,
      x: CX + R * Math.cos(angle),
      y: CY + R * Math.sin(angle),
    }
  })

  const byId = Object.fromEntries(positioned.map((n) => [n.id, n]))

  return (
    <div className="graph-svg-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} xmlns="http://www.w3.org/2000/svg">
        {/* Edges */}
        {edges.map((e, i) => {
          const src = byId[e.source]
          const tgt = byId[e.target]
          if (!src || !tgt) return null
          const opacity = 0.15 + (e.weight || 0.5) * 0.55
          return (
            <line
              key={i}
              x1={src.x} y1={src.y}
              x2={tgt.x} y2={tgt.y}
              stroke="#94a3b8"
              strokeWidth={1.5}
              strokeOpacity={opacity}
            />
          )
        })}

        {/* Nodes */}
        {positioned.map((n) => {
          const isHL = n.id === highlightId
          const color = NODE_COLORS[n.type] || NODE_COLORS.default
          const label = (n.label || n.id).slice(0, 20)
          return (
            <g key={n.id}>
              {isHL && (
                <circle
                  cx={n.x} cy={n.y} r={22}
                  fill="none"
                  stroke={color}
                  strokeWidth={3}
                  strokeOpacity={0.4}
                />
              )}
              <circle
                cx={n.x} cy={n.y}
                r={isHL ? 16 : 11}
                fill={color}
                stroke={isHL ? '#fff' : 'none'}
                strokeWidth={isHL ? 2.5 : 0}
                opacity={isHL ? 1 : 0.85}
              />
              <text
                x={n.x}
                y={n.y + (isHL ? 28 : 23)}
                textAnchor="middle"
                fontSize={isHL ? 11 : 9.5}
                fontWeight={isHL ? 700 : 400}
                fill={isHL ? '#1e293b' : '#475569'}
              >
                {label}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

/* ─── Step 3: Graph + Brief generation ──────────────────────────── */
function GraphStep({ profile, partner, onBrief }) {
  const [graph, setGraph]       = useState(null)
  const [graphErr, setGraphErr] = useState(null)
  const [briefing, setBriefing] = useState(false)
  const [briefErr, setBriefErr] = useState(null)

  useEffect(() => {
    // Fetch graph and brief simultaneously
    getGraph()
      .then(setGraph)
      .catch((e) => setGraphErr(e.message))

    setBriefing(true)
    getBrief(profile, partner.partner_id || partner.id || partner.name)
      .then((b) => { setBriefing(false); onBrief(b) })
      .catch((e) => { setBriefing(false); setBriefErr(e.message) })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const partnerId = partner.partner_id || partner.id

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Selected partner summary */}
      <div className="card">
        <div className="card-title">📌 Selected Partner</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>
              {partner.name || partner.partner_name}
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              {partner.country}
            </div>
          </div>
          <span className={`score-badge ${scoreClass(partner.score)}`} style={{ marginLeft: 'auto' }}>
            Score: {partner.score}
          </span>
        </div>
      </div>

      {/* Network Graph */}
      <div className="card graph-card">
        <div className="card-title">🌐 ASEAN Ecosystem Network</div>
        {!graph && !graphErr && <Spinner label="Loading ecosystem graph…" />}
        {graphErr && <ErrorBox message={graphErr} />}
        {graph && (
          <>
            <NetworkGraph
              nodes={graph.nodes}
              edges={graph.edges}
              highlightId={partnerId}
            />
            <div className="graph-legend">
              {Object.entries({ programme: 'Programme', organisation: 'Organisation', startup: 'Startup' }).map(([type, label]) => (
                <div key={type} className="legend-item">
                  <div className="legend-dot" style={{ background: NODE_COLORS[type] }} />
                  {label}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Brief loading / error */}
      {briefing && <Spinner label="Generating partnership brief…" />}
      {briefErr && <ErrorBox message={briefErr} />}
    </div>
  )
}

/* ─── Step 4: Partnership Brief ──────────────────────────────────── */
function BriefStep({ brief, onReset }) {
  // Normalise field names (snake_case or camelCase)
  const objective  = brief.objective
  const concept    = brief.collaboration_concept || brief.collaborationConcept
  const poc        = brief.proposed_poc || brief.proposedPoc || brief.poc
  const timeline   = brief.timeline || []
  const metrics    = brief.success_metrics || brief.successMetrics || []

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div className="card-title" style={{ margin: 0 }}>📄 Partnership Brief</div>
        <button className="btn btn-secondary" onClick={onReset}>↩ Start Over</button>
      </div>

      {/* Objective */}
      {objective && (
        <div className="brief-section">
          <div className="brief-label">Objective</div>
          <div className="brief-objective">{objective}</div>
        </div>
      )}

      <hr className="divider" />

      {/* Collaboration Concept */}
      {concept && (
        <div className="brief-section">
          <div className="brief-label">Collaboration Concept</div>
          <div className="brief-text">{concept}</div>
        </div>
      )}

      {/* Proposed POC */}
      {poc && (
        <div className="brief-section">
          <div className="brief-label">Proposed Proof of Concept</div>
          <div className="poc-highlight">{poc}</div>
        </div>
      )}

      <hr className="divider" />

      {/* Timeline */}
      {timeline.length > 0 && (
        <div className="brief-section">
          <div className="brief-label">30-Day POC Timeline</div>
          <ol className="timeline-list">
            {timeline.map((item, i) => (
              <li key={i}>
                <span className="timeline-num">{i + 1}</span>
                <span>{typeof item === 'string' ? item : item.task || JSON.stringify(item)}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      <hr className="divider" />

      {/* Success Metrics */}
      {metrics.length > 0 && (
        <div className="brief-section">
          <div className="brief-label">Success Metrics</div>
          <ul className="metrics-list">
            {metrics.map((m, i) => (
              <li key={i}>{typeof m === 'string' ? m : m.metric || JSON.stringify(m)}</li>
            ))}
          </ul>
        </div>
      )}

      <hr className="divider" />
      <div style={{ textAlign: 'center' }}>
        <button className="btn btn-primary" onClick={onReset}>
          🔄 Start a New Analysis
        </button>
      </div>
    </div>
  )
}

/* ─── App Root ───────────────────────────────────────────────────── */
export default function App() {
  const [step, setStep]       = useState(1)
  const [profile, setProfile] = useState(null)
  const [partner, setPartner] = useState(null)
  const [brief, setBrief]     = useState(null)

  const handleProfile = (p) => {
    setProfile(p)
    setStep(2)
  }

  const handleSelectPartner = (m) => {
    setPartner(m)
    setStep(3)
  }

  const handleBrief = (b) => {
    setBrief(b)
    setStep(4)
  }

  const handleReset = () => {
    setStep(1)
    setProfile(null)
    setPartner(null)
    setBrief(null)
  }

  return (
    <>
      {/* ── Navigation ── */}
      <nav className="nav">
        <div className="nav-inner">
          <div className="nav-logo">PACT</div>
          <div className="nav-subtitle">ASEAN Startup Partnership Toolkit</div>
          <StepIndicator current={step} />
        </div>
      </nav>

      {/* ── Main Content ── */}
      <main className="main">
        {/* Disclaimer banner */}
        <div className="banner">
          ⚠️ All partner data is illustrative and for demo purposes only.
        </div>

        {step === 1 && (
          <div className="card">
            <div className="card-title" style={{ fontSize: '1.3rem', marginBottom: '0.25rem' }}>
              Welcome to PACT 🌏
            </div>
            <div className="section-sub">
              Upload your pitch deck image to find the best ASEAN partners for your startup.
            </div>
            <UploadStep onProfile={handleProfile} />
          </div>
        )}

        {step === 2 && profile && (
          <MatchesStep profile={profile} onSelectPartner={handleSelectPartner} />
        )}

        {step === 3 && profile && partner && (
          <GraphStep
            profile={profile}
            partner={partner}
            onBrief={handleBrief}
          />
        )}

        {step === 4 && brief && (
          <BriefStep brief={brief} onReset={handleReset} />
        )}
      </main>
    </>
  )
}
