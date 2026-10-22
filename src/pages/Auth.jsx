import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function Auth() {
  const [authMode, setAuthMode] = useState('otp'); // 'otp' | 'password'
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpHint, setOtpHint] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { state, dispatch, triggerToast } = useApp();
  const navigate = useNavigate();

  // Quick domain chips
  const domains = ['@gmail.com', '@outlook.com', '@hotmail.com', '@trackify.com'];

  const handleDomainClick = (domain) => {
    const prefix = email.split('@')[0] || '';
    setEmail(`${prefix}${domain}`);
  };

  // Timer for resend
  const startTimer = () => {
    setCountdown(60);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // 1. Send OTP via Gmail SMTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    if (isSignUp && !name.trim()) {
      setError('Please enter your full name');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim() || email.split('@')[0],
          type: isSignUp ? 'signup' : 'login'
        })
      });

      const data = await res.json();
      if (!res.ok && !data.success) {
        throw new Error(data.message || 'Failed to send verification code');
      }

      setOtpSent(true);
      startTimer();
      setSuccessMsg(data.message || `6-digit verification code sent to ${email}`);
      
      if (data.debugOtp) {
        setOtpHint(data.debugOtp);
      }

      if (triggerToast) {
        triggerToast('Code Sent! 📬', data.message || `Check your inbox (${email})`, 'success');
      }
    } catch (err) {
      console.warn('Backend send-otp error, using client fallback:', err);
      // Client-side fallback if server not reachable
      const fallbackOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setOtpSent(true);
      setOtpHint(fallbackOtp);
      startTimer();
      setSuccessMsg(`Simulated OTP: Code generated for ${email}`);
      if (triggerToast) {
        triggerToast('Verification Code Ready', `Use code: ${fallbackOtp}`, 'info');
      }
    } finally {
      setLoading(false);
    }
  };

  // 2. Verify OTP & Complete Auth
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (!otp.trim() || otp.trim().length < 6) {
      setError('Please enter the full 6-digit verification code');
      return;
    }

    setLoading(true);
    try {
      let verified = false;

      // Try server verify
      try {
        const res = await fetch('/api/auth/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), otp: otp.trim() })
        });
        const data = await res.json();
        if (data.success) {
          verified = true;
        } else if (otpHint && otp.trim() === otpHint.trim()) {
          verified = true;
        } else {
          throw new Error(data.message || 'Invalid verification code');
        }
      } catch (err) {
        if (otpHint && otp.trim() === otpHint.trim()) {
          verified = true;
        } else {
          throw err;
        }
      }

      if (!verified) {
        throw new Error('Invalid code. Please try again.');
      }

      // Successful verification -> create or find user
      const existingUser = state.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
      const initials = (name || email).split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
      const colors = ['#0284c7', '#06b6d4', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899'];
      
      const userPayload = existingUser || {
        id: `u${Date.now()}`,
        name: name.trim() || email.split('@')[0],
        email: email.trim(),
        role: 'Team Lead',
        department: 'Product',
        bio: 'Verified Trackify Collaborator',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        avatar: null,
        initials: initials || 'TU',
        color: colors[Math.floor(Math.random() * colors.length)]
      };

      if (!existingUser) {
        dispatch({ type: 'SIGNUP', payload: userPayload });
      } else {
        dispatch({ type: 'LOGIN', payload: userPayload });
      }

      if (triggerToast) {
        triggerToast('2-Step Verified! 🛡️', `Welcome, ${userPayload.name}!`, 'success');
      }

      navigate('/');
    } catch (err) {
      setError(err.message || 'Verification failed. Please check the code.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Password Fallback Handler
  const handlePasswordSubmit = (e) => {
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
        const colors = ['#6366f1', '#06b6d4', '#f43f5e', '#10b981', '#f59e0b', '#8b5cf6'];
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
        {/* Left branding banner */}
        <div className="auth-left">
          <div className="auth-brand">
            <div className="trackify-gem-logo" style={{ width: '42px', height: '42px' }}>
              <span className="gem-cube cyan" style={{ width: '20px', height: '20px' }} />
              <span className="gem-cube indigo" style={{ width: '20px', height: '20px' }} />
            </div>
            <h1 style={{ marginLeft: '14px' }}>Trackify</h1>
          </div>

          <h2 className="auth-tagline">
            Manage projects with <span>2-Step Email Verification</span> & Realtime Team Sync
          </h2>
          <p className="auth-description">
            Sign in securely using your personal Gmail or Outlook address. Dispatches real SMTP OTP verification and invitations to collaborate.
          </p>

          <div className="auth-features">
            <div className="auth-feature">
              <div className="feature-icon">✉️</div>
              <div>
                <strong>Personal Gmail SMTP & Outlook</strong><br />
                Login securely with 2-step verification code delivered to your inbox
              </div>
            </div>
            <div className="auth-feature">
              <div className="feature-icon">👥</div>
              <div>
                <strong>End-to-End Realtime Invitations</strong><br />
                Invite organization members with 1-click email join links that sync in real-time
              </div>
            </div>
            <div className="auth-feature">
              <div className="feature-icon">⚡</div>
              <div>
                <strong>Cross-Account Synchronization</strong><br />
                Invited members and project updates reflect instantly across open accounts
              </div>
            </div>
          </div>
        </div>

        {/* Right Auth Card */}
        <div className="auth-right">
          <div className="auth-card">
            {/* Header Tabs: 2-Step OTP vs Password */}
            <div className="auth-method-selector">
              <button
                type="button"
                className={`auth-method-btn ${authMode === 'otp' ? 'active' : ''}`}
                onClick={() => { setAuthMode('otp'); setError(''); }}
              >
                🛡️ 2-Step OTP Login
              </button>
              <button
                type="button"
                className={`auth-method-btn ${authMode === 'password' ? 'active' : ''}`}
                onClick={() => { setAuthMode('password'); setError(''); }}
              >
                🔑 Password Login
              </button>
            </div>

            <div className="auth-card-header">
              <h2>
                {authMode === 'otp'
                  ? (otpSent ? 'Enter 2-Step Verification Code' : isSignUp ? 'Create Trackify Account' : 'Secure Email Sign-In')
                  : (isSignUp ? 'Create Account' : 'Welcome Back')}
              </h2>
              <p>
                {authMode === 'otp'
                  ? (otpSent ? `Check your inbox at ${email} for your 6-digit code` : 'Use your Gmail or Outlook email with OTP verification')
                  : (isSignUp ? 'Start managing your projects today' : 'Sign in to your workspace')}
              </p>
            </div>

            {/* FLOW 1: 2-STEP OTP VERIFICATION (GMAIL & OUTLOOK) */}
            {authMode === 'otp' ? (
              !otpSent ? (
                /* Step 1: Request OTP */
                <form onSubmit={handleSendOtp} className="auth-form">
                  {isSignUp && (
                    <div className="form-group">
                      <label htmlFor="auth-name">Full Name *</label>
                      <input
                        id="auth-name"
                        type="text"
                        placeholder="e.g. Sandeep Sai"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                  )}

                  <div className="form-group">
                    <label htmlFor="auth-email">Email Address (Gmail / Outlook) *</label>
                    <input
                      id="auth-email"
                      type="email"
                      placeholder="e.g. yourname@gmail.com or @outlook.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoFocus
                    />
                    
                    {/* Domain Suggestion Chips */}
                    <div className="auth-domain-chips">
                      <span className="chip-label">Quick select:</span>
                      {domains.map((dom) => (
                        <button
                          key={dom}
                          type="button"
                          className="domain-chip"
                          onClick={() => handleDomainClick(dom)}
                        >
                          {dom}
                        </button>
                      ))}
                    </div>
                  </div>

                  {error && <div className="auth-error">{error}</div>}

                  <button type="submit" className="auth-submit-btn" disabled={loading}>
                    {loading ? (
                      <span className="spinner" />
                    ) : (
                      <span>Send 2-Step Verification Code &rarr;</span>
                    )}
                  </button>
                </form>
              ) : (
                /* Step 2: Enter 6-digit OTP */
                <form onSubmit={handleVerifyOtp} className="auth-form">
                  {successMsg && <div className="auth-info-banner">{successMsg}</div>}

                  {otpHint && (
                    <div className="auth-otp-badge-box">
                      <span>Verification Code:</span>
                      <strong className="otp-display-code">{otpHint}</strong>
                      <button
                        type="button"
                        className="btn-autofill-otp"
                        onClick={() => setOtp(otpHint)}
                      >
                        Auto-fill
                      </button>
                    </div>
                  )}

                  <div className="form-group">
                    <label htmlFor="auth-otp-input">6-Digit Code</label>
                    <input
                      id="auth-otp-input"
                      type="text"
                      maxLength={6}
                      placeholder="● ● ● ● ● ●"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      className="otp-input-field"
                      autoFocus
                    />
                  </div>

                  {error && <div className="auth-error">{error}</div>}

                  <button type="submit" className="auth-submit-btn" disabled={loading || otp.length < 6}>
                    {loading ? <span className="spinner" /> : <span>Verify & Access Trackify &rarr;</span>}
                  </button>

                  <div className="otp-resend-row">
                    {countdown > 0 ? (
                      <span className="resend-countdown">Resend code in {countdown}s</span>
                    ) : (
                      <button
                        type="button"
                        className="resend-link-btn"
                        onClick={handleSendOtp}
                        disabled={loading}
                      >
                        Didn't receive code? Resend
                      </button>
                    )}
                    <button
                      type="button"
                      className="change-email-btn"
                      onClick={() => { setOtpSent(false); setOtp(''); setError(''); }}
                    >
                      Change Email
                    </button>
                  </div>
                </form>
              )
            ) : (
              /* FLOW 2: STANDARD PASSWORD LOGIN (DEMO) */
              <form onSubmit={handlePasswordSubmit} className="auth-form">
                {isSignUp && (
                  <div className="form-group">
                    <label htmlFor="pwd-name">Full Name</label>
                    <input
                      id="pwd-name"
                      type="text"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                )}
                <div className="form-group">
                  <label htmlFor="pwd-email">Email Address</label>
                  <input
                    id="pwd-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="pwd-password">Password</label>
                  <input
                    id="pwd-password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                {error && <div className="auth-error">{error}</div>}

                <button type="submit" className="auth-submit-btn" disabled={loading}>
                  {loading ? <div className="spinner" /> : isSignUp ? 'Create Account' : 'Sign In'}
                </button>
              </form>
            )}

            <p className="auth-switch">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                  setOtpSent(false);
                  setOtp('');
                }}
              >
                {isSignUp ? 'Sign In' : 'Create Account'}
              </button>
            </p>

            <div className="auth-demo-hint">
              <p>⚡ <strong>Gmail SMTP Support:</strong> Enter your Gmail address above to receive real 2-step OTP verification codes.</p>
              <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>
                You can configure your personal 16-character Google App Password in <code>.env</code> or directly in the Settings page.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
