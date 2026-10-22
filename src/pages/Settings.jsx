import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  getSupabaseCredentials,
  saveSupabaseCredentials,
  isSupabaseConfigured,
  syncUserProfile
} from '../lib/supabaseClient';

const accentColors = [
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Violet', value: '#8b5cf6' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Teal', value: '#14b8a6' },
];

export default function Settings() {
  const { state, dispatch, triggerToast } = useApp();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileForm, setProfileForm] = useState({
    name: state.currentUser?.name || '',
    email: state.currentUser?.email || '',
    role: state.currentUser?.role || '',
    timezone: state.currentUser?.timezone || '',
    bio: state.currentUser?.bio || ''
  });
  const [saved, setSaved] = useState(false);

  // Supabase Cloud Storage State
  const [supabaseForm, setSupabaseForm] = useState(() => {
    const creds = getSupabaseCredentials();
    return {
      url: creds.url,
      key: creds.key,
      isConfigured: creds.isConfigured
    };
  });
  const [supabaseLoading, setSupabaseLoading] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState(null);

  // SMTP Settings State
  const [smtpConfig, setSmtpConfig] = useState({
    gmailUser: '',
    appPassword: '',
    configured: false,
    userMasked: ''
  });
  const [smtpLoading, setSmtpLoading] = useState(false);
  const [smtpResult, setSmtpResult] = useState(null);

  useEffect(() => {
    // Check initial SMTP status from server
    fetch('/api/config/smtp')
      .then(res => res.json())
      .then(data => {
        setSmtpConfig(prev => ({
          ...prev,
          configured: data.configured,
          userMasked: data.user || ''
        }));
      })
      .catch(() => {});
  }, []);

  const handleProfileSave = (e) => {
    e.preventDefault();
    dispatch({ type: 'UPDATE_PROFILE', payload: profileForm });
    if (triggerToast) triggerToast('Profile Saved', 'Your account preferences have been updated.', 'success');
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleSettingChange = (key, value) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: { [key]: value } });
    if (key === 'theme' && triggerToast) {
      triggerToast('Theme Updated', `Switched workspace to ${value} mode.`, 'info');
    }
  };

  const handleSmtpSave = async (e) => {
    e.preventDefault();
    if (!smtpConfig.gmailUser.trim() || !smtpConfig.appPassword.trim()) {
      setSmtpResult({ success: false, message: 'Please enter both your Gmail address and 16-character App Password.' });
      return;
    }

    setSmtpLoading(true);
    setSmtpResult(null);

    try {
      const res = await fetch('/api/config/smtp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gmailUser: smtpConfig.gmailUser.trim(),
          appPassword: smtpConfig.appPassword.trim()
        })
      });
      const data = await res.json();

      setSmtpResult(data);
      if (data.success) {
        setSmtpConfig(prev => ({
          ...prev,
          configured: true,
          userMasked: smtpConfig.gmailUser.trim()
        }));
        if (triggerToast) {
          triggerToast('Gmail SMTP Connected! 📬', data.message || 'Credentials verified and active.', 'success');
        }
      }
    } catch (err) {
      setSmtpResult({ success: false, message: 'Server connection error: ' + err.message });
    } finally {
      setSmtpLoading(false);
    }
  };

  const handleSupabaseSave = async (e) => {
    e.preventDefault();
    setSupabaseLoading(true);
    setSupabaseStatus(null);
    try {
      saveSupabaseCredentials(supabaseForm.url, supabaseForm.key);
      const isOk = isSupabaseConfigured();
      setSupabaseForm(prev => ({ ...prev, isConfigured: isOk }));
      if (isOk) {
        if (state.currentUser) {
          await syncUserProfile(state.currentUser);
        }
        setSupabaseStatus({ success: true, message: 'Supabase credentials saved & connected successfully!' });
        if (triggerToast) triggerToast('Supabase Connected ⚡', 'Cloud database is active and ready for sync.', 'success');
      } else {
        setSupabaseStatus({ success: false, message: 'Please provide a valid Supabase URL and Anon Key.' });
      }
    } catch (err) {
      setSupabaseStatus({ success: false, message: 'Error: ' + err.message });
    } finally {
      setSupabaseLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'smtp', label: 'Gmail SMTP & Email', icon: '✉️' },
    { id: 'storage', label: 'Database & Supabase', icon: '⚡' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'appearance', label: 'Appearance', icon: '🎨' },
  ];

  return (
    <div className="settings-page">
      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <p className="page-subtitle">Manage your account preferences, Gmail SMTP integration, and application settings</p>
        </div>
      </div>

      <div className="settings-layout">
        <div className="settings-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="settings-tab-icon">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="settings-content">
          {/* 1. Profile Tab */}
          {activeTab === 'profile' && (
            <div className="settings-section">
              <div className="settings-section-header">
                <h2>Profile Information</h2>
                <p>Update your personal details and public profile</p>
              </div>

              <div className="settings-profile-top">
                <div className="settings-avatar" style={{ background: state.currentUser?.color || '#0284c7' }}>
                  {state.currentUser?.initials || 'S'}
                </div>
                <div>
                  <h3>{state.currentUser?.name}</h3>
                  <p>{state.currentUser?.email}</p>
                </div>
              </div>

              <form onSubmit={handleProfileSave} className="settings-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" value={profileForm.name}
                      onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" value={profileForm.email}
                      onChange={e => setProfileForm({ ...profileForm, email: e.target.value })} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Role</label>
                    <input type="text" value={profileForm.role}
                      onChange={e => setProfileForm({ ...profileForm, role: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Time Zone</label>
                    <select value={profileForm.timezone}
                      onChange={e => setProfileForm({ ...profileForm, timezone: e.target.value })}>
                      <option>UTC-12 (Baker Island)</option>
                      <option>UTC-8 (PST)</option>
                      <option>UTC-5 (EST)</option>
                      <option>UTC+0 (GMT)</option>
                      <option>UTC+1 (CET)</option>
                      <option>UTC+5:30 (IST)</option>
                      <option>UTC+8 (SGT)</option>
                      <option>UTC+9 (KST)</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Bio</label>
                  <textarea rows="3" value={profileForm.bio}
                    onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })}
                    placeholder="Tell us about yourself..." />
                </div>
                <button type="submit" className="btn btn-primary">
                  {saved ? '✓ Saved!' : 'Save Changes'}
                </button>
              </form>
            </div>
          )}

          {/* 2. Gmail SMTP & Email Settings Tab */}
          {activeTab === 'smtp' && (
            <div className="settings-section">
              <div className="settings-section-header">
                <div className="smtp-header-title-row">
                  <h2>Personal Gmail SMTP Configuration</h2>
                  <span className={`smtp-status-pill ${smtpConfig.configured ? 'online' : 'offline'}`}>
                    <span className="pill-dot" />
                    {smtpConfig.configured ? 'SMTP Active' : 'Not Configured'}
                  </span>
                </div>
                <p>
                  Connect your personal Gmail account using a 16-character Google App Password to dispatch 2-Step OTP login codes and realtime team collaboration invitation emails.
                </p>
              </div>

              {smtpResult && (
                <div className={`smtp-alert-box ${smtpResult.success ? 'success' : 'error'}`}>
                  <span>{smtpResult.message || smtpResult.warning}</span>
                </div>
              )}

              <form onSubmit={handleSmtpSave} className="settings-form smtp-form">
                <div className="form-group">
                  <label>Personal Gmail Address *</label>
                  <input
                    type="email"
                    placeholder="e.g. yourname@gmail.com"
                    value={smtpConfig.gmailUser}
                    onChange={e => setSmtpConfig({ ...smtpConfig, gmailUser: e.target.value })}
                    required
                  />
                  <span className="field-hint">The sender email address displayed on invitations and OTPs.</span>
                </div>

                <div className="form-group">
                  <label>16-Character Google App Password *</label>
                  <input
                    type="password"
                    placeholder="e.g. abcd efgh ijkl mnop"
                    value={smtpConfig.appPassword}
                    onChange={e => setSmtpConfig({ ...smtpConfig, appPassword: e.target.value })}
                    required
                  />
                  <span className="field-hint">Spaces are automatically stripped before connecting.</span>
                </div>

                <div className="smtp-guide-card">
                  <h4>💡 How to generate your 16-character Google App Password:</h4>
                  <ol>
                    <li>Go to your Google Account Security: <a href="https://myaccount.google.com/security" target="_blank" rel="noreferrer">myaccount.google.com/security</a></li>
                    <li>Ensure <strong>2-Step Verification</strong> is enabled on your Google account.</li>
                    <li>Open <strong>App passwords</strong> (<a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer">myaccount.google.com/apppasswords</a>).</li>
                    <li>Enter App name as <code>Trackify</code> and click <strong>Create</strong>.</li>
                    <li>Copy the generated 16-character code and paste it above!</li>
                  </ol>
                </div>

                <button type="submit" className="btn btn-primary" disabled={smtpLoading}>
                  {smtpLoading ? 'Verifying with Google SMTP...' : 'Verify & Save Gmail SMTP Credentials'}
                </button>
              </form>
            </div>
          )}

          {/* 3. Database & Supabase Cloud Storage Tab */}
          {activeTab === 'storage' && (
            <div className="settings-section">
              <div className="settings-section-header">
                <h2>Database & Cloud Storage (Supabase)</h2>
                <p>Sync tasks, projects, team members, and user state to your Supabase PostgreSQL cloud database.</p>
              </div>

              {/* Status Banner */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 18px',
                  borderRadius: '12px',
                  background: supabaseForm.isConfigured ? 'rgba(16, 185, 129, 0.08)' : 'rgba(100, 116, 139, 0.08)',
                  border: `1px solid ${supabaseForm.isConfigured ? 'rgba(16, 185, 129, 0.25)' : 'rgba(100, 116, 139, 0.2)'}`,
                  marginBottom: '20px'
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: supabaseForm.isConfigured ? '#10b981' : '#64748b',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.1rem',
                    flexShrink: 0
                  }}
                >
                  ⚡
                </div>
                <div>
                  <h4 style={{ margin: '0 0 2px 0', fontSize: '0.9rem', color: 'var(--text)' }}>
                    {supabaseForm.isConfigured ? 'Supabase Cloud Storage Active' : 'Offline / LocalStorage Fallback Active'}
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {supabaseForm.isConfigured
                      ? 'All workspace tasks, projects, and users are syncing securely to your Supabase PostgreSQL cloud database.'
                      : 'Running in resilient local storage mode. Enter your Supabase Project URL and Anon key below to activate cloud persistence.'}
                  </p>
                </div>
              </div>

              {supabaseStatus && (
                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: '10px',
                    marginBottom: '18px',
                    fontSize: '0.84rem',
                    background: supabaseStatus.success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: supabaseStatus.success ? '#15803d' : '#b91c1c',
                    border: `1px solid ${supabaseStatus.success ? '#86efac' : '#fca5a5'}`
                  }}
                >
                  {supabaseStatus.message}
                </div>
              )}

              <form onSubmit={handleSupabaseSave} className="settings-form smtp-form">
                <div className="form-group">
                  <label>Supabase Project URL *</label>
                  <input
                    type="url"
                    placeholder="https://your-project-id.supabase.co"
                    value={supabaseForm.url}
                    onChange={e => setSupabaseForm({ ...supabaseForm, url: e.target.value })}
                    required
                  />
                  <span className="field-hint">Found in your Supabase Dashboard: Project Settings &rarr; API &rarr; Project URL.</span>
                </div>

                <div className="form-group">
                  <label>Supabase Anon (Public) Key *</label>
                  <input
                    type="password"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={supabaseForm.key}
                    onChange={e => setSupabaseForm({ ...supabaseForm, key: e.target.value })}
                    required
                  />
                  <span className="field-hint">Found in Supabase: Project Settings &rarr; API &rarr; Project API keys &rarr; anon public.</span>
                </div>

                <div className="smtp-guide-card">
                  <h4>💡 Quick Supabase Cloud Setup (1 Minute):</h4>
                  <ol>
                    <li>Create a free account or project at <a href="https://supabase.com" target="_blank" rel="noreferrer">supabase.com</a>.</li>
                    <li>Open <strong>SQL Editor</strong> in your Supabase dashboard.</li>
                    <li>Copy and run the provided <code>supabase_schema.sql</code> file included in this repository.</li>
                    <li>Go to <strong>Project Settings &rarr; API</strong>, copy your <strong>URL</strong> and <strong>Anon Key</strong>, and paste them above!</li>
                  </ol>
                </div>

                <button type="submit" className="btn btn-primary" disabled={supabaseLoading}>
                  {supabaseLoading ? 'Connecting to Supabase...' : 'Save & Connect Supabase Storage'}
                </button>
              </form>
            </div>
          )}

          {/* 4. Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="settings-section">
              <div className="settings-section-header">
                <h2>Notification Preferences</h2>
                <p>Choose what you get notified about</p>
              </div>
              <div className="notification-options">
                {[
                  { key: 'emailNotifications', label: 'Email Notifications (Gmail SMTP)', desc: 'Receive real email updates for 2-step OTP codes and team invitations' },
                  { key: 'taskAssigned', label: 'Task Assignments', desc: 'Get notified when a task is assigned to you' },
                  { key: 'taskCompleted', label: 'Task Completions', desc: 'Get notified when a task you created is completed' },
                  { key: 'projectUpdates', label: 'Project Milestones', desc: 'Get notified on significant project milestone changes' },
                  { key: 'reminders', label: 'Scheduled Reminders', desc: 'Get notified for upcoming calendar reminders' },
                ].map(opt => (
                  <div key={opt.key} className="notification-option">
                    <div>
                      <h4>{opt.label}</h4>
                      <p>{opt.desc}</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={state.settings[opt.key] ?? true}
                        onChange={e => handleSettingChange(opt.key, e.target.checked)}
                      />
                      <span className="toggle-slider" />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="settings-section">
              <div className="settings-section-header">
                <h2>Appearance</h2>
                <p>Customize the look and feel of your Trackify workspace</p>
              </div>

              {/* Theme Mode */}
              <div className="settings-group">
                <h3>Theme Mode</h3>
                <div className="theme-options">
                  {[
                    { id: 'light', label: 'Light', icon: '☀️' },
                    { id: 'dark', label: 'Dark', icon: '🌙' },
                    { id: 'system', label: 'System', icon: '💻' },
                  ].map(theme => (
                    <button
                      key={theme.id}
                      className={`theme-option ${state.settings.theme === theme.id ? 'active' : ''}`}
                      onClick={() => handleSettingChange('theme', theme.id)}
                    >
                      <span className="theme-icon">{theme.icon}</span>
                      <span>{theme.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Accent Color */}
              <div className="settings-group">
                <h3>Accent Color</h3>
                <div className="accent-options">
                  {accentColors.map(color => (
                    <button
                      key={color.value}
                      className={`accent-option ${state.settings.accent === color.value ? 'active' : ''}`}
                      style={{ '--accent-color': color.value }}
                      onClick={() => handleSettingChange('accent', color.value)}
                      title={color.name}
                    >
                      <div className="accent-swatch" style={{ background: color.value }} />
                      <span>{color.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Week Start */}
              <div className="settings-group">
                <h3>Week Starts On</h3>
                <div className="week-start-options">
                  {[
                    { id: 'sunday', label: 'Sunday' },
                    { id: 'monday', label: 'Monday' },
                  ].map(opt => (
                    <button
                      key={opt.id}
                      className={`week-option ${state.settings.weekStart === opt.id ? 'active' : ''}`}
                      onClick={() => handleSettingChange('weekStart', opt.id)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
