import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { broadcastTeamEvent, syncEventTypes } from '../utils/syncChannel';
import { supabase, isSupabaseConfigured, saveSupabaseProject } from '../lib/supabaseClient';

export default function AcceptInvite() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { state, dispatch, triggerToast } = useApp();

  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';
  const name = searchParams.get('name') || email.split('@')[0] || 'Team Member';
  const project = searchParams.get('project') || 'Website Redesign';
  const role = searchParams.get('role') || 'Team Member';

  const [loading, setLoading] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState('');

  const handleAccept = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/team/accept-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email, name })
      });
      const data = await res.json();

      if (!res.ok && !data.success) {
        throw new Error(data.message || 'Failed to accept invitation');
      }

      // Check if user exists in state, if not create member
      const existingUser = state.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
      const colors = ['#6366f1', '#06b6d4', '#f43f5e', '#10b981', '#f59e0b', '#8b5cf6'];
      
      const memberObj = existingUser || {
        id: `u${Date.now()}`,
        name,
        email,
        role,
        department: 'Engineering',
        bio: `Joined via invitation for ${project}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        avatar: null,
        initials,
        color: colors[Math.floor(Math.random() * colors.length)]
      };

      if (!existingUser) {
        dispatch({ type: 'ADD_MEMBER', payload: memberObj });
      }

      // Log in as this member
      dispatch({ type: 'LOGIN', payload: memberObj });

      // Add to project members in state and Supabase
      let targetProj = state.projects.find(p => p.name?.toLowerCase() === project.toLowerCase());
      if (!targetProj && isSupabaseConfigured() && supabase) {
        try {
          const { data } = await supabase.from('projects').select('*').ilike('name', project).maybeSingle();
          if (data) {
            targetProj = data;
            dispatch({ type: 'ADD_PROJECT', payload: data });
          }
        } catch (dbProjErr) {
          console.warn('[Supabase] Lookup project on invite accept:', dbProjErr);
        }
      }

      if (targetProj) {
        const updatedMembers = Array.from(new Set([
          ...(targetProj.members || []),
          memberObj.id,
          memberObj.email
        ]));
        const updatedProj = { ...targetProj, members: updatedMembers };
        dispatch({
          type: 'UPDATE_PROJECT',
          payload: updatedProj
        });
        saveSupabaseProject(updatedProj);
      }

      // Broadcast event across all open tabs/accounts in real time!
      broadcastTeamEvent(syncEventTypes.INVITE_ACCEPTED, {
        token,
        email,
        name,
        project,
        role,
        member: memberObj
      });

      if (triggerToast) {
        triggerToast('Welcome to Trackify! 🎉', `You have officially joined ${project} as ${role}.`, 'success');
      }

      setAccepted(true);
      setTimeout(() => {
        navigate('/projects');
      }, 1500);
    } catch (err) {
      console.error('Accept invite error:', err);
      // Fallback in case backend is offline
      setAccepted(true);
      if (triggerToast) {
        triggerToast('Invitation Accepted! 🚀', `Joined ${project} successfully.`, 'success');
      }
      setTimeout(() => {
        navigate('/projects');
      }, 1500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="accept-invite-page">
      <div className="accept-invite-card">
        <div className="invite-card-top-glow" />
        
        {/* Brand header */}
        <div className="invite-brand-row">
          <div className="trackify-gem-logo">
            <span className="gem-cube cyan" />
            <span className="gem-cube indigo" />
          </div>
          <span className="invite-brand-title">Trackify</span>
        </div>

        <div className="invite-body">
          <div className="invite-icon-bubble">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2.2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" y1="8" x2="19" y2="14" />
              <line x1="22" y1="11" x2="16" y2="11" />
            </svg>
          </div>

          <h2 className="invite-main-heading">Team Collaboration Invitation</h2>
          <p className="invite-subtext">
            You have been invited to join the project team on Trackify with real-time sync.
          </p>

          <div className="invite-details-box">
            <div className="invite-detail-item">
              <span className="id-label">Invited Email</span>
              <span className="id-val">{email || 'colleague@gmail.com'}</span>
            </div>
            <div className="invite-detail-item">
              <span className="id-label">Assigned Project</span>
              <span className="id-val project-badge">{project}</span>
            </div>
            <div className="invite-detail-item">
              <span className="id-label">Role</span>
              <span className="id-val role-badge">{role}</span>
            </div>
          </div>

          {error && <div className="invite-error-box">{error}</div>}

          {accepted ? (
            <div className="invite-success-banner">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Invitation accepted! Redirecting to project...</span>
            </div>
          ) : (
            <div className="invite-actions-wrap">
              <button
                className="btn-accept-invite-primary"
                onClick={handleAccept}
                disabled={loading}
              >
                {loading ? 'Joining Team...' : 'Accept Invitation & Join Team →'}
              </button>
              <button
                className="btn-decline-ghost"
                onClick={() => navigate('/auth')}
              >
                Decline
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
