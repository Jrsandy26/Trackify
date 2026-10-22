import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

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

  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'appearance', label: 'Appearance', icon: '🎨' },
  ];

  return (
    <div className="settings-page">
      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <p className="page-subtitle">Manage your account preferences and application settings</p>
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
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="settings-section">
              <div className="settings-section-header">
                <h2>Profile Information</h2>
                <p>Update your personal details and public profile</p>
              </div>

              <div className="settings-profile-top">
                <div className="settings-avatar" style={{ background: state.currentUser?.color }}>
                  {state.currentUser?.initials}
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
                      <option>UTC+10 (AEST)</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Bio</label>
                  <textarea rows={4} placeholder="Write a short bio about yourself..."
                    value={profileForm.bio}
                    onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })} />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    {saved ? '✓ Saved!' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="settings-section">
              <div className="settings-section-header">
                <h2>Notification Preferences</h2>
                <p>Choose how you want to be notified about updates</p>
              </div>

              <div className="settings-toggles">
                {[
                  { key: 'notifyEmail', label: 'Email Notifications', desc: 'Receive notifications via email' },
                  { key: 'notifyPush', label: 'Push Notifications', desc: 'Receive browser push notifications' },
                  { key: 'notifyTaskUpdate', label: 'Task Updates', desc: 'Get notified when tasks are updated or moved' },
                  { key: 'notifyMention', label: 'Mentions', desc: 'Get notified when someone mentions you' },
                  { key: 'notifyDeadline', label: 'Deadline Reminders', desc: 'Receive reminders before task deadlines' },
                ].map(item => (
                  <div key={item.key} className="settings-toggle-item">
                    <div className="toggle-info">
                      <span className="toggle-label">{item.label}</span>
                      <span className="toggle-desc">{item.desc}</span>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={state.settings[item.key]}
                        onChange={(e) => handleSettingChange(item.key, e.target.checked)}
                      />
                      <span className="toggle-slider" />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="settings-section">
              <div className="settings-section-header">
                <h2>Appearance</h2>
                <p>Customize the look and feel of your workspace</p>
              </div>

              {/* Theme */}
              <div className="settings-group">
                <h3>Theme</h3>
                <div className="theme-options">
                  {[
                    { id: 'light', label: 'Light', icon: '☀️' },
                    { id: 'dark', label: 'Dark', icon: '🌙' },
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
