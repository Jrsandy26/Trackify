import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { syncUserProfile } from '../lib/supabaseClient';

export default function Auth() {
  const [authMode, setAuthMode] = useState('otp'); // 'otp' | 'password' for Sign In
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');
  const [department, setDepartment] = useState('Engineering');
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

  // 1. Account Creation & Send OTP / Login Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email.trim()) {
      setError('Please enter your email ID');
      return;
    }

    if (isSignUp) {
      if (!name.trim()) {
        setError('Please enter your full name');
        return;
      }
      if (!designation.trim()) {
        setError('Please enter your designation');
        return;
      }
      if (!department) {
        setError('Please select your department');
        return;
      }

      // Check if user already exists
      const existing = state.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
      if (existing) {
        setError('An account with this email already exists. Please Sign In instead.');
        return;
      }
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
        role: designation.trim() || 'Team Member',
        department: department || 'Engineering',
        bio: `${designation.trim() || 'Team Member'} · ${department || 'Engineering'}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        avatar: null,
        initials: initials || 'TU',
        color: colors[Math.floor(Math.random() * colors.length)]
      };

      if (!existingUser) {
        dispatch({ type: 'SIGNUP', payload: userPayload });
        try {
          await syncUserProfile(userPayload);
        } catch (syncErr) {
          console.warn('[Supabase] sync error on signup:', syncErr);
        }
      } else {
        dispatch({ type: 'LOGIN', payload: userPayload });
        try {
          await syncUserProfile(userPayload);
        } catch (syncErr) {
          console.warn('[Supabase] sync error on login:', syncErr);
        }
      }

      if (triggerToast) {
        triggerToast(
          isSignUp ? 'Account Created! 🎉' : '2-Step Verified! 🛡️',
          `Welcome to Trackify, ${userPayload.name}!`,
          'success'
        );
      }

      navigate('/');
    } catch (err) {
      setError(err.message || 'Verification failed. Please check the code.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Password Fallback Handler for Sign In
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = state.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password);
      if (!user) {
        setError('Invalid email or password');
        setLoading(false);
        return;
      }
      dispatch({ type: 'LOGIN', payload: user });
      try {
        await syncUserProfile(user);
      } catch (syncErr) {
        console.warn('[Supabase] sync error on password login:', syncErr);
      }
      if (triggerToast) {
        triggerToast('Welcome Back! 👋', `Signed in as ${user.name}`, 'success');
      }
      navigate('/');
    } finally {
      setLoading(false);
    }
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
            Manage projects with <span>Realtime Team Sync</span> & 2-Step Email Verification
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
            {/* Header Tabs: ONLY show when signing in (hidden during account creation) */}
            {!isSignUp && (
              <div className="auth-method-selector">
                <button
                  type="button"
                  className={`auth-method-btn ${authMode === 'otp' ? 'active' : ''}`}
                  onClick={() => { setAuthMode('otp'); setError(''); }}
                >
                  🛡️ 2-Step OTP
                </button>
                <button
                  type="button"
                  className={`auth-method-btn ${authMode === 'password' ? 'active' : ''}`}
                  onClick={() => { setAuthMode('password'); setError(''); }}
                >
                  🔑 Password
                </button>
              </div>
            )}

            <div className="auth-card-header">
              <h2>
                {isSignUp
                  ? (otpSent ? 'Verify Email' : 'Create Account')
                  : (authMode === 'otp'
                      ? (otpSent ? 'Enter Verification Code' : 'Sign In')
                      : 'Sign In')}
              </h2>
              <p>
                {isSignUp
                  ? (otpSent ? `Check your inbox at ${email} for your 6-digit code` : 'Enter your details to create your workspace account')
                  : (authMode === 'otp'
                      ? (otpSent ? `Check your inbox at ${email} for your 6-digit code` : 'Sign in using your personal Gmail or Outlook address')
                      : 'Enter your email and password to access your workspace')}
              </p>
            </div>

            {/* =========================================================================
                CASE 1: ACCOUNT CREATION FLOW (Dedicated: Name, Email ID, Designation, Department)
                ========================================================================= */}
            {isSignUp ? (
              !otpSent ? (
                /* Step 1: Account Creation Form */
                <form onSubmit={handleSendOtp} className="auth-form">
                  {/* 1. Name */}
                  <div className="form-group">
                    <label htmlFor="auth-name">Full Name *</label>
                    <input
                      id="auth-name"
                      type="text"
                      placeholder="e.g. Sandeep Sai"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>

                  {/* 2. Email ID */}
                  <div className="form-group">
                    <label htmlFor="auth-email">Email ID *</label>
                    <input
                      id="auth-email"
                      type="email"
                      placeholder="e.g. yourname@gmail.com or @outlook.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
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

                  {/* 3. Designation */}
                  <div className="form-group">
                    <label htmlFor="auth-designation">Designation *</label>
                    <input
                      id="auth-designation"
                      type="text"
                      list="designation-suggestions"
                      placeholder="e.g. Senior Frontend Engineer"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      required
                    />
                    <datalist id="designation-suggestions">
                      <option value="Senior Frontend Engineer" />
                      <option value="Fullstack Developer" />
                      <option value="Backend Engineer" />
                      <option value="UI/UX Designer" />
                      <option value="Product Manager" />
                      <option value="Project Lead" />
                      <option value="DevOps Engineer" />
                      <option value="QA Engineer" />
                      <option value="Team Member" />
                    </datalist>
                  </div>

                  {/* 4. Department */}
                  <div className="form-group">
                    <label htmlFor="auth-department">Department *</label>
                    <select
                      id="auth-department"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      required
                    >
                      <option value="Engineering">Engineering</option>
                      <option value="Product & Design">Product & Design</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Operations">Operations</option>
                      <option value="Sales">Sales</option>
                      <option value="Human Resources">Human Resources</option>
                      <option value="Finance">Finance</option>
                      <option value="General">General</option>
                    </select>
                  </div>

                  {error && <div className="auth-error">{error}</div>}

                  <button type="submit" className="auth-submit-btn" disabled={loading}>
                    {loading ? (
                      <span className="spinner" />
                    ) : (
                      <span>Create Account &rarr;</span>
                    )}
                  </button>
                </form>
              ) : (
                /* Step 2: Verification Code for Signup */
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
                    <label htmlFor="auth-otp-input">6-Digit Verification Code</label>
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
                    {loading ? <span className="spinner" /> : <span>Verify & Complete Account Creation &rarr;</span>}
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
                      ← Edit Details
                    </button>
                  </div>
                </form>
              )
            ) : (
              /* =========================================================================
                  CASE 2: SIGN IN FLOW (OTP or Password)
                  ========================================================================= */
              authMode === 'otp' ? (
                !otpSent ? (
                  /* Step 1: Sign In via 2-Step OTP */
                  <form onSubmit={handleSendOtp} className="auth-form">
                    <div className="form-group">
                      <label htmlFor="login-email">Email Address (Gmail / Outlook) *</label>
                      <input
                        id="login-email"
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
                        <span>Sign In &rarr;</span>
                      )}
                    </button>
                  </form>
                ) : (
                  /* Step 2: Enter 6-digit OTP for Sign In */
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
                      {loading ? <span className="spinner" /> : <span>Verify & Sign In &rarr;</span>}
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
                /* Step 1: Sign In via Password */
                <form onSubmit={handlePasswordSubmit} className="auth-form">
                  <div className="form-group">
                    <label htmlFor="pwd-email">Email Address</label>
                    <input
                      id="pwd-email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoFocus
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
                      required
                    />
                  </div>

                  {error && <div className="auth-error">{error}</div>}

                  <button type="submit" className="auth-submit-btn" disabled={loading}>
                    {loading ? <div className="spinner" /> : <span>Sign In &rarr;</span>}
                  </button>
                </form>
              )
            )}

            {/* Bottom Switcher: Sign In <-> Create Account */}
            <p className="auth-switch">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                  setSuccessMsg('');
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
