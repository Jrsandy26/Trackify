import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

function formatTimeAgo(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min${mins > 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

export default function TopBar() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [showNotif, setShowNotif] = useState(false);
  const [showMail, setShowMail] = useState(false);
  const notifRef = useRef(null);
  const mailRef = useRef(null);

  const unreadCount = state.notifications.filter(n => !n.read).length;

  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
      if (mailRef.current && !mailRef.current.contains(e.target)) setShowMail(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const user = state.currentUser || {
    name: 'User',
    email: '',
    initials: 'U',
    color: '#3b82f6'
  };

  return (
    <header className="topbar fernly-topbar">
      <div className="topbar-left">
        <button
          className="topbar-hamburger"
          onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
          title="Toggle sidebar"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>

        {/* Pill Search bar */}
        <div className="fernly-search-box">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Search projects & people"
            value={state.searchQuery}
            onChange={(e) => dispatch({ type: 'SET_SEARCH', payload: e.target.value })}
          />
          <kbd className="search-shortcut">⌘ K</kbd>
        </div>
      </div>

      <div className="topbar-right">
        {/* Mail / Inbox Button */}
        <div className="topbar-icon-wrap" ref={mailRef}>
          <button
            className="fernly-icon-btn"
            onClick={() => { setShowMail(!showMail); setShowNotif(false); }}
            title="Messages"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
              <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
            </svg>
          </button>

          {showMail && (
            <div className="dropdown-panel mail-panel">
              <div className="dropdown-header">
                <h3>Messages</h3>
                <button className="text-btn">Mark all read</button>
              </div>
              <div className="dropdown-list">
                {[
                  { from: 'Silva Rodriguez', subject: 'Passkey implementation update', time: '10 min ago', preview: 'Hey, I pushed the initial WebAuthn integration...' },
                  { from: 'Maria Chen', subject: 'Design review feedback', time: '1 hour ago', preview: 'The homepage wireframes look great! I have a few suggestions...' },
                  { from: 'James Wilson', subject: 'API endpoint changes', time: '3 hours ago', preview: 'Updated the REST endpoints for user modules...' }
                ].map((mail, i) => (
                  <div key={i} className="dropdown-item mail-item">
                    <div className="mail-avatar" style={{ background: ['#06b6d4', '#f43f5e', '#10b981'][i] }}>
                      {mail.from.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="mail-content">
                      <div className="mail-header-row">
                        <span className="mail-from">{mail.from}</span>
                        <span className="mail-time">{mail.time}</span>
                      </div>
                      <span className="mail-subject">{mail.subject}</span>
                      <span className="mail-preview">{mail.preview}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notification Bell */}
        <div className="topbar-icon-wrap" ref={notifRef}>
          <button
            className="fernly-icon-btn"
            onClick={() => { setShowNotif(!showNotif); setShowMail(false); }}
            title="Notifications"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <span className="fernly-red-dot" />
          </button>

          {showNotif && (
            <div className="dropdown-panel notif-panel">
              <div className="dropdown-header">
                <h3>Notifications</h3>
                <button className="text-btn" onClick={() => dispatch({ type: 'MARK_ALL_READ' })}>Mark all read</button>
              </div>
              <div className="dropdown-list">
                {state.notifications.slice(0, 8).map(notif => (
                  <div
                    key={notif.id}
                    className={`dropdown-item notif-item ${!notif.read ? 'unread' : ''}`}
                    onClick={() => dispatch({ type: 'MARK_NOTIFICATION_READ', payload: notif.id })}
                  >
                    <div className="notif-avatar" style={{ background: state.users.find(u => u.id === notif.userId)?.color || '#2563eb' }}>
                      {notif.userName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="notif-content">
                      <p className="notif-text">
                        <strong>{notif.userName}</strong> {notif.action}{' '}
                        <strong>{notif.target}</strong>
                        {notif.from && notif.to && (
                          <> from <em>{notif.from}</em> to <em>{notif.to}</em></>
                        )}
                        {!notif.from && notif.to && (
                          <> to <em>{notif.to}</em></>
                        )}
                      </p>
                      <div className="notif-meta">
                        <span className="notif-email">{notif.userEmail}</span>
                        <span className="notif-time">{formatTimeAgo(notif.timestamp)}</span>
                      </div>
                    </div>
                    {!notif.read && <div className="unread-dot" />}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar Link */}
        <button
          className="topbar-user-avatar-btn"
          onClick={() => navigate('/settings')}
          title={`${user.name || 'User'} - Profile & Settings`}
        >
          <div className="user-avatar-fernly" style={{ background: user.color || '#3b82f6' }}>
            {user.initials || 'U'}
          </div>
        </button>
      </div>
    </header>
  );
}
