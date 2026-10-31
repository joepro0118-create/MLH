// frontend/src/App.jsx — BridgeWise v2.1
// Flow: Auth (Demo Login/Signup) → Founder Upload (Multi-Format + Ctrl+V Paste) → Passport → Matches → Brief Dashboard (Inline Edit + Word/PDF/MD/JSON Export)
// UICheatSheet Rule of 3:
//   Hero    → Border-beam auth card + glow upload zone
//   Micro   → Shimmer skeletons + Spotlight cards + Expandable dash cards
//   Delight → Confetti + Export/Copy/Download/Share toolbar + toast system
import { useState, useEffect, useRef, useCallback } from 'react'
import { analyzePitch, getMatches, getGraph, getBrief } from './api.js'
import { EcosystemGraph } from './components/EcosystemGraph.jsx'
import { exportBriefToWord, exportBriefToPdf } from './exportUtils.js'
import './index.css'

/* ─────────────────────────────────────────────────────────────
   DEMO DATA — SmartTONG (Malaysia → Vietnam municipal pilot)
───────────────────────────────────────────────────────────────*/
const DEMO_FOUNDER = {
  name: 'Alex Tan',
  company: 'SmartTONG',
  email: 'alex@smarttong.my',
  country: 'Malaysia',
  role: 'Co-founder & CEO',
  avatar: 'AT',
}

const DEMO_PROFILE = {
  company_name: 'SmartTONG',
  country: 'Malaysia',
  sector: 'smart-city',
  solution: 'IoT-enabled smart bins that optimise municipal waste collection routes in real time.',
  capabilities: ['IoT Fill-Level Sensors', 'Dynamic Route Optimisation', 'Real-Time Telematics Dashboard', 'Waste Compaction Analytics'],
  needs: ['Municipal Waste Concessions', 'Local Fleet Logistics Partner', 'Government Procurement Access'],
  target_markets: ['Vietnam', 'Ho Chi Minh City', 'Hanoi'],
  partnership_goals: ['30-Day Municipal POC Pilot', 'Local Distribution Partner', 'Tri-Party LOI Framework'],
  goal: 'cross_border_poc',
  target_country: 'Vietnam',
  missing_fields: [],
  confidence: 'high',
}

const DEMO_CREDENTIALS = { email: 'alex@smarttong.my', password: 'demo1234' }

/* ─────────────────────────────────────────────────────────────
   FILE TYPE HELPERS (For Universal File Upload & Previews)
───────────────────────────────────────────────────────────────*/
const MAX_FILES = 10
const ACCEPTED_FILE_ATTR =
  '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.csv,.txt,.md,.json,.png,.jpg,.jpeg,.webp,.gif,application/pdf,image/*,text/*'

function getFileBadgeMeta(file) {
  const name = (file?.name || '').toLowerCase()
  const t = (file?.type || '').toLowerCase()
  if (t === 'application/pdf' || name.endsWith('.pdf')) {
    return { icon: '📕', typeLabel: 'PDF Document', accent: '#dc2626', bg: '#fef2f2', border: '#fecaca' }
  }
  if (/\.(docx?|rtf)$/.test(name) || t.includes('word')) {
    return { icon: '📘', typeLabel: 'Word Doc', accent: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' }
  }
  if (/\.(pptx?|key)$/.test(name) || t.includes('presentation')) {
    return { icon: '📙', typeLabel: 'Pitch Deck', accent: '#ea580c', bg: '#fff7ed', border: '#fed7aa' }
  }
  if (/\.(xlsx?|csv)$/.test(name) || t.includes('spreadsheet') || t.includes('csv')) {
    return { icon: '📗', typeLabel: 'Spreadsheet', accent: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' }
  }
  if (t.startsWith('image/') || /\.(png|jpe?g|webp|gif|bmp|svg)$/.test(name)) {
    return { icon: '🖼️', typeLabel: 'Image', accent: '#0d9488', bg: '#f0fdfa', border: '#99f6e4' }
  }
  if (/\.(txt|md|json|yaml|yml|xml|html)$/.test(name) || t.startsWith('text/')) {
    return { icon: '📝', typeLabel: 'Text / Notes', accent: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' }
  }
  return { icon: '📄', typeLabel: 'Document', accent: '#4f46e5', bg: '#eef2ff', border: '#c7d2fe' }
}

/* ─────────────────────────────────────────────────────────────
   TOAST NOTIFICATION SYSTEM
───────────────────────────────────────────────────────────────*/
function useToast() {
  const [toasts, setToasts] = useState([])
  const show = useCallback((msg, type = 'success') => {
    const id = Date.now() + Math.random()
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
   CANVAS CONFETTI
───────────────────────────────────────────────────────────────*/
function useConfetti() {
  useEffect(() => {
    const canvas = document.createElement('canvas')
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999'
    document.body.appendChild(canvas)
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth; canvas.height = window.innerHeight
    const COLORS = ['#7c3aed','#a78bfa','#c4b5fd','#fbbf24','#10b981','#38bdf8','#f472b6','#ffffff']
    const particles = Array.from({ length: 160 }, () => ({
      x: Math.random() * canvas.width, y: -30 - Math.random() * 80,
      w: Math.random() * 10 + 4, h: Math.random() * 5 + 2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      vy: Math.random() * 3.5 + 1.5, vx: (Math.random() - 0.5) * 4,
      rot: Math.random() * 360, rotV: (Math.random() - 0.5) * 10, alpha: 1,
    }))
    let frame, tick = 0
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach((p) => {
        p.y += p.vy; p.x += p.vx; p.rot += p.rotV; p.vy += 0.055
        if (tick > 100) p.alpha = Math.max(0, p.alpha - 0.012)
        ctx.save(); ctx.globalAlpha = p.alpha
        ctx.translate(p.x + p.w / 2, p.y + p.h / 2)
        ctx.rotate((p.rot * Math.PI) / 180)
        ctx.fillStyle = p.color; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
        ctx.restore()
      })
      tick++
      if (tick < 240) frame = requestAnimationFrame(draw); else canvas.remove()
    }
    draw()
    return () => { cancelAnimationFrame(frame); canvas.parentNode && canvas.remove() }
  }, [])
}

/* ─────────────────────────────────────────────────────────────
   SCORE RING
───────────────────────────────────────────────────────────────*/
function ScoreRing({ score, size = 68 }) {
  const r = size * 0.38, cx = size / 2, cy = size / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (Math.min(100, Math.max(0, score)) / 100) * circ
  const color = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444'
  return (
    <svg width={size} height={size} style={{ flexShrink: 0 }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#ede9fe" strokeWidth="5" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="5"
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central"
        fontSize={size * 0.22} fontWeight="800" fill={color}>{score}</text>
    </svg>
  )
}

/* ─────────────────────────────────────────────────────────────
   SPOTLIGHT CARD
───────────────────────────────────────────────────────────────*/
function SpotlightCard({ children, className = '' }) {
  const ref = useRef(null)
  const onMove = (e) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    ref.current.style.setProperty('--mx', `${e.clientX - rect.left}px`)
    ref.current.style.setProperty('--my', `${e.clientY - rect.top}px`)
  }
  return <div ref={ref} onMouseMove={onMove} className={`spotlight-card ${className}`}>{children}</div>
}

/* ─────────────────────────────────────────────────────────────
   FOUNDER AVATAR
───────────────────────────────────────────────────────────────*/
function FounderAvatar({ founder, size = 36 }) {
  return (
    <div className="founder-avatar" style={{ width: size, height: size, fontSize: size * 0.38 }}>
      {founder.avatar || founder.name?.slice(0, 2).toUpperCase()}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   STEP INDICATOR (steps 1-4, shown after auth)
───────────────────────────────────────────────────────────────*/
const STEPS = [
  { label: 'Upload', icon: '📁' },
  { label: 'Passport', icon: '🛂' },
  { label: 'Matches', icon: '🤝' },
  { label: 'Dashboard', icon: '📊' },
]
function StepIndicator({ current, onNavigate }) {
  return (
    <div className="steps">
      {STEPS.map((s, i) => {
        const n = i + 1
        const done = n < current, active = n === current
        return (
          <div key={s.label} className="step-item-wrap">
            <div className={`step-item ${done ? 'done' : ''} ${active ? 'active' : ''}`}
              onClick={() => done && onNavigate && onNavigate(n)}
              style={done ? { cursor: 'pointer' } : {}}>
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

/* ═════════════════════════════════════════════════════════════
   AUTH SCREEN — Demo Login / Sign Up
   No real backend. Demo credentials pre-filled.
   Stores founder context in React state only.
═════════════════════════════════════════════════════════════ */
function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [form, setForm] = useState({ name: '', company: '', email: '', password: '', country: 'Malaysia', role: 'Co-founder & CEO' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleDemoLogin = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      onAuth(DEMO_FOUNDER)
    }, 900)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError(null)
    if (mode === 'login') {
      if (!form.email || !form.password) { setError('Please enter your email and password.'); return }
      if (form.email !== DEMO_CREDENTIALS.email || form.password !== DEMO_CREDENTIALS.password) {
        setError('Invalid credentials. Use alex@smarttong.my / demo1234, or click Demo Login.')
        return
      }
      setLoading(true)
      setTimeout(() => {
        setLoading(false)
        onAuth({ ...DEMO_FOUNDER, email: form.email })
      }, 700)
    } else {
      if (!form.name || !form.email || !form.company) { setError('Please fill in all required fields.'); return }
      setLoading(true)
      setTimeout(() => {
        setLoading(false)
        onAuth({
          name: form.name,
          company: form.company,
          email: form.email,
          country: form.country,
          role: form.role,
          avatar: form.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase(),
        })
      }, 900)
    }
  }

  return (
    <div className="auth-page">
      {/* Left panel — Brand */}
      <div className="auth-left">
        <div className="auth-left-content">
          <div className="auth-brand-logo">BridgeWise</div>
          <div className="auth-brand-tagline">AI Cross-Border Partnership Intelligence</div>
          <div className="auth-brand-desc">
            AI-powered cross-border startup partnerships for ASEAN.<br />
            Upload your pitch. Gemma 4 finds your match. You execute.
          </div>

          {/* Social proof / stats */}
          <div className="auth-stats">
            <div className="auth-stat">
              <span className="auth-stat-num">30</span>
              <span className="auth-stat-label">Days to POC</span>
            </div>
            <div className="auth-stat">
              <span className="auth-stat-num">12+</span>
              <span className="auth-stat-label">ASEAN Hubs</span>
            </div>
            <div className="auth-stat">
              <span className="auth-stat-num">Gemma 4</span>
              <span className="auth-stat-label">Vision AI</span>
            </div>
          </div>

          {/* Testimonial / pitch */}
          <div className="auth-quote">
            <div className="auth-quote-text">
              "From pitch deck to a signed 30-day POC outline — in under 4 minutes."
            </div>
            <div className="auth-quote-author">— BridgeWise Demo · MLH Hacktoberfest KL 2026</div>
          </div>

          {/* Badges */}
          <div className="auth-badges">
            <span className="auth-badge">🤖 Gemma 4 Multimodal</span>
            <span className="auth-badge">🌏 ASEAN Ecosystem</span>
            <span className="auth-badge">⚡ Open Source · MIT</span>
          </div>
        </div>
      </div>

      {/* Right panel — Auth form */}
      <div className="auth-right">
        <div className="auth-card">
          {/* Header */}
          <div className="auth-card-header">
            <div className="auth-card-logo">BridgeWise</div>
            <div className="auth-card-title">
              {mode === 'login' ? 'Welcome back, Founder' : 'Create your Founder account'}
            </div>
            <div className="auth-card-sub">
              {mode === 'login'
                ? 'Sign in to continue your partnership journey'
                : 'Join BridgeWise and find your first ASEAN cross-border match'}
            </div>
          </div>

          {/* Demo quick login */}
          <div className="auth-demo-strip">
            <span className="auth-demo-label">🚀 Hackathon Demo</span>
            <button className="btn-demo-auth" onClick={handleDemoLogin} disabled={loading}>
              {loading ? 'Signing in…' : 'One-Click Demo Login'}
            </button>
          </div>

          <div className="auth-divider"><span>or continue with email</span></div>

          {/* Form */}
          <form className="auth-form" onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <>
                <div className="auth-form-row">
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input className="form-input" type="text" placeholder="Alex Tan"
                      value={form.name} onChange={set('name')} autoFocus />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Company / Startup *</label>
                    <input className="form-input" type="text" placeholder="SmartTONG Sdn Bhd"
                      value={form.company} onChange={set('company')} />
                  </div>
                </div>
                <div className="auth-form-row">
                  <div className="form-group">
                    <label className="form-label">Role</label>
                    <select className="form-select" value={form.role} onChange={set('role')}>
                      <option>Co-founder &amp; CEO</option>
                      <option>Co-founder &amp; CTO</option>
                      <option>Business Development</option>
                      <option>Partnerships Lead</option>
                      <option>Investor / VC</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Home Country</label>
                    <select className="form-select" value={form.country} onChange={set('country')}>
                      {['Malaysia','Singapore','Indonesia','Vietnam','Thailand','Philippines','Other ASEAN'].map((c) =>
                        <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              </>
            )}

            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input className="form-input" type="email"
                placeholder={mode === 'login' ? 'alex@smarttong.my' : 'you@startup.com'}
                value={form.email} onChange={set('email')} />
            </div>
            <div className="form-group">
              <label className="form-label">Password *</label>
              <input className="form-input" type="password"
                placeholder={mode === 'login' ? 'demo1234' : 'Create a password'}
                value={form.password} onChange={set('password')} />
            </div>

            {mode === 'login' && (
              <div className="auth-hint">
                Demo credentials: <code>alex@smarttong.my</code> / <code>demo1234</code>
              </div>
            )}

            {error && <div className="error-toast" style={{ fontSize: '0.8rem' }}>⚠️ {error}</div>}

            <button className="btn btn-primary btn-auth-submit" type="submit" disabled={loading}>
              {loading ? (
                <><span className="auth-spinner" /> {mode === 'login' ? 'Signing in…' : 'Creating account…'}</>
              ) : (
                mode === 'login' ? '→ Sign In to BridgeWise' : '→ Create Account & Continue'
              )}
            </button>
          </form>

          {/* Toggle mode */}
          <div className="auth-toggle">
            {mode === 'login' ? (
              <>Don't have an account?{' '}
                <button className="auth-toggle-btn" onClick={() => { setMode('signup'); setError(null) }}>Sign up free</button>
              </>
            ) : (
              <>Already have an account?{' '}
                <button className="auth-toggle-btn" onClick={() => { setMode('login'); setError(null) }}>Sign in</button>
              </>
            )}
          </div>

          <div className="auth-footer-note">
            🔒 Demo only — no data stored. Open source, MIT Licence.
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═════════════════════════════════════════════════════════════
   STEP 1 — FOUNDER UPLOAD PROMPT PAGE
   Personalized with founder context. Supports PDF, DOCX, PPTX,
   XLSX/CSV, Text, Images (up to 10 files) + Global Ctrl+V Paste.
═════════════════════════════════════════════════════════════ */
function UploadStep({ founder, onComplete }) {
  const [files, setFiles] = useState([])
  const [goal, setGoal] = useState('cross-border POC')
  const [targetCountry, setTargetCountry] = useState('Vietnam')
  const [notes, setNotes] = useState('')
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pasteFlash, setPasteFlash] = useState(null)
  const inputRef = useRef(null)

  const addFiles = useCallback((newFiles) => {
    setError(null)
    const incoming = Array.from(newFiles || [])
    if (!incoming.length) return
    const validSize = incoming.filter((f) => f.size <= 20 * 1024 * 1024)
    if (validSize.length < incoming.length) {
      setError('Some files exceeded the 20 MB limit and were skipped.')
    }
    if (!validSize.length) return
    setFiles((prev) => {
      const combined = [...prev, ...validSize].slice(0, MAX_FILES)
      if (prev.length + validSize.length > MAX_FILES) {
        setError(`Maximum ${MAX_FILES} files allowed. Kept the first ${MAX_FILES}.`)
      }
      return combined
    })
  }, [])

  const removeFile = (idx) => setFiles((prev) => prev.filter((_, i) => i !== idx))

  // Global Ctrl+V / Cmd+V Clipboard Paste Handler
  useEffect(() => {
    const handleWindowPaste = (e) => {
      const activeTag = document.activeElement?.tagName?.toLowerCase()
      const isTypingInInput = activeTag === 'input' || activeTag === 'textarea'

      const items = Array.from(e.clipboardData?.items || [])
      const pastedFiles = []

      for (const item of items) {
        if (item.kind === 'file') {
          const f = item.getAsFile()
          if (f) {
            const ext = (f.type.split('/')[1] || 'png').replace(/[^a-z0-9]/gi, '')
            const namedFile =
              f.name && f.name !== 'image.png'
                ? f
                : new File([f], `pasted_${Date.now()}.${ext}`, { type: f.type || 'image/png' })
            pastedFiles.push(namedFile)
          }
        }
      }

      if (pastedFiles.length > 0) {
        e.preventDefault()
        addFiles(pastedFiles)
        const msg = `📋 Pasted ${pastedFiles.length} file${pastedFiles.length > 1 ? 's' : ''} (${pastedFiles.map((f) => f.name).join(', ')})`
        setPasteFlash(msg)
        setTimeout(() => setPasteFlash(null), 3200)
        return
      }

      if (!isTypingInInput) {
        const pastedText = e.clipboardData?.getData('text/plain')
        if (pastedText && pastedText.trim()) {
          e.preventDefault()
          setNotes((prev) => (prev ? `${prev}\n\n${pastedText.trim()}` : pastedText.trim()))
          setPasteFlash('📋 Pasted clipboard text into Founder Note!')
          setTimeout(() => setPasteFlash(null), 3200)
        }
      }
    }

    window.addEventListener('paste', handleWindowPaste)
    return () => window.removeEventListener('paste', handleWindowPaste)
  }, [addFiles])

  const loadSamplePdfDeck = async () => {
    try {
      setError(null)
      const res = await fetch('/sample_pitch_deck.pdf')
      if (!res.ok) throw new Error('Sample PDF not found')
      const blob = await res.blob()
      const file = new File([blob], 'SmartTONG_Pitch_Deck.pdf', { type: 'application/pdf' })
      addFiles([file])
      setNotes(
        'We want to pilot 50 IoT smart-waste bin sensors in Ho Chi Minh City District 1 & 3 with a municipal waste board partner.'
      )
      setGoal('cross-border POC')
      setTargetCountry('Vietnam')
      setPasteFlash('📕 Loaded SmartTONG_Pitch_Deck.pdf!')
      setTimeout(() => setPasteFlash(null), 3000)
    } catch {
      onComplete(DEMO_PROFILE)
    }
  }

  const handleAnalyze = async () => {
    if (!files.length && !notes.trim()) {
      setError('Please upload/paste at least 1 document (PDF, Word, PPTX, image, text) or enter a Founder Note.')
      return
    }
    setError(null); setLoading(true)
    try {
      const profile = await analyzePitch(files, { notes, goal, target_country: targetCountry })
      onComplete(profile)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  if (loading) return (
    <div className="gemma-loading">
      <div className="gemma-spinner"><div className="g-ring" /><div className="g-ring r2" /><div className="g-ring r3" /></div>
      <div className="gemma-loading-title">Gemma 4 is synthesizing your materials…</div>
      <div className="gemma-loading-sub">
        {files.length > 0
          ? `Reading ${files.length} file${files.length > 1 ? 's' : ''} (${files.map((f) => f.name).join(', ')}) & building your Startup Passport`
          : 'Analyzing your founder prompt & building your Startup Passport'}
      </div>
    </div>
  )

  return (
    <div className="upload-page">
      {/* Personalized founder welcome bar */}
      <div className="founder-welcome-bar">
        <div className="fwb-left">
          <FounderAvatar founder={founder} size={44} />
          <div>
            <div className="fwb-greeting">Good to see you, <strong>{founder.name.split(' ')[0]}</strong> 👋</div>
            <div className="fwb-company">{founder.company} &bull; {founder.country} &bull; {founder.role}</div>
          </div>
        </div>
        <div className="fwb-cta-label">Ready to find your ASEAN cross-border partner?</div>
      </div>

      {/* Section title */}
      <div className="upload-section-header">
        <div className="ush-step-pill">Step 1 of 4</div>
        <h2 className="ush-title">Upload or Paste Your Pitch Materials</h2>
        <p className="ush-sub">
          Upload PDFs, Word docs (<code>.docx</code>), PowerPoint slides (<code>.pptx</code>), spreadsheets, or images — or press <kbd className="kbd-pill">Ctrl+V</kbd> anywhere to paste screenshots, files, or text.
        </p>
      </div>

      {/* Two-column layout: upload zone + options */}
      <div className="upload-two-col">
        {/* Left: Drop zone */}
        <div className="upload-zone-wrap">
          <div
            className={`upload-zone ${dragging ? 'drag-over' : ''}`}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files) }}
          >
            <div className="upload-icon-bg">📑</div>
            <div className="upload-label">
              {files.length > 0
                ? `${files.length} of ${MAX_FILES} file${files.length > 1 ? 's' : ''} attached`
                : 'Drop PDF, Word, PPTX, Images, or Paste (Ctrl+V)'}
            </div>
            <div className="upload-hint">PDF · DOCX · PPTX · XLSX · CSV · TXT · PNG · JPG · WEBP (Up to 20 MB)</div>
            <div className="upload-browse-pill">Click to browse · Drag &amp; drop · Paste</div>
            <input ref={inputRef} type="file" accept={ACCEPTED_FILE_ATTR}
              multiple className="upload-input" onChange={(e) => addFiles(e.target.files)} />
          </div>

          {pasteFlash && <div className="paste-flash">{pasteFlash}</div>}

          {/* File list */}
          {files.length > 0 && (
            <div className="uploaded-files-list" style={{ marginTop: '0.85rem' }}>
              {files.map((f, i) => {
                const meta = getFileBadgeMeta(f)
                return (
                  <div key={i} className="file-chip">
                    <span
                      className="file-chip-badge"
                      style={{ color: meta.accent, background: meta.bg, borderColor: meta.border }}
                    >
                      {meta.icon} {meta.typeLabel}
                    </span>
                    <span className="file-name">{f.name}</span>
                    <span className="file-size">({(f.size / 1024).toFixed(1)} KB)</span>
                    <button className="btn-chip-remove" type="button"
                      onClick={(e) => { e.stopPropagation(); removeFile(i) }}>✕</button>
                  </div>
                )
              })}
            </div>
          )}

          {/* File count indicator */}
          <div className="file-count-bar">
            {[0, 1, 2].map((i) => (
              <div key={i} className={`file-count-dot ${i < files.length ? 'filled' : ''}`} />
            ))}
            <span className="file-count-label">{files.length} file{files.length === 1 ? '' : 's'} attached (up to {MAX_FILES})</span>
          </div>
        </div>

        {/* Right: Founder context options */}
        <div className="upload-options-panel">
          <div className="uop-header">
            <span className="uop-icon">🎯</span>
            <span className="uop-title">Partnership Context</span>
          </div>

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

          <div className="form-group">
            <label className="form-label">Founder Note / Prompt <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional — or analyze from text alone)</span></label>
            <textarea className="form-textarea" rows="3"
              placeholder={`Hi, I'm ${founder.name.split(' ')[0]} from ${founder.company}. We want to test our IoT route optimization for 50 municipal bins in District 1, Ho Chi Minh City...`}
              value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          {/* Gemma info box */}
          <div className="gemma-info-box">
            <div className="gib-icon">✦</div>
            <div>
              <div className="gib-title">Powered by Gemma 4 Multimodal + Document AI</div>
              <div className="gib-desc">Gemma reads your PDFs, Word docs, slides, images, and notes together to extract a fact-grounded Startup Passport — then our deterministic engine ranks the best ASEAN partners.</div>
            </div>
          </div>
        </div>
      </div>

      {error && <div className="error-toast">⚠️ {error}</div>}

      {/* CTA row */}
      <div className="upload-cta-row">
        <button className="btn btn-primary btn-large" onClick={handleAnalyze} disabled={files.length === 0 && !notes.trim()}>
          <span>🤖</span>
          <span>Analyze with Gemma 4 &amp; Build Passport</span>
        </button>
        <span className="or-pill">OR</span>
        <button className="btn btn-ghost" type="button" onClick={loadSamplePdfDeck}>
          <span>📕</span>
          <span>Load Sample PDF Deck</span>
        </button>
        <button className="btn btn-demo" onClick={() => onComplete(DEMO_PROFILE)}>
          <span>🚀</span>
          <span>Use SmartTONG Demo</span>
        </button>
      </div>
    </div>
  )
}

/* ═════════════════════════════════════════════════════════════
   STEP 2 — STARTUP PASSPORT (Review & Edit)
═════════════════════════════════════════════════════════════ */
function PassportStep({ profile, founder, onSave, onBack }) {
  const [data, setData] = useState({ ...profile })
  const states = {
    newCap: useState(''), newNeed: useState(''), newMarket: useState(''), newGoal: useState('')
  }

  const handleRemoveChip = (field, idx) =>
    setData((prev) => ({ ...prev, [field]: prev[field].filter((_, i) => i !== idx) }))

  const handleAddChip = (field, val, setter) => {
    if (!val?.trim()) return
    setData((prev) => ({ ...prev, [field]: [...(prev[field] || []), val.trim()] }))
    setter('')
  }

  const CHIP_GROUPS = [
    { field: 'capabilities',      label: 'Core Capabilities',   cls: 'chip-blue',   key: 'newCap',    ph: '+ Add capability…' },
    { field: 'needs',             label: 'Operational Needs',   cls: 'chip-purple', key: 'newNeed',   ph: '+ Add need…' },
    { field: 'target_markets',    label: 'Target Markets',      cls: 'chip-teal',   key: 'newMarket', ph: '+ Add market…' },
    { field: 'partnership_goals', label: 'Partnership Goals',   cls: 'chip-orange', key: 'newGoal',   ph: '+ Add goal…' },
  ]

  return (
    <div className="step-content">
      {/* Founder context bar */}
      <div className="founder-context-bar">
        <FounderAvatar founder={founder} size={32} />
        <span className="fcb-name">{founder.name}</span>
        <span className="fcb-dot">·</span>
        <span className="fcb-company">{founder.company}</span>
        <span className="fcb-sep" />
        <span className="fcb-step">Step 2 of 4 — Review &amp; refine your Startup Passport</span>
      </div>

      <div className="passport-card">
        <div className="passport-header">
          <div className="passport-badge-icon">🛂</div>
          <div>
            <div className="passport-title">Startup Passport</div>
            <div className="passport-sub">Gemma 4 extracted this from your materials. Review, correct, and add context before partner matching.</div>
          </div>
          <div className="passport-ai-tag">✦ Synthesized via Gemma 4</div>
        </div>

        <div className="passport-fields-grid">
          {[
            { label: 'Company Name', key: 'company_name' },
            { label: 'Home Country',  key: 'country' },
            { label: 'Sector',        key: 'sector' },
          ].map(({ label, key }) => (
            <div key={key} className="form-group">
              <label className="form-label">{label}</label>
              <input type="text" className="form-input" value={data[key]}
                onChange={(e) => setData({ ...data, [key]: e.target.value })} />
            </div>
          ))}
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Core Solution Statement</label>
            <textarea className="form-textarea" rows="2" value={data.solution}
              onChange={(e) => setData({ ...data, solution: e.target.value })} />
          </div>
        </div>

        <div className="passport-chips-section">
          {CHIP_GROUPS.map(({ field, label, cls, key, ph }) => {
            const [val, setter] = states[key]
            return (
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
                  <input type="text" placeholder={ph} value={val}
                    onChange={(e) => setter(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddChip(field, val, setter)} />
                  <button type="button" onClick={() => handleAddChip(field, val, setter)}>Add</button>
                </div>
              </div>
            )
          })}
        </div>

        <div className="passport-footer">
          <button className="btn btn-ghost" onClick={onBack}>← Re-upload Files</button>
          <button className="btn btn-primary btn-large" onClick={() => onSave(data)}>
            <span>🤝</span><span>Confirm &amp; Find Top Partners →</span>
          </button>
        </div>
      </div>
    </div>
  )
}

/* ═════════════════════════════════════════════════════════════
   STEP 3 — PARTNER MATCHES & ECOSYSTEM GRAPH
═════════════════════════════════════════════════════════════ */
const RANK_ACCENT = ['#7c3aed', '#0d9488', '#ea580c']
const RANK_LABEL  = ['#1 Best Match', '#2 Strong Match', '#3 Good Match']

function MatchesStep({ profile, founder, onSelectPartner, onEditPassport }) {
  const [matches, setMatches]     = useState(null)
  const [error, setError]         = useState(null)
  const [graphData, setGraphData] = useState(null)

  useEffect(() => {
    getMatches(profile).then((d) => setMatches(d.matches || d)).catch((e) => setError(e.message))
    getGraph().then(setGraphData).catch((e) => console.warn('Graph error:', e))
  }, [profile])

  return (
    <div className="step-content">
      {/* Founder context bar */}
      <div className="founder-context-bar">
        <FounderAvatar founder={founder} size={32} />
        <span className="fcb-name">{founder.name}</span>
        <span className="fcb-dot">·</span>
        <span className="fcb-company">{founder.company}</span>
        <span className="fcb-sep" />
        <span className="fcb-step">Step 3 of 4 — Your top ASEAN partner matches</span>
      </div>

      <div className="profile-mini-bar">
        <div>
          <span className="mini-company">{profile.company_name}</span>
          <span className="mini-sub">
            📍 {profile.country} &bull; {profile.sector} &bull; Target: {(profile.target_markets || []).slice(0, 2).join(', ')}
          </span>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={onEditPassport}>✏️ Edit Passport</button>
      </div>

      <div className="matches-header">
        <div>
          <div className="section-title">Top 3 ASEAN Partner Recommendations</div>
          <div className="section-sub">Deterministic 30/30/20/20 weighted scoring — industry, capabilities, markets, goals. Choose a partner to generate your 30-day POC plan.</div>
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
                  <ul>{(m.reasons || []).map((r, idx) =>
                    <li key={idx}><span className="reason-star">✦</span>{r}</li>
                  )}</ul>
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
              <div className="skeleton" style={{ height: 32 }} />
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
          startup={profile} matches={matches || []}
          nodes={graphData?.nodes} edges={graphData?.edges}
          onNodeClick={(n) => console.log('Node:', n)}
        />
      </div>
    </div>
  )
}

/* ═════════════════════════════════════════════════════════════
   COLLAPSIBLE DASH CARD
═════════════════════════════════════════════════════════════ */
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
          {onEdit && !editMode && <button className="dch-edit-btn" onClick={onEdit}>✏️ Edit</button>}
          {editMode && <button className="dch-edit-btn active" onClick={onDone}>✓ Done</button>}
          <button className="dch-collapse-btn" onClick={(e) => { e.stopPropagation(); setOpen((v) => !v) }}>
            {open ? '▲' : '▼'}
          </button>
        </div>
      </div>
      <div className={`dash-card-body ${open ? '' : 'collapsed'}`}>{children}</div>
    </div>
  )
}

/* ═════════════════════════════════════════════════════════════
   STEP 4 — BRIEF DASHBOARD
   Editable cards · Word (.doc) · PDF (.pdf) · Markdown (.md) ·
   Text (.txt) · JSON · Copy · Share · Layout toggle
═════════════════════════════════════════════════════════════ */
const WEEK_CLR = ['#7c3aed', '#2563eb', '#0d9488', '#16a34a']

function BriefStep({ profile, partner, founder, onBackToMatches, onReset }) {
  const [brief, setBrief]         = useState(null)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [editedBrief, setEditedBrief] = useState(null)
  const [editingCard, setEditingCard] = useState(null)
  const [layout, setLayout]       = useState('two-col')
  const [newMetric, setNewMetric] = useState('')
  const { toasts, show: showToast } = useToast()

  useConfetti()

  useEffect(() => {
    setLoading(true); setError(null)
    getBrief(profile, partner.partner_id || partner.id || partner.name)
      .then((b) => { setBrief(b); setEditedBrief({ ...b }); setLoading(false) })
      .catch((e) => { setError(e.message); setLoading(false) })
  }, [profile, partner])

  const eb = editedBrief || brief || {}

  const buildText = () => [
    `PARTNERSHIP ACTION BRIEF: ${profile.company_name} × ${partner.partner_name || partner.name}\n`,
    `Prepared for: ${founder.name} (${founder.role}) · ${founder.company}\n`,
    `Generated: ${new Date().toLocaleDateString('en-MY', { dateStyle: 'full' })}\n\n`,
    `OBJECTIVE:\n${eb.objective || ''}\n\n`,
    `COLLABORATION CONCEPT:\n${eb.collaboration_concept || eb.collaborationConcept || ''}\n\n`,
    `PROPOSED 30-DAY POC:\n${eb.proposed_poc || eb.proposedPoc || ''}\n\n`,
    `30-DAY TIMELINE:\n${(eb.timeline || []).map((t, i) => `Week ${i+1}: ${typeof t === 'string' ? t : t.task}`).join('\n')}\n\n`,
    `SUCCESS METRICS:\n${(eb.success_metrics || eb.successMetrics || []).map((m) => `• ${typeof m === 'string' ? m : m.metric}`).join('\n')}\n\n`,
    `Generated by BridgeWise with Gemma 4 · All records illustrative.`,
  ].join('')

  const buildMarkdown = () => [
    `# Partnership Action Brief\n`,
    `**${profile.company_name} × ${partner.partner_name || partner.name}**\n\n`,
    `> Prepared for **${founder.name}** (${founder.role}), ${founder.company}  \n`,
    `> Powered by **BridgeWise + Gemma 4** · Generated ${new Date().toLocaleDateString()}  \n`,
    `> ⚠️ All data illustrative — for demonstration purposes only\n\n`,
    `---\n\n`,
    `## 🎯 Strategic Objective\n${eb.objective || ''}\n\n`,
    `## 🤝 Collaboration Concept\n${eb.collaboration_concept || eb.collaborationConcept || ''}\n\n`,
    `## 🧪 Proposed 30-Day Proof of Concept\n${eb.proposed_poc || eb.proposedPoc || ''}\n\n`,
    `## 📅 30-Day Implementation Timeline\n`,
    ...(eb.timeline || []).map((t, i) => `- **Week ${i+1}:** ${typeof t === 'string' ? t : t.task}\n`),
    `\n## 📊 Measurable Success Metrics\n`,
    ...(eb.success_metrics || eb.successMetrics || []).map((m) => `- [ ] ${typeof m === 'string' ? m : m.metric}\n`),
    `\n---\n`,
    `*BridgeWise · MLH Hacktoberfest KL 2026 · Compatibility Score: ${partner.score}/100*`,
  ].join('')

  const handleCopy = () =>
    navigator.clipboard?.writeText(buildText())
      .then(() => showToast('📋 Brief copied to clipboard!', 'success'))
      .catch(() => showToast('Copy failed — try Download instead', 'info'))

  const handleExportWord = () => {
    exportBriefToWord(profile, partner, eb)
    showToast('📘 Exported Partnership Brief as Word (.doc)!', 'success')
  }

  const handleExportPdf = () => {
    exportBriefToPdf(profile, partner, eb)
    showToast('📕 Exported Partnership Brief as PDF (.pdf)!', 'success')
  }

  const handleDownloadMd = () => {
    const blob = new Blob([buildMarkdown()], { type: 'text/markdown' })
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(blob),
      download: `BridgeWise_Brief_${profile.company_name}_x_${(partner.partner_name || 'partner').replace(/\s+/g, '_')}.md`
    }); a.click(); URL.revokeObjectURL(a.href)
    showToast('💾 Markdown (.md) downloaded!', 'success')
  }

  const handleDownloadTxt = () => {
    const blob = new Blob([buildText()], { type: 'text/plain' })
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(blob),
      download: `BridgeWise_Brief_${profile.company_name}.txt`
    }); a.click(); URL.revokeObjectURL(a.href)
    showToast('📄 Text file (.txt) downloaded!', 'success')
  }

  const handleExportJSON = () => {
    const payload = {
      generated_at: new Date().toISOString(),
      prepared_for: { name: founder.name, role: founder.role, company: founder.company },
      startup: profile,
      partner: { id: partner.partner_id, name: partner.partner_name || partner.name, country: partner.country, score: partner.score },
      brief: editedBrief,
      disclaimer: 'All records are illustrative for demo purposes.',
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(blob),
      download: `BridgeWise_Export_${profile.company_name}.json`
    }); a.click(); URL.revokeObjectURL(a.href)
    showToast('📦 JSON exported!', 'success')
  }

  const handleShare = async () => {
    const shareData = {
      title: `BridgeWise Brief: ${profile.company_name} × ${partner.partner_name || partner.name}`,
      text: `${founder.name} from ${founder.company} generated an ASEAN cross-border partnership brief via BridgeWise!\n\nObjective: ${eb.objective || ''}`,
      url: window.location.href,
    }
    if (navigator.share) {
      try { await navigator.share(shareData); showToast('Shared!', 'success') } catch { /* cancelled */ }
    } else {
      await navigator.clipboard?.writeText(`${shareData.title}\n\n${shareData.text}\n${shareData.url}`)
      showToast('🔗 Share link copied!', 'info')
    }
  }

  const updateTimeline = (idx, val) => {
    const tl = [...(eb.timeline || [])]; tl[idx] = val
    setEditedBrief((b) => ({ ...b, timeline: tl }))
  }
  const getMetrics = () => eb.success_metrics || eb.successMetrics || []
  const setMetrics = (m) => setEditedBrief((b) => ({ ...b, success_metrics: m, successMetrics: m }))
  const updateMetric = (idx, val) => { const m = [...getMetrics()]; m[idx] = val; setMetrics(m) }
  const removeMetric = (idx) => setMetrics(getMetrics().filter((_, i) => i !== idx))
  const addMetric = () => { if (!newMetric.trim()) return; setMetrics([...getMetrics(), newMetric.trim()]); setNewMetric('') }

  if (loading) return (
    <div className="brief-generating" style={{ minHeight: 320, justifyContent: 'center' }}>
      <div className="gemma-spinner"><div className="g-ring" /><div className="g-ring r2" /></div>
      <div>
        <div className="bgen-title">Gemma 4 is crafting your 30-day POC plan…</div>
        <div className="bgen-sub">Formulating milestones for {profile.company_name} × {partner.partner_name || partner.name}</div>
      </div>
    </div>
  )

  if (error) return (
    <div className="dash-card" style={{ padding: '2rem', textAlign: 'center' }}>
      <div className="error-toast" style={{ marginBottom: '1.5rem' }}>⚠️ {error}</div>
      <button className="btn btn-primary" onClick={onBackToMatches}>← Return to Matches</button>
    </div>
  )

  return (
    <div className="brief-dashboard">
      {/* Founder context bar */}
      <div className="founder-context-bar">
        <FounderAvatar founder={founder} size={32} />
        <span className="fcb-name">{founder.name}</span>
        <span className="fcb-dot">·</span>
        <span className="fcb-company">{founder.company}</span>
        <span className="fcb-sep" />
        <span className="fcb-step">Step 4 of 4 — Your partnership action brief is ready</span>
      </div>

      {/* Dashboard header strip */}
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
            <div className="bdh-sub">📍 {partner.country} &bull; Powered by Gemma 4</div>
            <div className="bdh-score-pill">
              Compatibility Score &nbsp;<span className="bdh-score-num">{partner.score}</span>&nbsp;/ 100
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="bdh-actions">
            <div className="layout-toggle">
              <button className={`layout-btn ${layout === 'two-col' ? 'active' : ''}`}
                title="2-col layout" onClick={() => setLayout('two-col')}>⊞</button>
              <button className={`layout-btn ${layout === 'single' ? 'active' : ''}`}
                title="Single col" onClick={() => setLayout('single')}>☰</button>
            </div>
            <div className="dash-divider" />
            <button className="btn-dash btn-dash-word" onClick={handleExportWord} title="Export to Microsoft Word (.doc)">📘 Word</button>
            <button className="btn-dash btn-dash-pdf" onClick={handleExportPdf} title="Export to PDF (.pdf)">📕 PDF</button>
            <button className="btn-dash btn-dash-primary" onClick={handleDownloadMd}>💾 .md</button>
            <button className="btn-dash" onClick={handleDownloadTxt}>📄 .txt</button>
            <button className="btn-dash btn-dash-export" onClick={handleExportJSON}>📦 JSON</button>
            <button className="btn-dash" onClick={handleCopy}>📋 Copy</button>
            <button className="btn-dash btn-dash-share" onClick={handleShare}>🔗 Share</button>
            <div className="dash-divider" />
            <button className="btn-dash" onClick={onBackToMatches}>🤝 Switch</button>
            <button className="btn-dash" onClick={onReset}>🔄 Restart</button>
          </div>
        </div>
      </div>

      {/* Dashboard cards */}
      <div className="dash-grid" style={layout === 'single' ? { gridTemplateColumns: '1fr' } : {}}>

        {/* Objective — full width */}
        <DashCard icon="🎯" title="Strategic Objective" className="dash-grid-full"
          editMode={editingCard === 'objective'}
          onEdit={() => setEditingCard('objective')} onDone={() => setEditingCard(null)}>
          <div className="brief-objective-block">
            <div className="brief-label">Objective</div>
            {editingCard === 'objective' ? (
              <textarea className="brief-objective-text" style={{ minHeight: 80 }}
                value={eb.objective || ''}
                onChange={(e) => setEditedBrief((b) => ({ ...b, objective: e.target.value }))} />
            ) : (
              <div className="brief-objective-text">{eb.objective}</div>
            )}
          </div>
        </DashCard>

        {/* Collaboration Concept */}
        <DashCard icon="🤝" title="Collaboration Concept"
          editMode={editingCard === 'collab'}
          onEdit={() => setEditingCard('collab')} onDone={() => setEditingCard(null)}>
          {editingCard === 'collab' ? (
            <textarea className="editable-text" rows={6}
              value={eb.collaboration_concept || eb.collaborationConcept || ''}
              onChange={(e) => setEditedBrief((b) => ({ ...b, collaboration_concept: e.target.value, collaborationConcept: e.target.value }))} />
          ) : (
            <div className="brief-text">{eb.collaboration_concept || eb.collaborationConcept}</div>
          )}
        </DashCard>

        {/* Proof of Concept */}
        <DashCard icon="🧪" title="Proposed Proof of Concept"
          editMode={editingCard === 'poc'}
          onEdit={() => setEditingCard('poc')} onDone={() => setEditingCard(null)}>
          {editingCard === 'poc' ? (
            <div className="poc-block">
              <textarea rows={5}
                value={eb.proposed_poc || eb.proposedPoc || ''}
                onChange={(e) => setEditedBrief((b) => ({ ...b, proposed_poc: e.target.value, proposedPoc: e.target.value }))} />
            </div>
          ) : (
            <div className="poc-block">{eb.proposed_poc || eb.proposedPoc}</div>
          )}
        </DashCard>

        {/* 30-Day Timeline — full width */}
        <DashCard icon="📅" title="30-Day Implementation Timeline" className="dash-grid-full"
          editMode={editingCard === 'timeline'}
          onEdit={() => setEditingCard('timeline')} onDone={() => setEditingCard(null)}>
          <div className="timeline-stepper">
            {(eb.timeline || []).map((item, i) => {
              const text = typeof item === 'string' ? item : item.task || JSON.stringify(item)
              return (
                <div key={i} className="tl-step">
                  <div className="tl-dot" style={{ background: WEEK_CLR[i % 4] }}>{i + 1}</div>
                  {i < (eb.timeline || []).length - 1 && <div className="tl-connector" />}
                  <div className={`tl-text ${editingCard === 'timeline' ? 'is-editing' : ''}`}>
                    {editingCard === 'timeline'
                      ? <textarea rows={3} value={text} onChange={(e) => updateTimeline(i, e.target.value)} />
                      : text}
                  </div>
                </div>
              )
            })}
          </div>
        </DashCard>

        {/* Success Metrics — full width */}
        <DashCard icon="📊" title="Measurable Success Metrics" className="dash-grid-full"
          editMode={editingCard === 'metrics'}
          onEdit={() => setEditingCard('metrics')} onDone={() => setEditingCard(null)}>
          <div className="metrics-chips">
            {getMetrics().map((m, i) => {
              const text = typeof m === 'string' ? m : m.metric || JSON.stringify(m)
              return (
                <div key={i} className={`metric-chip ${editingCard === 'metrics' ? 'is-editing' : ''}`}>
                  <span className="metric-check">✓</span>
                  {editingCard === 'metrics' ? (
                    <>
                      <textarea rows={1} value={text} onChange={(e) => updateMetric(i, e.target.value)} />
                      <button onClick={() => removeMetric(i)}
                        style={{ background: 'none', border: 'none', color: '#dc2626', fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>✕</button>
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

      {/* Footer */}
      <div className="brief-footer">
        <div className="brief-disclaimer">
          ⚠️ {eb.disclaimer || 'All generated outcomes and partner records are illustrative for demonstration. Powered by Gemma 4 · MIT Licence.'}
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button className="btn btn-ghost btn-sm" onClick={handleExportWord}>📘 Word (.doc)</button>
          <button className="btn btn-ghost btn-sm" onClick={handleExportPdf}>📕 PDF (.pdf)</button>
          <button className="btn btn-ghost btn-sm" onClick={handleDownloadMd}>💾 .md</button>
          <button className="btn btn-ghost btn-sm" onClick={handleCopy}>📋 Copy</button>
          <button className="btn btn-primary btn-sm" onClick={onReset}>🔄 New Analysis</button>
        </div>
      </div>

      <ToastContainer toasts={toasts} />
    </div>
  )
}

/* ═════════════════════════════════════════════════════════════
   MAIN APPLICATION ROOT
   Phase 0: Auth → Phase 1-4: Main flow
═════════════════════════════════════════════════════════════ */
export default function App() {
  const [founder, setFounder]           = useState(null)   // null = not logged in
  const [step, setStep]                 = useState(1)       // 1-4 within main flow
  const [profile, setProfile]           = useState(null)
  const [selectedPartner, setSelectedPartner] = useState(null)

  const handleAuth = (f) => setFounder(f)
  const handleLogout = () => { setFounder(null); setStep(1); setProfile(null); setSelectedPartner(null) }

  const handleUploadDone = (p)    => { setProfile(p); setStep(2) }
  const handlePassportOk = (p)    => { setProfile(p); setStep(3) }
  const handlePartnerPick = (pa)  => { setSelectedPartner(pa); setStep(4) }
  const handleReset = ()          => { setStep(1); setProfile(null); setSelectedPartner(null) }

  /* ── AUTH GATE ── */
  if (!founder) return <AuthScreen onAuth={handleAuth} />

  /* ── MAIN APP (authenticated) ── */
  return (
    <>
      {/* Nav */}
      <nav className="nav">
        <div className="nav-inner">
          <div className="nav-brand">
            <span className="nav-logo">BridgeWise</span>
            <span className="nav-tagline">AI Cross-Border Partnership Intelligence</span>
          </div>

          <StepIndicator current={step} onNavigate={(s) => s < step && setStep(s)} />

          {/* Founder pill + logout */}
          <div className="nav-founder-pill">
            <FounderAvatar founder={founder} size={28} />
            <span className="nav-founder-name">{founder.name.split(' ')[0]}</span>
            <button className="nav-logout-btn" onClick={handleLogout} title="Sign out">✕</button>
          </div>
        </div>
      </nav>

      <main className="main">
        {/* Step 1 — Founder Upload Prompt */}
        {step === 1 && (
          <>
            {/* Hero banner above upload */}
            <div className="hero-banner">
              <div className="hero-eyebrow">✦ MLH Hacktoberfest KL 2026 &bull; Best Use of Gemma 4</div>
              <h1 className="hero-title">
                Cross-Border Expansion is Chaotic.<br />
                <span className="hero-gradient">We Automated the POC.</span>
              </h1>
              <p className="hero-sub">
                Drop or paste (<kbd className="kbd-pill">Ctrl+V</kbd>) PDFs, Word docs, slides, or images &bull; Gemma 4 builds your Startup Passport &bull;
                Discover cross-border matches &bull; Export your editable 30-day POC plan to Word or PDF.
              </p>
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
                <span className="hero-badge">🤖 Gemma 4 Multimodal + PDF/DOCX</span>
                <span className="hero-badge">📋 Paste Anything (Ctrl+V)</span>
                <span className="hero-badge">⚖️ 30/30/20/20 Match Score</span>
                <span className="hero-badge">📘 Word &amp; 📕 PDF Export</span>
              </div>
            </div>

            <div className="upload-card">
              <UploadStep founder={founder} onComplete={handleUploadDone} />
            </div>

            <div className="disclaimer">
              ⚠️ All ecosystem records and partner profiles are <strong>illustrative</strong> for demonstration purposes.
            </div>
          </>
        )}

        {step === 2 && profile && (
          <PassportStep profile={profile} founder={founder}
            onSave={handlePassportOk} onBack={() => setStep(1)} />
        )}

        {step === 3 && profile && (
          <MatchesStep profile={profile} founder={founder}
            onSelectPartner={handlePartnerPick} onEditPassport={() => setStep(2)} />
        )}

        {step === 4 && profile && selectedPartner && (
          <BriefStep profile={profile} partner={selectedPartner} founder={founder}
            onBackToMatches={() => setStep(3)} onReset={handleReset} />
        )}
      </main>

      <footer className="footer">
        Powered by <strong>Gemma 4</strong> (open-weight AI via Gemini API) &bull;
        Open source, MIT Licence &bull; MLH Hacktoberfest KL 2026 &bull; Team BridgeWise
      </footer>
    </>
  )
}
