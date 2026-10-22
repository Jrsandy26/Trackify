import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function Team() {
  const { state, dispatch } = useApp();
  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: '', email: '', role: 'Team Member', department: 'Engineering' });
  const [selectedMember, setSelectedMember] = useState(null);
  const [showAssignTask, setShowAssignTask] = useState(false);
  const [assignTask, setAssignTask] = useState({ title: '', priority: 'medium', dueDate: '' });

  const handleInvite = (e) => {
    e.preventDefault();
    if (!inviteForm.name || !inviteForm.email) return;
    const initials = inviteForm.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const colors = ['#6366f1', '#06b6d4', '#f43f5e', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
    const newMember = {
      id: `u${Date.now()}`,
      name: inviteForm.name,
      email: inviteForm.email,
      role: inviteForm.role,
      department: inviteForm.department,
      bio: '',
      timezone: 'UTC',
      password: 'demo123',
      avatar: null,
      initials,
      color: colors[Math.floor(Math.random() * colors.length)]
    };
    dispatch({ type: 'ADD_MEMBER', payload: newMember });
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: `n${Date.now()}`,
        userId: state.currentUser?.id,
        userName: state.currentUser?.name,
        userEmail: state.currentUser?.email,
        action: 'invited',
        target: inviteForm.name,
        from: null,
        to: 'Team',
        timestamp: Date.now(),
        read: false
      }
    });
    setInviteForm({ name: '', email: '', role: 'Team Member', department: 'Engineering' });
    setShowInvite(false);
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
  };

  const statusLabels = {
    todo: 'To Do',
    inprogress: 'In Progress',
    inreview: 'In Review',
    done: 'Done'
  };

  return (
    <div className="team-page">
      <div className="page-header">
        <div>
          <h1>Team</h1>
          <p className="page-subtitle">Manage your team members and collaboration</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowInvite(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="8.5" cy="7" r="4"/>
            <line x1="20" y1="8" x2="20" y2="14"/>
            <line x1="23" y1="11" x2="17" y2="11"/>
          </svg>
          Invite Member
        </button>
      </div>

      {/* Invite Modal */}
      {showInvite && (
        <div className="modal-overlay" onClick={() => setShowInvite(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Invite Team Member</h2>
              <button className="modal-close" onClick={() => setShowInvite(false)}>✕</button>
            </div>
            <form onSubmit={handleInvite} className="modal-form">
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" placeholder="Enter full name" value={inviteForm.name}
                  onChange={e => setInviteForm({ ...inviteForm, name: e.target.value })} autoFocus />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" placeholder="Enter email address" value={inviteForm.email}
                  onChange={e => setInviteForm({ ...inviteForm, email: e.target.value })} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Role</label>
                  <select value={inviteForm.role} onChange={e => setInviteForm({ ...inviteForm, role: e.target.value })}>
                    <option>Project Lead</option>
                    <option>Senior Developer</option>
                    <option>Developer</option>
                    <option>UI/UX Designer</option>
                    <option>QA Engineer</option>
                    <option>DevOps Engineer</option>
                    <option>Team Member</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <select value={inviteForm.department} onChange={e => setInviteForm({ ...inviteForm, department: e.target.value })}>
                    <option>Engineering</option>
                    <option>Design</option>
                    <option>Quality Assurance</option>
                    <option>Infrastructure</option>
                    <option>Marketing</option>
                    <option>Management</option>
                  </select>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowInvite(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Send Invitation</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Member Profile Modal */}
      {selectedMember && (
        <div className="modal-overlay" onClick={() => { setSelectedMember(null); setShowAssignTask(false); }}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Member Profile</h2>
              <button className="modal-close" onClick={() => { setSelectedMember(null); setShowAssignTask(false); }}>✕</button>
            </div>
            <div className="profile-modal-content">
              <div className="profile-modal-top">
                <div className="profile-avatar-lg" style={{ background: selectedMember.color }}>
                  {selectedMember.initials}
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
                  <button className="btn btn-sm btn-ghost">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    Message
                  </button>
                </div>
              </div>

              {showAssignTask && (
                <form className="inline-form profile-assign-form" onSubmit={handleAssignTask}>
                  <h4>Assign Task to {selectedMember.name.split(' ')[0]}</h4>
                  <input type="text" placeholder="Task title" value={assignTask.title}
                    onChange={e => setAssignTask({ ...assignTask, title: e.target.value })} autoFocus />
                  <div className="form-row">
                    <select value={assignTask.priority} onChange={e => setAssignTask({ ...assignTask, priority: e.target.value })}>
                      <option value="high">High Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="low">Low Priority</option>
                    </select>
                    <input type="date" value={assignTask.dueDate}
                      onChange={e => setAssignTask({ ...assignTask, dueDate: e.target.value })} />
                  </div>
                  <div className="inline-form-actions">
                    <button type="submit" className="btn btn-sm btn-primary">Assign</button>
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

      {/* Team Grid */}
      <div className="team-grid">
        {state.users.map(member => {
          const tasks = getMemberTasks(member.id);
          return (
            <div key={member.id} className="team-card">
              <div className="team-card-top">
                <div className="team-avatar" style={{ background: member.color }}>
                  {member.initials}
                </div>
                <h3 className="team-member-name">{member.name}</h3>
                <p className="team-member-role">{member.role}</p>
                <span className="team-dept-badge">{member.department}</span>
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
                <button className="btn btn-sm btn-ghost" title="Message">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  Message
                </button>
                <button className="btn btn-sm btn-primary" onClick={() => setSelectedMember(member)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  Profile
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
