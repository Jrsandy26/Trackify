import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function Sidebar() {
  const { state, dispatch, triggerToast } = useApp();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const isCollapsed = !state.sidebarOpen;

  const handleLogout = () => {
    localStorage.clear();
    dispatch({ type: 'LOGOUT' });
    if (triggerToast) triggerToast('Logged out', 'You have been signed out safely.', 'info');
    navigate('/auth');
  };

  const handleToggle = () => {
    dispatch({ type: 'TOGGLE_SIDEBAR' });
  };

  const currentUser = state.currentUser || {
    name: 'Sandeep Sai',
    email: 'sandeep@trackify.com',
    initials: 'S',
    color: '#3b82f6'
  };

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${state.sidebarOpen ? 'active' : ''}`}
        onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
      />

      <aside className={`trackify-dark-sidebar ${isCollapsed ? 'collapsed' : ''} ${state.sidebarOpen ? 'mobile-open' : ''}`}>
        {/* Brand / Logo Header */}
        <div className="sidebar-top-brand">
          <div className="brand-logo-wrap">
            {/* Dual glowing geometric squares matching reference */}
            <div className="trackify-gem-logo">
              <span className="gem-cube cyan" />
              <span className="gem-cube indigo" />
            </div>
            {!isCollapsed && <span className="brand-title-text">Trackify</span>}
          </div>

          {/* Circular Collapse Toggle Button */}
          <button
            className="sidebar-collapse-toggle-btn"
            onClick={handleToggle}
            title={isCollapsed ? 'Open Menu' : 'Close Menu'}
          >
            {isCollapsed ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            )}
          </button>
        </div>

        {/* User Profile Card */}
        <div
          className="sidebar-user-pill-card"
          onClick={() => {
            if (isCollapsed) {
              navigate('/settings');
            } else {
              setShowProfileMenu(!showProfileMenu);
            }
          }}
          title={isCollapsed ? `${currentUser.name} - Settings` : 'Click to view options'}
        >
          <div className="user-avatar-circle" style={{ background: currentUser.color || '#3b82f6' }}>
            {currentUser.initials || 'S'}
          </div>
          {!isCollapsed && (
            <div className="user-info-text">
              <span className="user-full-name">{currentUser.name || 'Sandeep Sai'}</span>
              <span className="user-sub-email">{currentUser.email || 'sandeep@trackify.com'}</span>
            </div>
          )}
          {!isCollapsed && (
            <span className="user-card-chevron">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </span>
          )}

          {!isCollapsed && showProfileMenu && (
            <div className="profile-mini-popup" onClick={e => e.stopPropagation()}>
              <div className="popup-user-header">
                <strong>{currentUser.name}</strong>
                <span>{currentUser.email}</span>
              </div>
              <NavLink to="/settings" className="popup-link" onClick={() => setShowProfileMenu(false)}>
                ⚙️ Profile Settings
              </NavLink>
              <button className="popup-logout-btn" onClick={handleLogout}>
                🚪 Log Out
              </button>
            </div>
          )}
        </div>

        {/* Navigation Sections */}
        <div className="sidebar-nav-scrollable">
          {/* MAIN SECTION */}
          <div className="nav-group-section">
            {!isCollapsed && <span className="nav-group-title">MAIN</span>}
            
            {/* Dashboard */}
            <NavLink
              to="/"
              end
              className={({ isActive }) => `dark-nav-link ${isActive ? 'active' : ''}`}
            >
              <span className="left-accent-indicator" />
              <div className="nav-icon-container">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              </div>
              {!isCollapsed && <span className="nav-text-label">Dashboard</span>}
              {isCollapsed && <div className="collapsed-hover-tooltip">Dashboard</div>}
            </NavLink>

            {/* Projects */}
            <NavLink
              to="/projects"
              className={({ isActive }) => `dark-nav-link ${isActive ? 'active' : ''}`}
            >
              <span className="left-accent-indicator" />
              <div className="nav-icon-container">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                  <line x1="12" y1="11" x2="12" y2="17"/>
                  <line x1="9" y1="14" x2="15" y2="14"/>
                </svg>
              </div>
              {!isCollapsed && <span className="nav-text-label">Projects</span>}
              {isCollapsed && <div className="collapsed-hover-tooltip">Projects</div>}
            </NavLink>

            {/* Tasks */}
            <NavLink
              to="/tasks"
              className={({ isActive }) => `dark-nav-link ${isActive ? 'active' : ''}`}
            >
              <span className="left-accent-indicator" />
              <div className="nav-icon-container">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                </svg>
              </div>
              {!isCollapsed && <span className="nav-text-label">Tasks</span>}
              {isCollapsed && <div className="collapsed-hover-tooltip">Tasks</div>}
            </NavLink>

            {/* Calendar */}
            <NavLink
              to="/calendar"
              className={({ isActive }) => `dark-nav-link ${isActive ? 'active' : ''}`}
            >
              <span className="left-accent-indicator" />
              <div className="nav-icon-container">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              {!isCollapsed && <span className="nav-text-label">Calendar</span>}
              {isCollapsed && <div className="collapsed-hover-tooltip">Calendar</div>}
            </NavLink>

            {/* Analytics */}
            <NavLink
              to="/analytics"
              className={({ isActive }) => `dark-nav-link ${isActive ? 'active' : ''}`}
            >
              <span className="left-accent-indicator" />
              <div className="nav-icon-container">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10"/>
                  <line x1="12" y1="20" x2="12" y2="4"/>
                  <line x1="6" y1="20" x2="6" y2="14"/>
                </svg>
              </div>
              {!isCollapsed && <span className="nav-text-label">Analytics</span>}
              {isCollapsed && <div className="collapsed-hover-tooltip">Analytics</div>}
            </NavLink>

            {/* Team */}
            <NavLink
              to="/team"
              className={({ isActive }) => `dark-nav-link ${isActive ? 'active' : ''}`}
            >
              <span className="left-accent-indicator" />
              <div className="nav-icon-container">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              {!isCollapsed && <span className="nav-text-label">Team</span>}
              {isCollapsed && <div className="collapsed-hover-tooltip">Team</div>}
            </NavLink>
          </div>

          {/* GENERAL SECTION */}
          <div className="nav-group-section">
            {!isCollapsed && <span className="nav-group-title">GENERAL</span>}

            {/* Settings */}
            <NavLink
              to="/settings"
              className={({ isActive }) => `dark-nav-link ${isActive ? 'active' : ''}`}
            >
              <span className="left-accent-indicator" />
              <div className="nav-icon-container">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
              </div>
              {!isCollapsed && <span className="nav-text-label">Settings</span>}
              {isCollapsed && <div className="collapsed-hover-tooltip">Settings</div>}
            </NavLink>

            {/* Help */}
            <NavLink
              to="/help"
              className={({ isActive }) => `dark-nav-link ${isActive ? 'active' : ''}`}
            >
              <span className="left-accent-indicator" />
              <div className="nav-icon-container">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              {!isCollapsed && <span className="nav-text-label">Help</span>}
              {isCollapsed && <div className="collapsed-hover-tooltip">Help</div>}
            </NavLink>

            {/* Logout */}
            <button className="dark-nav-link logout-trigger-btn" onClick={handleLogout}>
              <span className="left-accent-indicator" />
              <div className="nav-icon-container">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              </div>
              {!isCollapsed && <span className="nav-text-label">Logout</span>}
              {isCollapsed && <div className="collapsed-hover-tooltip">Logout</div>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
