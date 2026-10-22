import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { state, dispatch } = useApp();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      if (isSignUp) {
        if (!name || !email || !password) {
          setError('Please fill in all fields');
          setLoading(false);
          return;
        }
        if (state.users.find(u => u.email === email)) {
          setError('Email already exists');
          setLoading(false);
          return;
        }
        const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        const colors = ['#6366f1', '#06b6d4', '#f43f5e', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
        const newUser = {
          id: `u${Date.now()}`,
          name,
          email,
          password,
          role: 'Team Member',
          department: 'General',
          bio: '',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          avatar: null,
          initials,
          color: colors[Math.floor(Math.random() * colors.length)]
        };
        dispatch({ type: 'SIGNUP', payload: newUser });
        navigate('/');
      } else {
        const user = state.users.find(u => u.email === email && u.password === password);
        if (!user) {
          setError('Invalid email or password');
          setLoading(false);
          return;
        }
        dispatch({ type: 'LOGIN', payload: user });
        navigate('/');
      }
      setLoading(false);
    }, 600);
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-bg-shape shape-1" />
        <div className="auth-bg-shape shape-2" />
        <div className="auth-bg-shape shape-3" />
      </div>
      <div className="auth-container">
        <div className="auth-left">
          <div className="auth-brand">
            <div className="auth-logo">
              <svg width="48" height="48" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="8" fill="#6366f1"/>
                <path d="M8 12h16M8 16h12M8 20h8" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                <circle cx="24" cy="20" r="3" fill="white" opacity="0.8"/>
              </svg>
            </div>
            <h1>Trackify</h1>
          </div>
          <h2 className="auth-tagline">Manage your projects<br />with <span>confidence</span></h2>
          <p className="auth-description">
            A powerful project management platform designed for teams who want to ship faster, collaborate better, and stay on top of every detail.
          </p>
          <div className="auth-features">
            <div className="auth-feature">
              <div className="feature-icon">📊</div>
              <div><strong>Real-time Analytics</strong><br />Track project progress with intuitive dashboards</div>
            </div>
            <div className="auth-feature">
              <div className="feature-icon">👥</div>
              <div><strong>Team Collaboration</strong><br />Work together seamlessly across departments</div>
            </div>
            <div className="auth-feature">
              <div className="feature-icon">📅</div>
              <div><strong>Smart Scheduling</strong><br />Stay ahead of deadlines with calendar views</div>
            </div>
          </div>
        </div>

        <div className="auth-right">
          <div className="auth-card">
            <div className="auth-card-header">
              <h2>{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
              <p>{isSignUp ? 'Start managing your projects today' : 'Sign in to your workspace'}</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              {isSignUp && (
                <div className="form-group">
                  <label htmlFor="auth-name">Full Name</label>
                  <input
                    id="auth-name"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              )}
              <div className="form-group">
                <label htmlFor="auth-email">Email Address</label>
                <input
                  id="auth-email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="auth-password">Password</label>
                <input
                  id="auth-password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {error && <div className="auth-error">{error}</div>}

              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? (
                  <div className="spinner" />
                ) : isSignUp ? 'Create Account' : 'Sign In'}
              </button>
            </form>

            <div className="auth-divider"><span>or continue with</span></div>

            <div className="auth-social">
              <button className="social-btn">
                <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Google
              </button>
              <button className="social-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                GitHub
              </button>
            </div>

            <p className="auth-switch">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button type="button" onClick={() => { setIsSignUp(!isSignUp); setError(''); }}>
                {isSignUp ? 'Sign In' : 'Create Account'}
              </button>
            </p>

            <div className="auth-demo-hint">
              <p>🎯 <strong>Demo Login:</strong> Use any team member's email with password <code>demo123</code></p>
              <p style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '4px' }}>Try: alex.johnson@trackify.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
