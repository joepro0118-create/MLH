// frontend/src/App.jsx â€” BridgeWise v2.1
// Flow: Auth (Demo Login/Signup) â†’ Founder Upload â†’ Passport â†’ Matches â†’ Brief Dashboard
// UICheatSheet Rule of 3:
//   Hero    â†’ Border-beam auth card + glow upload zone
//   Micro   â†’ Shimmer skeletons + Spotlight cards + Expandable dash cards
//   Delight â†’ Confetti + Export/Copy/Download/Share toolbar + toast system
import { useState, useEffect, useRef, useCallback } from 'react'
import { analyzePitch, getMatches, getGraph, getBrief } from './api.js'
import { EcosystemGraph } from './components/EcosystemGraph.jsx'
import './index.css'

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   DEMO DATA â€” SmartTONG (Malaysia â†’ Vietnam municipal pilot)
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€*/
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
}

const DEMO_CREDENTIALS = { email: 'alex@smarttong.my', password: 'demo1234' }

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   TOAST NOTIFICATION SYSTEM
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€*/
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

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   CANVAS CONFETTI
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€*/
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

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   SCORE RING
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€*/
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

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   SPOTLIGHT CARD
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€*/
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

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   FOUNDER AVATAR
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€*/
function FounderAvatar({ founder, size = 36 }) {
  return (
    <div className="founder-avatar" style={{ width: size, height: size, fontSize: size * 0.38 }}>
      {founder.avatar || founder.name?.slice(0, 2).toUpperCase()}
    </div>
  )
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   STEP INDICATOR (steps 1-4, shown after auth)
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€*/
const STEPS = [
  { label: 'Upload', icon: 'ðŸ“' },
  { label: 'Passport', icon: 'ðŸ›‚' },
  { label: 'Matches', icon: 'ðŸ¤' },
  { label: 'Dashboard', icon: 'ðŸ“Š' },
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
              <div className="step-dot">{done ? 'âœ“' : active ? s.icon : n}</div>
              <span className="step-label">{s.label}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`step-connector ${done ? 'done' : ''}`} />}
          </div>
        )
      })}
    </div>
  )
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   AUTH SCREEN â€” Demo Login / Sign Up
   No real backend. Demo credentials pre-filled.
   Stores founder context in React state only.
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
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
      // Demo auth check
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
      {/* Left panel â€” Brand */}
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
              "From pitch deck to a signed 30-day POC outline â€” in under 4 minutes."
            </div>
            <div className="auth-quote-author">â€” PACT Demo Â· MLH Hacktoberfest KL 2026</div>
          </div>

          {/* Badges */}
          <div className="auth-badges">
            <span className="auth-badge">ðŸ¤– Gemma 4 Multimodal</span>
            <span className="auth-badge">ðŸŒ ASEAN Ecosystem</span>
            <span className="auth-badge">âš¡ Open Source Â· MIT</span>
          </div>
        </div>
      </div>

      {/* Right panel â€” Auth form */}
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
            <span className="auth-demo-label">ðŸš€ Hackathon Demo</span>
            <button className="btn-demo-auth" onClick={handleDemoLogin} disabled={loading}>
              {loading ? 'Signing inâ€¦' : 'One-Click Demo Login'}
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

            {error && <div className="error-toast" style={{ fontSize: '0.8rem' }}>âš ï¸ {error}</div>}

            <button className="btn btn-primary btn-auth-submit" type="submit" disabled={loading}>
              {loading ? (
                <><span className="auth-spinner" /> {mode === 'login' ? 'Signing inâ€¦' : 'Creating accountâ€¦'}</>
              ) : (
                mode === 'login' ? 'â†’ Sign In to BridgeWise' : 'â†’ Create Account & Continue'
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
            ðŸ”’ Demo only â€” no data stored. Open source, MIT Licence.
          </div>
        </div>
      </div>
    </div>
  )
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   STEP 1 â€” FOUNDER UPLOAD PROMPT PAGE
   Personalized with founder context. Upload 1-3 files.
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function UploadStep({ founder, onComplete }) {
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
    if (!valid.length) { setError('Please upload PNG, JPEG, or WebP images.'); return }
    setFiles((prev) => {
      const combined = [...prev, ...valid].slice(0, 3)
      if (prev.length + valid.length > 3) setError('Maximum 3 files. Kept the first 3.')
      return combined
    })
  }
  const removeFile = (idx) => setFiles((prev) => prev.filter((_, i) => i !== idx))

  const handleAnalyze = async () => {
    if (!files.length) { setError('Please upload at least 1 pitch deck or brochure image.'); return }
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
      <div className="gemma-loading-title">Gemma 4 is synthesizing your documentsâ€¦</div>
      <div className="gemma-loading-sub">Reading {files.length} file{files.length > 1 ? 's' : ''} &amp; building your Startup Passport</div>
    </div>
  )

  return (
    <div className="upload-page">
      {/* Personalized founder welcome bar */}
      <div className="founder-welcome-bar">
        <div className="fwb-left">
          <FounderAvatar founder={founder} size={44} />
          <div>
            <div className="fwb-greeting">Good to see you, <strong>{founder.name.split(' ')[0]}</strong> ðŸ‘‹</div>
            <div className="fwb-company">{founder.company} &bull; {founder.country} &bull; {founder.role}</div>
          </div>
        </div>
        <div className="fwb-cta-label">Ready to find your ASEAN cross-border partner?</div>
      </div>

      {/* Section title */}
      <div className="upload-section-header">
        <div className="ush-step-pill">Step 1 of 4</div>
        <h2 className="ush-title">Upload Your Pitch Materials</h2>
        <p className="ush-sub">
          Upload 1â€“3 files (pitch deck slides, brochures, flyers). Gemma 4 reads them all together
          and builds a single unified Startup Passport for matching.
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
            <div className="upload-icon-bg">ðŸ“‘</div>
            <div className="upload-label">
              {files.length > 0 ? `${files.length} of 3 file${files.length > 1 ? 's' : ''} selected` : 'Drop your pitch materials here'}
            </div>
            <div className="upload-hint">PNG, JPG, WEBP Â· Up to 5 MB each Â· Up to 3 files</div>
            <div className="upload-browse-pill">Click or drag &amp; drop</div>
            <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp"
              multiple className="upload-input" onChange={(e) => addFiles(e.target.files)} />
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div className="uploaded-files-list" style={{ marginTop: '0.85rem' }}>
              {files.map((f, i) => (
                <div key={i} className="file-chip">
                  <span className="file-name">ðŸ“„ {f.name}</span>
                  <span className="file-size">({(f.size / 1024).toFixed(0)} KB)</span>
                  <button className="btn-chip-remove" type="button"
                    onClick={(e) => { e.stopPropagation(); removeFile(i) }}>âœ•</button>
                </div>
              ))}
            </div>
          )}

          {/* File count indicator */}
          <div className="file-count-bar">
            {[0, 1, 2].map((i) => (
              <div key={i} className={`file-count-dot ${i < files.length ? 'filled' : ''}`} />
            ))}
            <span className="file-count-label">{files.length}/3 files uploaded</span>
          </div>
        </div>

        {/* Right: Founder context options */}
        <div className="upload-options-panel">
          <div className="uop-header">
            <span className="uop-icon">ðŸŽ¯</span>
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
            <label className="form-label">Founder Note <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
            <textarea className="form-textarea" rows="3"
              placeholder={`Hi, I'm ${founder.name.split(' ')[0]} from ${founder.company}. We want to test our IoT route optimization for 50 municipal bins in District 1, Ho Chi Minh City...`}
              value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          {/* Gemma info box */}
          <div className="gemma-info-box">
            <div className="gib-icon">âœ¦</div>
            <div>
              <div className="gib-title">Powered by Gemma 4 Vision</div>
              <div className="gib-desc">Gemma reads all your files together and extracts a unified Startup Passport â€” then our deterministic engine ranks the best ASEAN partners.</div>
            </div>
          </div>
        </div>
      </div>

      {error && <div className="error-toast">âš ï¸ {error}</div>}

      {/* CTA row */}
      <div className="upload-cta-row">
        <button className="btn btn-primary btn-large" onClick={handleAnalyze} disabled={files.length === 0}>
          <span>ðŸ¤–</span>
          <span>Analyze with Gemma 4 &amp; Build Passport</span>
        </button>
        <span className="or-pill">OR</span>
        <button className="btn btn-demo" onClick={() => onComplete(DEMO_PROFILE)}>
          <span>ðŸš€</span>
          <span>Use SmartTONG Demo</span>
        </button>
      </div>
    </div>
  )
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   STEP 2 â€” STARTUP PASSPORT (Review & Edit)
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
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
    { field: 'capabilities',      label: 'Core Capabilities',   cls: 'chip-blue',   key: 'newCap',    ph: '+ Add capabilityâ€¦' },
    { field: 'needs',             label: 'Operational Needs',   cls: 'chip-purple', key: 'newNeed',   ph: '+ Add needâ€¦' },
    { field: 'target_markets',    label: 'Target Markets',      cls: 'chip-teal',   key: 'newMarket', ph: '+ Add marketâ€¦' },
    { field: 'partnership_goals', label: 'Partnership Goals',   cls: 'chip-orange', key: 'newGoal',   ph: '+ Add goalâ€¦' },
  ]

  return (
    <div className="step-content">
      {/* Founder context bar */}
      <div className="founder-context-bar">
        <FounderAvatar founder={founder} size={32} />
        <span className="fcb-name">{founder.name}</span>
        <span className="fcb-dot">Â·</span>
        <span className="fcb-company">{founder.company}</span>
        <span className="fcb-sep" />
        <span className="fcb-step">Step 2 of 4 â€” Review &amp; refine your Startup Passport</span>
      </div>

      <div className="passport-card">
        <div className="passport-header">
          <div className="passport-badge-icon">ðŸ›‚</div>
          <div>
            <div className="passport-title">Startup Passport</div>
            <div className="passport-sub">Gemma 4 extracted this from your materials. Review, correct, and add context before partner matching.</div>
          </div>
          <div className="passport-ai-tag">âœ¦ Synthesized via Gemma 4</div>
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
                      <button type="button" onClick={() => handleRemoveChip(field, i)}>âœ•</button>
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
          <button className="btn btn-ghost" onClick={onBack}>â† Re-upload Files</button>
          <button className="btn btn-primary btn-large" onClick={() => onSave(data)}>
            <span>ðŸ¤</span><span>Confirm &amp; Find Top Partners â†’</span>
          </button>
        </div>
      </div>
    </div>
  )
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   STEP 3 â€” PARTNER MATCHES & ECOSYSTEM GRAPH
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
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
        <span className="fcb-dot">Â·</span>
        <span className="fcb-company">{founder.company}</span>
        <span className="fcb-sep" />
        <span className="fcb-step">Step 3 of 4 â€” Your top ASEAN partner matches</span>
      </div>

      <div className="profile-mini-bar">
        <div>
          <span className="mini-company">{profile.company_name}</span>
          <span className="mini-sub">
            ðŸ“ {profile.country} &bull; {profile.sector} &bull; Target: {profile.target_markets.slice(0, 2).join(', ')}
          </span>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={onEditPassport}>âœï¸ Edit Passport</button>
      </div>

      <div className="matches-header">
        <div>
          <div className="section-title">Top 3 ASEAN Partner Recommendations</div>
          <div className="section-sub">Deterministic 30/30/20/20 weighted scoring â€” industry, capabilities, markets, goals. Choose a partner to generate your 30-day POC plan.</div>
        </div>
      </div>

      {error && <div className="error-toast">âš ï¸ {error}</div>}

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
                    <div className="match-country">ðŸ“ {m.country}</div>
                  </div>
                  <ScoreRing score={m.score} />
                </div>
                <div className="match-reasons">
                  <div className="match-section-label">Why It Fits</div>
                  <ul>{(m.reasons || []).map((r, idx) =>
                    <li key={idx}><span className="reason-star">âœ¦</span>{r}</li>
                  )}</ul>
                </div>
                {m.opportunity && <div className="match-opportunity">{m.opportunity}</div>}
                <button className="btn btn-primary btn-full" onClick={() => onSelectPartner(m)}>
                  Generate Partnership Brief â†’
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

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   COLLAPSIBLE DASH CARD
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
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
          {onEdit && !editMode && <button className="dch-edit-btn" onClick={onEdit}>âœï¸ Edit</button>}
          {editMode && <button className="dch-edit-btn active" onClick={onDone}>âœ“ Done</button>}
          <button className="dch-collapse-btn" onClick={(e) => { e.stopPropagation(); setOpen((v) => !v) }}>
            {open ? 'â–²' : 'â–¼'}
          </button>
        </div>
      </div>
      <div className={`dash-card-body ${open ? '' : 'collapsed'}`}>{children}</div>
    </div>
  )
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   STEP 4 â€” BRIEF DASHBOARD
   Editable cards Â· Export Â· Copy Â· Download Â· Share Â· Layout toggle
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
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

  const eb = editedBrief || {}

  const buildText = () => [
    `PARTNERSHIP ACTION BRIEF: ${profile.company_name} Ã— ${partner.partner_name || partner.name}\n`,
    `Prepared for: ${founder.name} (${founder.role}) Â· ${founder.company}\n`,
    `Generated: ${new Date().toLocaleDateString('en-MY', { dateStyle: 'full' })}\n\n`,
    `OBJECTIVE:\n${eb.objective || ''}\n\n`,
    `COLLABORATION CONCEPT:\n${eb.collaboration_concept || eb.collaborationConcept || ''}\n\n`,
    `PROPOSED 30-DAY POC:\n${eb.proposed_poc || eb.proposedPoc || ''}\n\n`,
    `30-DAY TIMELINE:\n${(eb.timeline || []).map((t, i) => `Week ${i+1}: ${typeof t === 'string' ? t : t.task}`).join('\n')}\n\n`,
    `SUCCESS METRICS:\n${(eb.success_metrics || eb.successMetrics || []).map((m) => `â€¢ ${typeof m === 'string' ? m : m.metric}`).join('\n')}\n\n`,
    `Generated by BridgeWise with Gemma 4 Â· All records illustrative.`,
  ].join('')

  const buildMarkdown = () => [
    `# Partnership Action Brief\n`,
    `**${profile.company_name} Ã— ${partner.partner_name || partner.name}**\n\n`,
    `> Prepared for **${founder.name}** (${founder.role}), ${founder.company}  \n`,
    `> Powered by **BridgeWise + Gemma 4** Â· Generated ${new Date().toLocaleDateString()}  \n`,
    `> âš ï¸ All data illustrative â€” for demonstration purposes only\n\n`,
    `---\n\n`,
    `## ðŸŽ¯ Strategic Objective\n${eb.objective || ''}\n\n`,
    `## ðŸ¤ Collaboration Concept\n${eb.collaboration_concept || eb.collaborationConcept || ''}\n\n`,
    `## ðŸ§ª Proposed 30-Day Proof of Concept\n${eb.proposed_poc || eb.proposedPoc || ''}\n\n`,
    `## ðŸ“… 30-Day Implementation Timeline\n`,
    ...(eb.timeline || []).map((t, i) => `- **Week ${i+1}:** ${typeof t === 'string' ? t : t.task}\n`),
    `\n## ðŸ“Š Measurable Success Metrics\n`,
    ...(eb.success_metrics || eb.successMetrics || []).map((m) => `- [ ] ${typeof m === 'string' ? m : m.metric}\n`),
    `\n---\n`,
    `*PACT Â· MLH Hacktoberfest KL 2026 Â· Compatibility Score: ${partner.score}/100*`,
  ].join('')

  const handleCopy = () =>
    navigator.clipboard?.writeText(buildText())
      .then(() => showToast('ðŸ“‹ Brief copied to clipboard!', 'success'))
      .catch(() => showToast('Copy failed â€” try Download instead', 'info'))

  const handleDownloadMd = () => {
    const blob = new Blob([buildMarkdown()], { type: 'text/markdown' })
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(blob),
      download: `BridgeWise_Brief_${profile.company_name}_x_${(partner.partner_name || 'partner').replace(/\s+/g, '_')}.md`
    }); a.click(); URL.revokeObjectURL(a.href)
    showToast('ðŸ’¾ Markdown downloaded!', 'success')
  }

  const handleDownloadTxt = () => {
    const blob = new Blob([buildText()], { type: 'text/plain' })
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(blob),
      download: `BridgeWise_Brief_${profile.company_name}.txt`
    }); a.click(); URL.revokeObjectURL(a.href)
    showToast('ðŸ“„ Text file downloaded!', 'success')
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
    showToast('ðŸ“¦ JSON exported!', 'success')
  }

  const handleShare = async () => {
    const shareData = {
      title: `BridgeWise Brief: ${profile.company_name} Ã— ${partner.partner_name || partner.name}`,
      text: `${founder.name} from ${founder.company} generated an ASEAN cross-border partnership brief via BridgeWise!\n\nObjective: ${eb.objective || ''}`,
      url: window.location.href,
    }
    if (navigator.share) {
      try { await navigator.share(shareData); showToast('Shared!', 'success') } catch { /* cancelled */ }
    } else {
      await navigator.clipboard?.writeText(`${shareData.title}\n\n${shareData.text}\n${shareData.url}`)
      showToast('ðŸ”— Share link copied!', 'info')
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
        <div className="bgen-title">Gemma 4 is crafting your 30-day POC planâ€¦</div>
        <div className="bgen-sub">Formulating milestones for {profile.company_name} Ã— {partner.partner_name || partner.name}</div>
      </div>
    </div>
  )

  if (error) return (
    <div className="dash-card" style={{ padding: '2rem', textAlign: 'center' }}>
      <div className="error-toast" style={{ marginBottom: '1.5rem' }}>âš ï¸ {error}</div>
      <button className="btn btn-primary" onClick={onBackToMatches}>â† Return to Matches</button>
    </div>
  )

  return (
    <div className="brief-dashboard">
      {/* Founder context bar */}
      <div className="founder-context-bar">
        <FounderAvatar founder={founder} size={32} />
        <span className="fcb-name">{founder.name}</span>
        <span className="fcb-dot">Â·</span>
        <span className="fcb-company">{founder.company}</span>
        <span className="fcb-sep" />
        <span className="fcb-step">Step 4 of 4 â€” Your partnership action brief is ready</span>
      </div>

      {/* Dashboard header strip */}
      <div className="brief-dash-header">
        <div className="bdh-top">
          <div>
            <div className="bdh-badges">
              <span className="bdh-badge bdh-badge-success">ðŸŽ‰ Match Converted to Action Plan</span>
              <span className="bdh-badge bdh-badge-type">Municipal Pilot Agreement</span>
              <span className="bdh-badge bdh-badge-type">illustrative</span>
            </div>
            <div className="bdh-title">
              {profile.company_name}
              <span className="bdh-title-x">Ã—</span>
              {partner.partner_name || partner.name}
            </div>
            <div className="bdh-sub">ðŸ“ {partner.country} &bull; Powered by Gemma 4</div>
            <div className="bdh-score-pill">
              Compatibility Score &nbsp;<span className="bdh-score-num">{partner.score}</span>&nbsp;/ 100
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="bdh-actions">
            <div className="layout-toggle">
              <button className={`layout-btn ${layout === 'two-col' ? 'active' : ''}`}
                title="2-col layout" onClick={() => setLayout('two-col')}>âŠž</button>
              <button className={`layout-btn ${layout === 'single' ? 'active' : ''}`}
                title="Single col" onClick={() => setLayout('single')}>â˜°</button>
            </div>
            <div className="dash-divider" />
            <button className="btn-dash" onClick={handleCopy}>ðŸ“‹ Copy</button>
            <button className="btn-dash btn-dash-primary" onClick={handleDownloadMd}>ðŸ’¾ .md</button>
            <button className="btn-dash" onClick={handleDownloadTxt}>ðŸ“„ .txt</button>
            <button className="btn-dash btn-dash-export" onClick={handleExportJSON}>ðŸ“¦ JSON</button>
            <button className="btn-dash btn-dash-share" onClick={handleShare}>ðŸ”— Share</button>
            <div className="dash-divider" />
            <button className="btn-dash" onClick={onBackToMatches}>ðŸ¤ Switch</button>
            <button className="btn-dash" onClick={onReset}>ðŸ”„ Restart</button>
          </div>
        </div>
      </div>

      {/* Dashboard cards */}
      <div className="dash-grid" style={layout === 'single' ? { gridTemplateColumns: '1fr' } : {}}>

        {/* Objective â€” full width */}
        <DashCard icon="ðŸŽ¯" title="Strategic Objective" className="dash-grid-full"
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
        <DashCard icon="ðŸ¤" title="Collaboration Concept"
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
        <DashCard icon="ðŸ§ª" title="Proposed Proof of Concept"
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

        {/* 30-Day Timeline â€” full width */}
        <DashCard icon="ðŸ“…" title="30-Day Implementation Timeline" className="dash-grid-full"
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

        {/* Success Metrics â€” full width */}
        <DashCard icon="ðŸ“Š" title="Measurable Success Metrics" className="dash-grid-full"
          editMode={editingCard === 'metrics'}
          onEdit={() => setEditingCard('metrics')} onDone={() => setEditingCard(null)}>
          <div className="metrics-chips">
            {getMetrics().map((m, i) => {
              const text = typeof m === 'string' ? m : m.metric || JSON.stringify(m)
              return (
                <div key={i} className={`metric-chip ${editingCard === 'metrics' ? 'is-editing' : ''}`}>
                  <span className="metric-check">âœ“</span>
                  {editingCard === 'metrics' ? (
                    <>
                      <textarea rows={1} value={text} onChange={(e) => updateMetric(i, e.target.value)} />
                      <button onClick={() => removeMetric(i)}
                        style={{ background: 'none', border: 'none', color: '#dc2626', fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>âœ•</button>
                    </>
                  ) : text}
                </div>
              )
            })}
            {editingCard === 'metrics' && (
              <div className="metric-add-row">
                <input type="text" placeholder="+ Add success metricâ€¦"
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
          âš ï¸ All generated outcomes and partner records are <strong>illustrative</strong> for demonstration.
          Powered by Gemma 4 Â· MIT Licence.
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button className="btn btn-ghost btn-sm" onClick={handleCopy}>ðŸ“‹ Copy</button>
          <button className="btn btn-ghost btn-sm" onClick={handleDownloadMd}>ðŸ’¾ .md</button>
          <button className="btn btn-primary btn-sm" onClick={onReset}>ðŸ”„ New Analysis</button>
        </div>
      </div>

      <ToastContainer toasts={toasts} />
    </div>
  )
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   MAIN APPLICATION ROOT
   Phase 0: Auth â†’ Phase 1-4: Main flow
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
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

  /* â”€â”€ AUTH GATE â”€â”€ */
  if (!founder) return <AuthScreen onAuth={handleAuth} />

  /* â”€â”€ MAIN APP (authenticated) â”€â”€ */
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
            <button className="nav-logout-btn" onClick={handleLogout} title="Sign out">âœ•</button>
          </div>
        </div>
      </nav>

      <main className="main">
        {/* Step 1 â€” Founder Upload Prompt */}
        {step === 1 && (
          <>
            {/* Hero banner above upload */}
            <div className="hero-banner">
              <div className="hero-eyebrow">âœ¦ MLH Hacktoberfest KL 2026 &bull; Best Use of Gemma 4</div>
              <h1 className="hero-title">
                Cross-Border Expansion is Chaotic.<br />
                <span className="hero-gradient">We Automated the POC.</span>
              </h1>
              <p className="hero-sub">
                Upload your pitch deck Â· Gemma 4 builds your Startup Passport Â· 
                Discover cross-border matches Â· Get an executable 30-day POC plan.
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
                <span className="hero-badge">ðŸ¤– Gemma 4 Multimodal Vision</span>
                <span className="hero-badge">ðŸŒ ASEAN Network</span>
                <span className="hero-badge">âš–ï¸ 30/30/20/20 Match Score</span>
                <span className="hero-badge">ðŸ“‹ Editable 30-Day Plans</span>
              </div>
            </div>

            <div className="upload-card">
              <UploadStep founder={founder} onComplete={handleUploadDone} />
            </div>

            <div className="disclaimer">
              âš ï¸ All ecosystem records and partner profiles are <strong>illustrative</strong> for demonstration purposes.
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

