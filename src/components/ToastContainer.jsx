import React from 'react';
import { useApp } from '../context/AppContext';

export default function ToastContainer() {
  const { state, dispatch } = useApp();

  if (!state.toasts || state.toasts.length === 0) return null;

  return (
    <div className="toast-portal-container">
      {state.toasts.map((toast) => (
        <div
          key={toast.id}
          className={`liquid-glass-toast toast-${toast.type || 'info'} ${toast.isLiveProgress ? 'is-live-progress' : ''}`}
        >
          {/* Glass Specular Liquid Highlight */}
          <div className="liquid-glass-specular-sheen" />

          <div className="liquid-toast-header">
            <div className="toast-icon-wrap">
              {toast.isLiveProgress ? (
                <div className="live-pulsing-rings">
                  <span className="live-core-dot" />
                  <span className="live-wave-ring" />
                </div>
              ) : toast.type === 'success' ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : toast.type === 'warning' ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
              )}
            </div>

            <div className="toast-body">
              <div className="toast-title-row">
                <h5 className="toast-title">{toast.title}</h5>
                {toast.isLiveProgress && (
                  <span className="live-status-pill">
                    <span className="live-red-beacon" /> LIVE
                  </span>
                )}
              </div>
              <p className="toast-message">{toast.message}</p>
            </div>

            <button
              className="toast-close-btn"
              onClick={() => dispatch({ type: 'REMOVE_TOAST', payload: toast.id })}
              title="Dismiss notification"
            >
              ✕
            </button>
          </div>

          {/* Liquid Live Progress Track if live progress */}
          {toast.isLiveProgress && typeof toast.progressPct === 'number' && (
            <div className="liquid-toast-progress-box">
              <div className="liquid-progress-track">
                <div
                  className="liquid-progress-fill"
                  style={{ width: `${toast.progressPct}%` }}
                />
              </div>
              <span className="liquid-pct-badge">{toast.progressPct}%</span>
            </div>
          )}

          {!toast.isLiveProgress && <div className="toast-progress-bar" />}
        </div>
      ))}
    </div>
  );
}
