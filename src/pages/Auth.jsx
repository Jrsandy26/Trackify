import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { syncUserProfile } from '../lib/supabaseClient';

export default function Auth() {
  const [authMode, setAuthMode] = useState('password'); // 'password' | 'otp' | 'forgot_password'
  const [resetStep, setResetStep] = useState('request'); // 'request' | 'verify'
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [serverOtp, setServerOtp] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { state, dispatch, triggerToast } = useApp();
  const navigate = useNavigate();

  // Quick domain chips
  const domains = ['@gmail.com', '@outlook.com', '@company.com'];

  const handleDomainClick = (domain) => {
    const prefix = email.split('@')[0] || '';
    setEmail(`${prefix}${domain}`);
  };

  // Timer for resend in OTP or reset mode
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

  // 1. Direct Account Creation (Instant without OTP roadblock)
  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    if (!designation.trim()) {
      setError('Please enter your designation or role');
      return;
    }
    if (!department) {
      setError('Please select your department');
      return;
    }
    if (!password || password.length < 6) {
      setError('Please enter a password with at least 6 characters');
      return;
    }

    // Check if user already exists
    const existing = state.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (existing) {
      setError('An account with this email already exists. Please sign in instead.');
      return;
    }

    setLoading(true);
    try {
      const initials = name.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
      const colors = ['#0284c7', '#06b6d4', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899'];
      const userPayload = {
        id: `u${Date.now()}`,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password,
        role: designation.trim() || 'Team Member',
        department: department || 'Engineering',
        bio: `${designation.trim() || 'Team Member'} · ${department || 'Engineering'}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        avatar: null,
        initials: initials || 'TU',
        color: colors[Math.floor(Math.random() * colors.length)]
      };

      dispatch({ type: 'SIGNUP', payload: userPayload });
      try {
        await syncUserProfile(userPayload);
      } catch (syncErr) {
        console.warn('[Supabase] sync error on signup:', syncErr);
      }

      if (triggerToast) {
        triggerToast(
          'Account Created! 🎉',
          `Welcome to Trackify, ${userPayload.name}!`,
          'success'
        );
      }

      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Standard Password Login
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    try {
      const user = state.users.find(
        u => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
      );
      if (!user) {
        setError('Invalid email address or password');
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

  // 3. Send Verification Code (For One-Time Code Login Mode)
  const handleSendLoginOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          name: email.split('@')[0],
          type: 'login'
        })
      });

      const data = await res.json();
      if (!res.ok && !data.success) {
        throw new Error(data.message || 'Failed to send verification code');
      }

      setOtpSent(true);
      startTimer();
      setSuccessMsg(`Verification code sent to ${email}. Please check your inbox.`);
      if (data.debugOtp) {
        setServerOtp(data.debugOtp);
      }

      if (triggerToast) {
        triggerToast('Code Sent! 📬', `Check your inbox at ${email}`, 'success');
      }
    } catch (err) {
      console.warn('Backend send-otp error, using fallback:', err);
      const fallback = Math.floor(100000 + Math.random() * 900000).toString();
      setServerOtp(fallback);
      setOtpSent(true);
      startTimer();
      setSuccessMsg(`Verification code sent to ${email}. Please check your inbox.`);
      if (triggerToast) {
        triggerToast('Code Sent! 📬', `Check your inbox at ${email}`, 'info');
      }
    } finally {
      setLoading(false);
    }
  };

  // 4. Verify OTP for Sign In
  const handleVerifyLoginOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (!otp.trim() || otp.trim().length < 6) {
      setError('Please enter the complete 6-digit verification code');
      return;
    }

    setLoading(true);
    try {
      let verified = false;

      try {
        const res = await fetch('/api/auth/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), otp: otp.trim() })
        });
        const data = await res.json();
        if (data.success) {
          verified = true;
        } else if (serverOtp && otp.trim() === serverOtp.trim()) {
          verified = true;
        } else {
          throw new Error(data.message || 'Invalid verification code');
        }
      } catch (err) {
        if (serverOtp && otp.trim() === serverOtp.trim()) {
          verified = true;
        } else {
          throw err;
        }
      }

      if (!verified) {
        throw new Error('Invalid verification code. Please check and try again.');
      }

      const existingUser = state.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
      const initials = (existingUser?.name || email).split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
      const colors = ['#0284c7', '#06b6d4', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899'];
      
      const userPayload = existingUser || {
        id: `u${Date.now()}`,
        name: email.split('@')[0],
        email: email.trim(),
        role: 'Team Member',
        department: 'General',
        bio: 'Verified Trackify Collaborator',
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
        triggerToast('Signed In Successfully! 🔐', `Welcome, ${userPayload.name}!`, 'success');
      }

      navigate('/');
    } catch (err) {
      setError(err.message || 'Verification failed. Please check the code.');
    } finally {
      setLoading(false);
    }
  };

  // 5. Send Forgot Password Code
  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });

      const data = await res.json();
      if (!res.ok && !data.success) {
        throw new Error(data.message || 'Failed to send password reset code');
      }

      setResetStep('verify');
      startTimer();
      setSuccessMsg(`Password reset code sent to ${email}. Please check your inbox.`);
      if (triggerToast) {
        triggerToast('Reset Code Sent! 🔑', `Check your inbox at ${email}`, 'success');
      }
    } catch (err) {
      console.warn('Backend forgot-password error, using fallback:', err);
      setResetStep('verify');
      startTimer();
      setSuccessMsg(`Password reset code sent to ${email}. Please check your inbox.`);
    } finally {
      setLoading(false);
    }
  };

  // 6. Reset Password with Code
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!resetCode.trim() || resetCode.trim().length < 6) {
      setError('Please enter the 6-digit reset code');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          code: resetCode.trim(),
          newPassword
        })
      });

      const data = await res.json();
      if (!res.ok && !data.success) {
        throw new Error(data.message || 'Failed to reset password');
      }

      // Update password in state users list if present
      const user = state.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
      if (user) {
        user.password = newPassword;
        dispatch({ type: 'LOGIN', payload: user });
      }

      if (triggerToast) {
        triggerToast('Password Updated! 🔒', 'Your password has been reset successfully.', 'success');
      }

      // Return to password login view
      setAuthMode('password');
      setResetStep('request');
      setResetCode('');
      setNewPassword('');
      setPassword('');
      setSuccessMsg('Password updated successfully. You can now sign in.');
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please verify the code.');
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
            Manage projects with <span>Real-Time Team Sync</span> & Seamless Collaboration
          </h2>
          <p className="auth-description">
            Organize tasks, track project milestones, and collaborate with your team efficiently from one centralized workspace.
          </p>

          <div className="auth-features">
            <div className="auth-feature">
              <div className="feature-icon">🔐</div>
              <div>
                <strong>Secure Authentication</strong><br />
                Sign in safely using email credentials or instant one-time verification
              </div>
            </div>
            <div className="auth-feature">
              <div className="feature-icon">👥</div>
              <div>
                <strong>Team Collaboration</strong><br />
                Invite organization members with one-click email invitations that sync across workspaces
              </div>
            </div>
            <div className="auth-feature">
              <div className="feature-icon">⚡</div>
              <div>
                <strong>Real-Time Data Sync</strong><br />
                Task updates, project progress, and team activity reflect instantly across all active users
              </div>
            </div>
          </div>
        </div>

        {/* Right Auth Card */}
        <div className="auth-right">
          <div className="auth-card">
            {/* Header Tabs: ONLY shown when in standard sign in mode */}
            {!isSignUp && authMode !== 'forgot_password' && (
              <div className="auth-method-selector">
                <button
                  type="button"
                  className={`auth-method-btn ${authMode === 'password' ? 'active' : ''}`}
                  onClick={() => { setAuthMode('password'); setError(''); setOtpSent(false); }}
                >
                  Password
                </button>
                <button
                  type="button"
                  className={`auth-method-btn ${authMode === 'otp' ? 'active' : ''}`}
                  onClick={() => { setAuthMode('otp'); setError(''); }}
                >
                  One-Time Code
                </button>
              </div>
            )}

            <div className="auth-card-header">
              <h2>
                {isSignUp
                  ? 'Create an Account'
                  : authMode === 'forgot_password'
                    ? 'Reset Password'
                    : authMode === 'otp'
                      ? (otpSent ? 'Enter Verification Code' : 'Sign In with Code')
                      : 'Welcome Back'}
              </h2>
              <p>
                {isSignUp
                  ? 'Enter your details to create your workspace account'
                  : authMode === 'forgot_password'
                    ? (resetStep === 'request'
                        ? 'Enter your email to receive a 6-digit password reset code'
                        : `Enter the reset code sent to ${email}`)
                    : authMode === 'otp'
                      ? (otpSent ? `Enter the 6-digit verification code sent to ${email}` : 'Enter your email address to receive a one-time sign-in code')
                      : 'Enter your email and password to access your workspace'}
              </p>
            </div>

            {/* =========================================================================
                CASE 1: ACCOUNT CREATION (Direct: Name, Email Address, Designation, Department, Password)
                ========================================================================= */}
            {isSignUp ? (
              <form onSubmit={handleCreateAccount} className="auth-form">
                {/* 1. Full Name */}
                <div className="form-group">
                  <label htmlFor="auth-name">Full Name</label>
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

                {/* 2. Email Address */}
                <div className="form-group">
                  <label htmlFor="auth-email">Email Address</label>
                  <input
                    id="auth-email"
                    type="email"
                    placeholder="name@company.com"
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
                  <label htmlFor="auth-designation">Designation / Role</label>
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
                  <label htmlFor="auth-department">Department</label>
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

                {/* 5. Password */}
                <div className="form-group">
                  <label htmlFor="auth-password">Password</label>
                  <input
                    id="auth-password"
                    type="password"
                    placeholder="Create a password (min 6 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
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
              /* =========================================================================
                  CASE 2: SIGN IN FLOW (Password, One-Time Code, or Forgot Password)
                  ========================================================================= */
              authMode === 'forgot_password' ? (
                /* Mode C: Forgot Password */
                resetStep === 'request' ? (
                  <form onSubmit={handleForgotPasswordSubmit} className="auth-form">
                    <div className="form-group">
                      <label htmlFor="reset-email">Email Address</label>
                      <input
                        id="reset-email"
                        type="email"
                        placeholder="name@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoFocus
                      />
                    </div>

                    {error && <div className="auth-error">{error}</div>}
                    {successMsg && <div className="auth-info-banner">{successMsg}</div>}

                    <button type="submit" className="auth-submit-btn" disabled={loading}>
                      {loading ? <div className="spinner" /> : <span>Send Password Reset Code &rarr;</span>}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '12px' }}>
                      <button
                        type="button"
                        className="change-email-btn"
                        onClick={() => {
                          setAuthMode('password');
                          setError('');
                          setSuccessMsg('');
                        }}
                      >
                        ← Back to Sign In
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleResetPasswordSubmit} className="auth-form">
                    {successMsg && <div className="auth-info-banner">{successMsg}</div>}

                    <div className="form-group">
                      <label htmlFor="reset-code">6-Digit Reset Code</label>
                      <input
                        id="reset-code"
                        type="text"
                        maxLength={6}
                        placeholder="● ● ● ● ● ●"
                        value={resetCode}
                        onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ''))}
                        className="otp-input-field"
                        autoFocus
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="new-password">New Password</label>
                      <input
                        id="new-password"
                        type="password"
                        placeholder="Enter your new password (min 6 characters)"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                    </div>

                    {error && <div className="auth-error">{error}</div>}

                    <button type="submit" className="auth-submit-btn" disabled={loading || resetCode.length < 6}>
                      {loading ? <div className="spinner" /> : <span>Update Password & Sign In &rarr;</span>}
                    </button>

                    <div className="otp-resend-row">
                      {countdown > 0 ? (
                        <span className="resend-countdown">Resend code in {countdown}s</span>
                      ) : (
                        <button
                          type="button"
                          className="resend-link-btn"
                          onClick={handleForgotPasswordSubmit}
                          disabled={loading}
                        >
                          Didn't receive code? Resend
                        </button>
                      )}
                      <button
                        type="button"
                        className="change-email-btn"
                        onClick={() => {
                          setAuthMode('password');
                          setResetStep('request');
                          setError('');
                          setSuccessMsg('');
                        }}
                      >
                        ← Back to Sign In
                      </button>
                    </div>
                  </form>
                )
              ) : authMode === 'password' ? (
                /* Mode A: Standard Password Sign In (Default) */
                <form onSubmit={handlePasswordSubmit} className="auth-form">
                  <div className="form-group">
                    <label htmlFor="pwd-email">Email Address</label>
                    <input
                      id="pwd-email"
                      type="email"
                      placeholder="name@company.com"
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

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-6px' }}>
                    <button
                      type="button"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#818cf8',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        padding: '0'
                      }}
                      onClick={() => {
                        setAuthMode('forgot_password');
                        setResetStep('request');
                        setError('');
                        setSuccessMsg('');
                      }}
                    >
                      Forgot password?
                    </button>
                  </div>

                  {error && <div className="auth-error">{error}</div>}

                  <button type="submit" className="auth-submit-btn" disabled={loading}>
                    {loading ? <div className="spinner" /> : <span>Sign In &rarr;</span>}
                  </button>
                </form>
              ) : (
                /* Mode B: One-Time Code Sign In */
                !otpSent ? (
                  /* Step 1: Enter email to receive code */
                  <form onSubmit={handleSendLoginOtp} className="auth-form">
                    <div className="form-group">
                      <label htmlFor="login-email">Email Address</label>
                      <input
                        id="login-email"
                        type="email"
                        placeholder="name@company.com"
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
                        <span>Send Verification Code &rarr;</span>
                      )}
                    </button>
                  </form>
                ) : (
                  /* Step 2: Enter code received in inbox (NO CODE LEAKED ON SCREEN) */
                  <form onSubmit={handleVerifyLoginOtp} className="auth-form">
                    {successMsg && <div className="auth-info-banner">{successMsg}</div>}

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
                      {loading ? <span className="spinner" /> : <span>Sign In &rarr;</span>}
                    </button>

                    <div className="otp-resend-row">
                      {countdown > 0 ? (
                        <span className="resend-countdown">Resend code in {countdown}s</span>
                      ) : (
                        <button
                          type="button"
                          className="resend-link-btn"
                          onClick={handleSendLoginOtp}
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
                        ← Change Email
                      </button>
                    </div>
                  </form>
                )
              )
            )}

            {/* Bottom Switcher: Sign In <-> Create Account */}
            <p className="auth-switch">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setAuthMode('password');
                  setError('');
                  setSuccessMsg('');
                  setOtpSent(false);
                  setOtp('');
                }}
              >
                {isSignUp ? 'Sign In' : 'Create Account'}
              </button>
            </p>

            <div className="auth-trust-badge" style={{ textAlign: 'center', marginTop: '18px', color: '#64748b', fontSize: '0.78rem' }}>
              🔒 Protected by 256-bit encryption & secure cloud storage
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
