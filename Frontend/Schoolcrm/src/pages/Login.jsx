import logo from '../assets/dee-campus-main-logo-CKnHLXIu (1).png'

const stats = [
  {
    value: '100+',
    label: 'Schools',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 21h18M5 10h14M6 10l6-5 6 5M7 10v9M11 10v9M17 10v9M5 19h14" />
      </svg>
    ),
    tone: 'violet',
  },
  {
    value: '500K+',
    label: 'Students',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M16 21v-2a4 4 0 0 0-8 0v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    tone: 'blue',
  },
  {
    value: '99.9%',
    label: 'Uptime',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
        <path d="m9 12 2 2 4-5" />
      </svg>
    ),
    tone: 'green',
  },
]

function Icon({ children }) {
  return <span className="field-icon">{children}</span>
}

export default function Login() {
  return (
    <main className="login-page">
      <section className="brand-panel" aria-label="DEE Campus overview">
        <div className="brand-glow brand-glow-top" />
        <div className="brand-glow brand-glow-bottom" />
        <div className="dot-grid dot-grid-top" />
        <div className="dot-grid dot-grid-bottom" />

        <div className="brand-content">
          <img className="brand-logo" src={logo} alt="DEE Campus" />

          <div className="hero-copy">
            <h1>
              Empowering Schools.
              <span>Transforming <strong>Education.</strong></span>
            </h1>
            <p>
              From attendance to academics, our platform helps institutions
              manage students, teachers, fees, examinations, and communication
              from a single dashboard.
            </p>
          </div>

          <div className="stats-grid" aria-label="Platform stats">
            {stats.map((stat) => (
              <article className="stat-card" key={stat.label}>
                <div className={`stat-icon ${stat.tone}`}>{stat.icon}</div>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </article>
            ))}
          </div>

          <article className="responsibility-card">
            <div className="stat-icon violet muted">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
                <path d="m9 12 2 2 4-5" />
              </svg>
            </div>
            <div>
              <h2>Your Campus, Our Responsibility</h2>
              <p>Building smarter institutions for tomorrow.</p>
            </div>
          </article>
        </div>
      </section>

      <section className="form-panel" aria-label="Sign in form">
        <form className="login-card">
          <header>
            <h2>Welcome back</h2>
            <p>Sign in to your account to continue</p>
          </header>

          <label className="field-group">
            <span>Email Address</span>
            <div className="input-shell">
              <Icon>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4 4h16v16H4z" />
                  <path d="m22 6-10 7L2 6" />
                </svg>
              </Icon>
              <input type="email" defaultValue="admin@school.com" />
            </div>
          </label>

          <label className="field-group">
            <span>Password</span>
            <div className="input-shell">
              <Icon>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="5" y="11" width="14" height="10" rx="2" />
                  <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                </svg>
              </Icon>
              <input type="password" defaultValue="password" />
              <button className="ghost-icon" type="button" aria-label="Show password">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
            </div>
          </label>

          <div className="form-options">
            <label className="remember">
              <input type="checkbox" defaultChecked />
              <span>Remember me</span>
            </label>
            <a href="#forgot">Forgot Password?</a>
          </div>

          <button className="primary-button" type="submit">
            Sign In
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </button>

          <div className="divider"><span>or</span></div>

          <button className="parent-button" type="button">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M16 21v-2a4 4 0 0 0-8 0v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Login as Parent
          </button>

          <footer>
            <p>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
                <path d="m9 12 2 2 4-5" />
              </svg>
              Secure login powered by Deecampus ERP
            </p>
            <p>© 2026 DeeCampus ERP. All rights reserved.</p>
          </footer>
        </form>
      </section>
    </main>
  )
}
