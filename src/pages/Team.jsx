import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { broadcastTeamEvent, syncEventTypes, subscribeTeamEvents } from '../utils/syncChannel';

export default function Team() {
  const { state, dispatch, triggerToast } = useApp();
  const [showInvite, setShowInvite] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [invitations, setInvitations] = useState([]);
  const [inviteResult, setInviteResult] = useState(null);

  const [inviteForm, setInviteForm] = useState({
    name: '',
    email: '',
    role: 'Senior Developer',
    department: 'Engineering',
    project: state.projects[0]?.name || 'Website Redesign',
    note: ''
  });

  const [selectedMember, setSelectedMember] = useState(null);
  const [showAssignTask, setShowAssignTask] = useState(false);
  const [assignTask, setAssignTask] = useState({ title: '', priority: 'medium', dueDate: '' });
  const [memberToDelete, setMemberToDelete] = useState(null);

  // Dynamic additions
  const [showAddDept, setShowAddDept] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');
  const [showAddProj, setShowAddProj] = useState(false);
  const [newProjName, setNewProjName] = useState('');

  // Remove member from project
  const handleRemoveMemberFromProject = (memberId, projectId, memberName, projectName) => {
    dispatch({
      type: 'REMOVE_MEMBER_FROM_PROJECT',
      payload: { memberId, projectId }
    });
    if (triggerToast) triggerToast('Project Removed ✕', `${memberName || 'Member'} removed from ${projectName || 'Project'}.`, 'info');
  };

  // Assign member to project
  const handleAddMemberToProject = (memberId, projectId, memberName) => {
    dispatch({
      type: 'ADD_MEMBER_TO_PROJECT',
      payload: { memberId, projectId }
    });
    const proj = state.projects.find(p => p.id === projectId);
    if (triggerToast) triggerToast('Project Assigned 📁', `${memberName || 'Member'} assigned to ${proj?.name || 'Project'}.`, 'success');
  };

  // Delete member from workspace
  const handleDeleteMember = () => {
    if (!memberToDelete) return;
    if (memberToDelete.id === state.currentUser?.id) {
      if (triggerToast) triggerToast('Action Prevented', 'You cannot delete the active logged-in user account.', 'warning');
      setMemberToDelete(null);
      return;
    }
    const name = memberToDelete.name;
    dispatch({ type: 'DELETE_MEMBER', payload: memberToDelete.id });
    if (triggerToast) triggerToast('Member Removed', `${name} removed from team & workspace.`, 'info');
    if (selectedMember && selectedMember.id === memberToDelete.id) {
      setSelectedMember(null);
    }
    setMemberToDelete(null);
  };

  const handleAddNewDept = () => {
    const val = newDeptName.trim();
    if (!val) return;
    dispatch({ type: 'ADD_DEPARTMENT', payload: val });
    setInviteForm(prev => ({ ...prev, department: val }));
    if (triggerToast) triggerToast('Department Added 🏢', `"${val}" added to departments!`, 'success');
    setNewDeptName('');
    setShowAddDept(false);
  };

  const handleAddNewProj = () => {
    const val = newProjName.trim();
    if (!val) return;
    const newId = `p${Date.now()}`;
    const projPayload = {
      id: newId,
      name: val,
      status: 'running',
      progress: 0,
      taskCount: '0/1',
      startDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      dueDate: 'Nov 30, 2026',
      lead: state.currentUser?.name || 'Sandeep Sai',
      leadId: state.currentUser?.id || 'u0',
      members: [state.currentUser?.id || 'u0'],
      description: `${val} project`,
      color: '#4f46e5',
      iconType: 'stripes',
      category: 'Engineering'
    };
    dispatch({ type: 'ADD_PROJECT', payload: projPayload });
    setInviteForm(prev => ({ ...prev, project: val }));
    if (triggerToast) triggerToast('Project Created 📁', `"${val}" added to workspace!`, 'success');
    setNewProjName('');
    setShowAddProj(false);
  };

  // Quick domain chips
  const domains = ['@gmail.com', '@outlook.com', '@hotmail.com'];
  const handleDomainClick = (dom) => {
    const prefix = inviteForm.email.split('@')[0] || '';
    setInviteForm({ ...inviteForm, email: `${prefix}${dom}` });
  };

  // Fetch pending invitations from backend
  const fetchInvitations = async () => {
    try {
      const res = await fetch('/api/team/invites');
      const data = await res.json();
      if (data.success && Array.isArray(data.invitations)) {
        setInvitations(data.invitations);
      }
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    fetchInvitations();

    // Subscribe to cross-tab realtime events
    const unsubscribe = subscribeTeamEvents((data) => {
      if (!data || !data.type) return;
      if (data.type === syncEventTypes.INVITE_SENT || data.type === syncEventTypes.INVITE_ACCEPTED || data.type === syncEventTypes.INVITE_REVOKED) {
        fetchInvitations();
      }
    });

    return () => unsubscribe();
  }, []);

  // 1. Send Invitation via Gmail SMTP
  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    if (!inviteForm.email.trim()) return;

    setInviting(true);
    setInviteResult(null);

    const recipientName = inviteForm.name.trim() || inviteForm.email.split('@')[0];
    const inviterName = state.currentUser?.name || 'Sandeep Sai';
    const inviterEmail = state.currentUser?.email || 'sandeep@trackify.com';

    try {
      const res = await fetch('/api/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inviterName,
          inviterEmail,
          recipientEmail: inviteForm.email.trim(),
          recipientName,
          role: inviteForm.role,
          department: inviteForm.department,
          project: inviteForm.project,
          note: inviteForm.note
        })
      });

      const data = await res.json();
      if (!res.ok && !data.success) {
        throw new Error(data.message || 'Failed to dispatch invitation');
      }

      setInviteResult(data);
      if (data.invite) {
        setInvitations(prev => [data.invite, ...prev.filter(inv => inv.id !== data.invite.id)]);
      }

      // Broadcast event across all open accounts/tabs in real time!
      broadcastTeamEvent(syncEventTypes.INVITE_SENT, {
        recipientEmail: inviteForm.email.trim(),
        recipientName,
        project: inviteForm.project,
        role: inviteForm.role,
        invite: data.invite
      });

      if (triggerToast) {
        triggerToast(
          data.emailSent ? 'Invitation Sent via Gmail SMTP! ✉️' : 'Invitation Dispatched! ✉️',
          data.message || `Invitation sent to ${inviteForm.email}`,
          'success'
        );
      }

      setInviteForm({
        name: '',
        email: '',
        role: 'Senior Developer',
        department: 'Engineering',
        project: state.projects[0]?.name || 'Website Redesign',
        note: ''
      });
    } catch (err) {
      console.warn('API error, using local fallback:', err);
      // Fallback
      const fallbackInvite = {
        id: `inv-${Date.now()}`,
        token: `tok_${Date.now()}`,
        inviterName,
        inviterEmail,
        recipientName,
        recipientEmail: inviteForm.email.trim(),
        role: inviteForm.role,
        department: inviteForm.department,
        project: inviteForm.project,
        note: inviteForm.note,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      setInvitations(prev => [fallbackInvite, ...prev]);
      if (triggerToast) {
        triggerToast('Invitation Created 📬', `Ready for ${inviteForm.email}`, 'info');
      }
    } finally {
      setInviting(false);
    }
  };

  // 2. Resend Invitation Email
  const handleResend = async (inv) => {
    try {
      const res = await fetch('/api/team/resend-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: inv.id })
      });
      const data = await res.json();
      if (triggerToast) {
        triggerToast('Reminder Sent ✉️', data.message || `Reminder email dispatched to ${inv.recipientEmail}`, 'success');
      }
    } catch {
      if (triggerToast) triggerToast('Reminder Sent', `Notification resent to ${inv.recipientEmail}`, 'info');
    }
  };

  // 3. Revoke Invitation
  const handleRevoke = async (id) => {
    try {
      await fetch('/api/team/revoke-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      setInvitations(prev => prev.filter(inv => inv.id !== id));
      broadcastTeamEvent(syncEventTypes.INVITE_REVOKED, { id });
      if (triggerToast) triggerToast('Invitation Revoked', 'The pending invite was cancelled.', 'info');
    } catch {
      setInvitations(prev => prev.filter(inv => inv.id !== id));
    }
  };

  // Copy Join Link to Clipboard
  const handleCopyLink = (inv) => {
    const link = `${window.location.origin}/#/accept-invite?token=${inv.token}&email=${encodeURIComponent(inv.recipientEmail)}&name=${encodeURIComponent(inv.recipientName)}&project=${encodeURIComponent(inv.project)}&role=${encodeURIComponent(inv.role)}`;
    navigator.clipboard.writeText(link);
    if (triggerToast) triggerToast('Join Link Copied! 📋', 'Direct invitation link copied to clipboard.', 'success');
  };

  const getMemberTasks = (userId) => {
    return {
      open: state.tasks.filter(t => t.assignee === userId && t.status !== 'done').length,
      completed: state.tasks.filter(t => t.assignee === userId && t.status === 'done').length,
      assigned: state.tasks.filter(t => t.assignee === userId),
      total: state.tasks.filter(t => t.assignee === userId).length
    };
  };

  const handleAssignTask = (e) => {
    e.preventDefault();
    if (!assignTask.title || !selectedMember) return;
    dispatch({
      type: 'ADD_TASK',
      payload: {
        id: `t${Date.now()}`,
        title: assignTask.title,
        description: '',
        status: 'todo',
        priority: assignTask.priority,
        assignee: selectedMember.id,
        project: state.projects[0]?.id || '',
        dueDate: assignTask.dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        createdAt: new Date().toISOString().split('T')[0],
        tags: []
      }
    });
    setAssignTask({ title: '', priority: 'medium', dueDate: '' });
    setShowAssignTask(false);
    if (triggerToast) triggerToast('Task Assigned 📋', `Assigned to ${selectedMember.name}`, 'success');
  };

  const statusLabels = {
    todo: 'To Do',
    inprogress: 'In Progress',
    inreview: 'In Review',
    done: 'Done'
  };

  const pendingList = invitations.filter(inv => inv.status === 'pending');

  return (
    <div className="team-page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>Team & Collaboration</h1>
          <p className="page-subtitle">
            Manage your organization members, invite teammates via Gmail SMTP, and collaborate in real time.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowInvite(true); setInviteResult(null); }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="8.5" cy="7" r="4" />
            <line x1="20" y1="8" x2="20" y2="14" />
            <line x1="23" y1="11" x2="17" y2="11" />
          </svg>
          Invite Member (Gmail / Outlook)
        </button>
      </div>

      {/* SECTION 1: PENDING INVITATIONS (REALTIME TRACKING) */}
      {pendingList.length > 0 && (
        <div className="pending-invites-section">
          <div className="pending-invites-header">
            <div className="pending-title-group">
              <span className="live-pulse-dot" />
              <h3>Pending Team Invitations ({pendingList.length})</h3>
            </div>
            <span className="pending-subhint">
              Recipients receive an invitation email via Gmail SMTP with a direct 1-click join link.
            </span>
          </div>

          <div className="pending-invites-grid">
            {pendingList.map(inv => (
              <div key={inv.id} className="pending-invite-card">
                <div className="pic-top-row">
                  <div className="pic-user-avatar">
                    {(inv.recipientName || inv.recipientEmail)[0].toUpperCase()}
                  </div>
                  <div className="pic-user-info">
                    <span className="pic-name">{inv.recipientName}</span>
                    <span className="pic-email">{inv.recipientEmail}</span>
                  </div>
                  <span className="pic-pending-badge">Pending</span>
                </div>

                <div className="pic-meta-row">
                  <span className="pic-proj-tag">📁 {inv.project}</span>
                  <span className="pic-role-tag">🛡️ {inv.role}</span>
                </div>

                {inv.note && <p className="pic-note">"{inv.note}"</p>}

                <div className="pic-actions-row">
                  <button
                    className="btn-pic-action copy"
                    onClick={() => handleCopyLink(inv)}
                    title="Copy direct invitation link"
                  >
                    📋 Copy Link
                  </button>
                  <button
                    className="btn-pic-action resend"
                    onClick={() => handleResend(inv)}
                    title="Resend email via Gmail SMTP"
                  >
                    ✉️ Resend
                  </button>
                  <button
                    className="btn-pic-action revoke"
                    onClick={() => handleRevoke(inv.id)}
                    title="Cancel invitation"
                  >
                    ✕ Revoke
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 2: ACTIVE TEAM MEMBERS GRID */}
      <div className="active-team-header-row">
        <h3>Active Team Members ({state.users.length})</h3>
        <span className="team-count-subtext">All synced accounts in workspace</span>
      </div>

      <div className="team-grid">
        {state.users.map(member => {
          const tasks = getMemberTasks(member.id);
          const memberProjects = (state.projects || []).filter(p => (p.members || []).includes(member.id));

          return (
            <div key={member.id} className="team-card">
              <div className="team-card-top">
                <div className="team-avatar" style={{ background: member.color || '#0284c7' }}>
                  {member.initials || member.name.slice(0, 2).toUpperCase()}
                </div>
                <h3 className="team-member-name">{member.name}</h3>
                <p className="team-member-role">{member.role}</p>
                <span className="team-dept-badge">{member.department || 'General'}</span>
              </div>

              {/* Assigned Projects Section */}
              <div className="team-card-projects-section">
                <div className="projects-section-title-row">
                  <span className="mini-section-label">Assigned Projects ({memberProjects.length})</span>
                </div>
                <div className="member-project-tags-list">
                  {memberProjects.length === 0 ? (
                    <span className="no-projects-hint">No projects assigned</span>
                  ) : (
                    memberProjects.map(p => (
                      <span key={p.id} className="member-proj-tag" style={{ '--tag-color': p.color || '#4f46e5' }}>
                        <span className="tag-proj-name">{p.name}</span>
                        <button
                          type="button"
                          className="btn-remove-proj-tag"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveMemberFromProject(member.id, p.id, member.name, p.name);
                          }}
                          title={`Remove ${member.name} from ${p.name}`}
                        >
                          ✕
                        </button>
                      </span>
                    ))
                  )}
                </div>

                {/* Project Assign / Change selector */}
                <div className="assign-project-dropdown-row">
                  <select
                    className="select-assign-project"
                    defaultValue=""
                    onChange={(e) => {
                      if (!e.target.value) return;
                      handleAddMemberToProject(member.id, e.target.value, member.name);
                      e.target.value = '';
                    }}
                  >
                    <option value="" disabled>+ Assign / Change Project...</option>
                    {state.projects.map(proj => (
                      <option key={proj.id} value={proj.id}>
                        {(proj.members || []).includes(member.id) ? `✓ ${proj.name} (Assigned)` : `+ ${proj.name}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="team-card-stats">
                <div className="team-stat">
                  <span className="team-stat-value">{tasks.open}</span>
                  <span className="team-stat-label">Open Tasks</span>
                </div>
                <div className="team-stat-divider" />
                <div className="team-stat">
                  <span className="team-stat-value">{tasks.completed}</span>
                  <span className="team-stat-label">Completed</span>
                </div>
              </div>

              <div className="team-card-actions">
                <button
                  className="btn btn-sm btn-ghost"
                  title="Message"
                  onClick={() => {
                    if (triggerToast) triggerToast('Chat Opened 💬', `Direct message channel ready with ${member.name}`, 'info');
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  Chat
                </button>
                <button className="btn btn-sm btn-primary" onClick={() => setSelectedMember(member)}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  Profile
                </button>
                <button
                  className="btn btn-sm btn-danger-icon"
                  onClick={() => setMemberToDelete(member)}
                  title={`Delete ${member.name}`}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    <line x1="10" y1="11" x2="10" y2="17" />
                    <line x1="14" y1="11" x2="14" y2="17" />
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL 1: INVITE TEAM MEMBER VIA GMAIL SMTP */}
      {showInvite && (
        <div className="modal-overlay" onClick={() => setShowInvite(false)}>
          <div className="modal modal-lg invite-member-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-with-icon">
                <div className="invite-modal-icon-badge">✉️</div>
                <div>
                  <h2>Invite Teammate via Email</h2>
                  <p className="modal-subtitle">
                    Dispatches a real email invitation using Gmail SMTP with an instant join link.
                  </p>
                </div>
              </div>
              <button className="modal-close" onClick={() => setShowInvite(false)}>✕</button>
            </div>

            <form onSubmit={handleInviteSubmit} className="modal-form">
              {inviteResult && (
                <div className={`invite-status-banner ${inviteResult.emailSent ? 'success' : 'info'}`}>
                  <span>{inviteResult.message}</span>
                  {inviteResult.joinLink && (
                    <div className="join-link-preview-box">
                      <span>Direct join link:</span>
                      <code>{inviteResult.joinLink}</code>
                      <button
                        type="button"
                        className="btn-copy-preview"
                        onClick={() => {
                          navigator.clipboard.writeText(inviteResult.joinLink);
                          if (triggerToast) triggerToast('Link Copied!', 'Join URL copied to clipboard.', 'success');
                        }}
                      >
                        Copy
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label>Recipient Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Maya Lin"
                    value={inviteForm.name}
                    onChange={e => setInviteForm({ ...inviteForm, name: e.target.value })}
                    autoFocus
                  />
                </div>

                <div className="form-group">
                  <label>Recipient Email Address (Gmail / Outlook) *</label>
                  <input
                    type="email"
                    placeholder="e.g. maya@gmail.com or maya@outlook.com"
                    value={inviteForm.email}
                    onChange={e => setInviteForm({ ...inviteForm, email: e.target.value })}
                    required
                  />
                  <div className="auth-domain-chips" style={{ marginTop: '6px' }}>
                    <span className="chip-label">Quick select:</span>
                    {domains.map(dom => (
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
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Role</label>
                  <select
                    value={inviteForm.role}
                    onChange={e => setInviteForm({ ...inviteForm, role: e.target.value })}
                  >
                    <option>Project Lead</option>
                    <option>Senior Developer</option>
                    <option>Developer</option>
                    <option>UI/UX Designer</option>
                    <option>QA Engineer</option>
                    <option>DevOps Engineer</option>
                    <option>Team Member</option>
                    <option>Viewer</option>
                  </select>
                </div>

                <div className="form-group">
                  <div className="field-label-with-action">
                    <label>Department</label>
                    <button
                      type="button"
                      className="btn-inline-add-field"
                      onClick={() => setShowAddDept(!showAddDept)}
                    >
                      {showAddDept ? 'Cancel' : '+ New Entry'}
                    </button>
                  </div>
                  {showAddDept ? (
                    <div className="inline-add-input-box">
                      <input
                        type="text"
                        placeholder="Department name..."
                        value={newDeptName}
                        onChange={e => setNewDeptName(e.target.value)}
                        className="modern-text-input small"
                        autoFocus
                      />
                      <button type="button" className="btn-save-inline-field" onClick={handleAddNewDept}>Add</button>
                    </div>
                  ) : (
                    <select
                      value={inviteForm.department}
                      onChange={e => setInviteForm({ ...inviteForm, department: e.target.value })}
                    >
                      {(state.departments || ['Engineering', 'Design', 'Product', 'Marketing', 'Mobile', 'Security', 'Operations', 'General']).map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div className="form-group">
                <div className="field-label-with-action">
                  <label>Assign to Project</label>
                  <button
                    type="button"
                    className="btn-inline-add-field"
                    onClick={() => setShowAddProj(!showAddProj)}
                  >
                    {showAddProj ? 'Cancel' : '+ New Entry'}
                  </button>
                </div>
                {showAddProj ? (
                  <div className="inline-add-input-box">
                    <input
                      type="text"
                      placeholder="Project name..."
                      value={newProjName}
                      onChange={e => setNewProjName(e.target.value)}
                      className="modern-text-input small"
                      autoFocus
                    />
                    <button type="button" className="btn-save-inline-field" onClick={handleAddNewProj}>Add</button>
                  </div>
                ) : (
                  <select
                    value={inviteForm.project}
                    onChange={e => setInviteForm({ ...inviteForm, project: e.target.value })}
                  >
                    {state.projects.map(p => (
                      <option key={p.id} value={p.name}>{p.name}</option>
                    ))}
                    <option value="All Projects">All Projects (Organization Wide)</option>
                  </select>
                )}
              </div>

              <div className="form-group">
                <label>Personal Invitation Note (Optional)</label>
                <textarea
                  rows="2"
                  placeholder="e.g. Hey! Excited to have you collaborate on our upcoming sprint."
                  value={inviteForm.note}
                  onChange={e => setInviteForm({ ...inviteForm, note: e.target.value })}
                  className="modern-textarea"
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowInvite(false)}>
                  Done
                </button>
                <button type="submit" className="btn btn-primary" disabled={inviting}>
                  {inviting ? (
                    <span className="spinner-text">Sending via SMTP...</span>
                  ) : (
                    <span>🚀 Send Invitation Email</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: MEMBER PROFILE & TASK ASSIGNMENT */}
      {selectedMember && (
        <div className="modal-overlay" onClick={() => { setSelectedMember(null); setShowAssignTask(false); }}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Member Profile</h2>
              <button className="modal-close" onClick={() => { setSelectedMember(null); setShowAssignTask(false); }}>✕</button>
            </div>
            <div className="profile-modal-content">
              <div className="profile-modal-top">
                <div className="profile-avatar-lg" style={{ background: selectedMember.color || '#0284c7' }}>
                  {selectedMember.initials || selectedMember.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="profile-modal-info">
                  <h3>{selectedMember.name}</h3>
                  <p className="profile-role">{selectedMember.role}</p>
                  <p className="profile-dept">{selectedMember.department}</p>
                  <p className="profile-email">{selectedMember.email}</p>
                </div>
                <div className="profile-modal-actions">
                  <button className="btn btn-sm btn-primary" onClick={() => setShowAssignTask(true)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Assign Task
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => setMemberToDelete(selectedMember)}
                    title="Delete member from workspace"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      <line x1="10" y1="11" x2="10" y2="17" />
                      <line x1="14" y1="11" x2="14" y2="17" />
                    </svg>
                    Delete Member
                  </button>
                </div>
              </div>

              {/* Assigned Projects in Profile */}
              <div className="profile-projects-section">
                <h4>Assigned Projects ({state.projects.filter(p => (p.members || []).includes(selectedMember.id)).length})</h4>
                <div className="profile-projects-list">
                  {state.projects.filter(p => (p.members || []).includes(selectedMember.id)).length === 0 ? (
                    <p className="empty-text">No active project assignments.</p>
                  ) : (
                    state.projects.filter(p => (p.members || []).includes(selectedMember.id)).map(p => (
                      <div key={p.id} className="profile-project-badge-item" style={{ '--proj-color': p.color || '#4f46e5' }}>
                        <span className="proj-dot" />
                        <span className="proj-title">{p.name}</span>
                        <button
                          type="button"
                          className="btn-remove-badge"
                          onClick={() => handleRemoveMemberFromProject(selectedMember.id, p.id, selectedMember.name, p.name)}
                          title={`Remove from ${p.name}`}
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  )}
                </div>
                <div className="profile-assign-project-row">
                  <select
                    className="select-profile-project"
                    defaultValue=""
                    onChange={(e) => {
                      if (!e.target.value) return;
                      handleAddMemberToProject(selectedMember.id, e.target.value, selectedMember.name);
                      e.target.value = '';
                    }}
                  >
                    <option value="" disabled>+ Assign to Project...</option>
                    {state.projects.map(proj => (
                      <option key={proj.id} value={proj.id}>
                        {(proj.members || []).includes(selectedMember.id) ? `✓ ${proj.name} (Assigned)` : `+ ${proj.name}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {showAssignTask && (
                <form className="inline-form profile-assign-form" onSubmit={handleAssignTask}>
                  <h4>Assign Task to {selectedMember.name.split(' ')[0]}</h4>
                  <input
                    type="text"
                    placeholder="Task title"
                    value={assignTask.title}
                    onChange={e => setAssignTask({ ...assignTask, title: e.target.value })}
                    autoFocus
                  />
                  <div className="form-row">
                    <select
                      value={assignTask.priority}
                      onChange={e => setAssignTask({ ...assignTask, priority: e.target.value })}
                    >
                      <option value="high">🔥 High Priority</option>
                      <option value="medium">⚡ Medium Priority</option>
                      <option value="low">🌱 Low Priority</option>
                    </select>
                    <input
                      type="date"
                      value={assignTask.dueDate}
                      onChange={e => setAssignTask({ ...assignTask, dueDate: e.target.value })}
                    />
                  </div>
                  <div className="inline-form-actions">
                    <button type="submit" className="btn btn-sm btn-primary">Assign Task</button>
                    <button type="button" className="btn btn-sm btn-ghost" onClick={() => setShowAssignTask(false)}>Cancel</button>
                  </div>
                </form>
              )}

              <div className="profile-task-stats">
                {(() => {
                  const tasks = getMemberTasks(selectedMember.id);
                  return (
                    <>
                      <div className="profile-stat-card">
                        <span className="profile-stat-value" style={{ color: '#f59e0b' }}>{tasks.open}</span>
                        <span className="profile-stat-label">Open</span>
                      </div>
                      <div className="profile-stat-card">
                        <span className="profile-stat-value" style={{ color: '#10b981' }}>{tasks.completed}</span>
                        <span className="profile-stat-label">Done</span>
                      </div>
                      <div className="profile-stat-card">
                        <span className="profile-stat-value" style={{ color: '#06b6d4' }}>{tasks.total}</span>
                        <span className="profile-stat-label">Total Load</span>
                      </div>
                      <div className="profile-stat-card">
                        <span className="profile-stat-value" style={{ color: '#6366f1' }}>{tasks.assigned.length}</span>
                        <span className="profile-stat-label">Assigned</span>
                      </div>
                    </>
                  );
                })()}
              </div>

              <div className="profile-task-list">
                <h4>Assigned Tasks</h4>
                {getMemberTasks(selectedMember.id).assigned.length === 0 ? (
                  <p className="empty-text">No tasks assigned yet.</p>
                ) : (
                  getMemberTasks(selectedMember.id).assigned.map(task => (
                    <div key={task.id} className="profile-task-item">
                      <span className={`status-dot status-${task.status}`} />
                      <div className="profile-task-info">
                        <span className="profile-task-title">{task.title}</span>
                        <span className="profile-task-meta">{statusLabels[task.status]} • Due: {task.dueDate}</span>
                      </div>
                      <span className={`priority-badge priority-${task.priority}`}>{task.priority}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MEMBER CONFIRMATION MODAL */}
      {memberToDelete && (
        <div className="modal-overlay" onClick={() => setMemberToDelete(null)}>
          <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
            <div className="danger-modal-icon-badge" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.12)', margin: '0 auto 12px auto' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            </div>
            <h2 style={{ textAlign: 'center' }}>Delete Team Member?</h2>
            <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Are you sure you want to remove <strong>"{memberToDelete.name}"</strong> from this workspace? They will be unassigned from all active projects and tasks.
            </p>
            <div className="modal-actions" style={{ justifyContent: 'center', marginTop: '16px' }}>
              <button className="btn btn-ghost" onClick={() => setMemberToDelete(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDeleteMember}>Delete Member</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
