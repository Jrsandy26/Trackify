import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { saveSupabaseProject } from '../lib/supabaseClient';
import { initialCollaborators, initialMilestones } from '../data/mockData';

const PROJECT_THEMES = [
  { id: 'stripes', label: 'Tech & Core', color: '#4f46e5', bg: '#eef2ff', icon: '///' },
  { id: 'mobile', label: 'Mobile App', color: '#10b981', bg: '#ecfdf5', icon: '📱' },
  { id: 'security', label: 'Security & Auth', color: '#f43f5e', bg: '#fff1f2', icon: '🛡️' },
  { id: 'marketing', label: 'Growth / Web', color: '#f59e0b', bg: '#fffbeb', icon: '📈' },
  { id: 'api', label: 'API & Cloud', color: '#8b5cf6', bg: '#f5f3ff', icon: '⚡' },
  { id: 'design', label: 'UI / Design', color: '#06b6d4', bg: '#ecfeff', icon: '🎨' },
];

// Interactive Project Analytics Datasets
const ANALYTICS_DATASETS = {
  'This Week': [
    { day: 'Sun', date: 'Oct 18', comp: 6, created: 8, target: 8, prev: 7, compPct: 35, createdPct: 50, velocity: '+14%', efficiency: 88 },
    { day: 'Mon', date: 'Oct 19', comp: 9, created: 11, target: 10, prev: 10, compPct: 55, createdPct: 70, velocity: '+20%', efficiency: 91 },
    { day: 'Tue', date: 'Oct 20', comp: 12, created: 14, target: 12, prev: 12, compPct: 70, createdPct: 85, velocity: '+24%', efficiency: 94 },
    { day: 'Wed', date: 'Oct 21', comp: 20, created: 7, target: 15, prev: 11, compPct: 96, createdPct: 40, peak: true, badge: '20', velocity: '+38%', efficiency: 98 },
    { day: 'Thu', date: 'Oct 22', comp: 14, created: 16, target: 14, prev: 12, compPct: 80, createdPct: 95, velocity: '+28%', efficiency: 95 },
    { day: 'Fri', date: 'Oct 23', comp: 11, created: 13, target: 13, prev: 14, compPct: 65, createdPct: 75, velocity: '+18%', efficiency: 92 },
    { day: 'Sat', date: 'Oct 24', comp: 8, created: 10, target: 8, prev: 9, compPct: 45, createdPct: 60, velocity: '+12%', efficiency: 89 }
  ],
  'Last Week': [
    { day: 'Sun', date: 'Oct 11', comp: 5, created: 7, target: 7, prev: 6, compPct: 30, createdPct: 45, velocity: '+8%', efficiency: 84 },
    { day: 'Mon', date: 'Oct 12', comp: 8, created: 10, target: 9, prev: 8, compPct: 50, createdPct: 65, velocity: '+15%', efficiency: 87 },
    { day: 'Tue', date: 'Oct 13', comp: 11, created: 13, target: 11, prev: 11, compPct: 65, createdPct: 75, velocity: '+18%', efficiency: 90 },
    { day: 'Wed', date: 'Oct 14', comp: 15, created: 9, target: 13, prev: 12, compPct: 80, createdPct: 50, velocity: '+22%', efficiency: 92 },
    { day: 'Thu', date: 'Oct 15', comp: 18, created: 14, target: 14, prev: 13, compPct: 92, createdPct: 80, peak: true, badge: '18', velocity: '+32%', efficiency: 96 },
    { day: 'Fri', date: 'Oct 16', comp: 10, created: 12, target: 12, prev: 13, compPct: 60, createdPct: 70, velocity: '+14%', efficiency: 88 },
    { day: 'Sat', date: 'Oct 17', comp: 6, created: 8, target: 7, prev: 7, compPct: 35, createdPct: 45, velocity: '+6%', efficiency: 83 }
  ],
  'This Month': [
    { day: 'Week 1', date: 'Oct 1-7', comp: 18, created: 22, target: 20, prev: 17, compPct: 60, createdPct: 75, velocity: '+16%', efficiency: 88 },
    { day: 'Week 2', date: 'Oct 8-14', comp: 24, created: 26, target: 25, prev: 22, compPct: 80, createdPct: 85, velocity: '+22%', efficiency: 91 },
    { day: 'Week 3', date: 'Oct 15-21', comp: 32, created: 19, target: 28, prev: 25, compPct: 96, createdPct: 60, peak: true, badge: '32', velocity: '+36%', efficiency: 97 },
    { day: 'Week 4', date: 'Oct 22-28', comp: 22, created: 25, target: 24, prev: 24, compPct: 72, createdPct: 80, velocity: '+20%', efficiency: 90 }
  ]
};

// Interactive Weekly Performance Spline Datasets
const PERFORMANCE_DATASETS = {
  'This Week': {
    linePath: "M 45 110 C 85 102, 95 90, 130 90 C 165 90, 180 76, 215 74 C 255 72, 265 46, 300 44 C 340 42, 350 26, 385 26 C 420 26, 435 66, 470 68 C 505 70, 520 92, 555 92",
    areaPath: "M 45 110 C 85 102, 95 90, 130 90 C 165 90, 180 76, 215 74 C 255 72, 265 46, 300 44 C 340 42, 350 26, 385 26 C 420 26, 435 66, 470 68 C 505 70, 520 92, 555 92 L 555 145 L 45 145 Z",
    prevPath: "M 45 122 C 85 115, 95 106, 130 104 C 165 102, 180 90, 215 88 C 255 86, 265 72, 300 70 C 340 68, 350 58, 385 56 C 420 54, 435 80, 470 82 C 505 84, 520 98, 555 100",
    points: [
      { day: 'Sun', x: 45, y: 110, comp: 8, prev: 6 },
      { day: 'Mon', x: 130, y: 90, comp: 14, prev: 11 },
      { day: 'Tue', x: 215, y: 74, comp: 19, prev: 16 },
      { day: 'Wed', x: 300, y: 44, comp: 28, prev: 20 },
      { day: 'Thu', x: 385, y: 26, comp: 32, prev: 24 },
      { day: 'Fri', x: 470, y: 68, comp: 21, prev: 18 },
      { day: 'Sat', x: 555, y: 92, comp: 15, prev: 12 }
    ],
    stats: {
      completed: 32,
      completedTrend: '+28%',
      completedVs: 'vs 25 last week',
      created: 18,
      createdTrend: '+12%',
      createdVs: 'vs 16 last week',
      overdue: 3,
      overdueTrend: '-20%',
      overdueVs: 'vs 5 last week'
    }
  },
  'Last Week': {
    linePath: "M 45 120 C 85 114, 95 104, 130 102 C 165 100, 180 88, 215 86 C 255 84, 265 64, 300 62 C 340 60, 350 50, 385 48 C 420 46, 435 76, 470 78 C 505 80, 520 96, 555 98",
    areaPath: "M 45 120 C 85 114, 95 104, 130 102 C 165 100, 180 88, 215 86 C 255 84, 265 64, 300 62 C 340 60, 350 50, 385 48 C 420 46, 435 76, 470 78 C 505 80, 520 96, 555 98 L 555 145 L 45 145 Z",
    prevPath: "M 45 130 C 85 124, 95 114, 130 112 C 165 110, 180 98, 215 96 C 255 94, 265 78, 300 76 C 340 74, 350 64, 385 62 C 420 60, 435 86, 470 88 C 505 90, 520 106, 555 108",
    points: [
      { day: 'Sun', x: 45, y: 120, comp: 6, prev: 5 },
      { day: 'Mon', x: 130, y: 102, comp: 11, prev: 9 },
      { day: 'Tue', x: 215, y: 86, comp: 16, prev: 13 },
      { day: 'Wed', x: 300, y: 62, comp: 22, prev: 17 },
      { day: 'Thu', x: 385, y: 48, comp: 25, prev: 21 },
      { day: 'Fri', x: 470, y: 78, comp: 17, prev: 14 },
      { day: 'Sat', x: 555, y: 98, comp: 12, prev: 10 }
    ],
    stats: {
      completed: 25,
      completedTrend: '+15%',
      completedVs: 'vs 22 prior week',
      created: 16,
      createdTrend: '+8%',
      createdVs: 'vs 15 prior week',
      overdue: 5,
      overdueTrend: '-10%',
      overdueVs: 'vs 6 prior week'
    }
  }
};

export default function Dashboard() {
  const { state, dispatch, triggerToast } = useApp();
  const navigate = useNavigate();

  // Modals state
  const [showAddProject, setShowAddProject] = useState(false);
  const [showImportData, setShowImportData] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);

  // Filters & Interactivity State
  const [analyticsFilter, setAnalyticsFilter] = useState('This Week');
  const [analyticsMetric, setAnalyticsMetric] = useState('all'); // 'all' | 'completed' | 'created' | 'velocity'
  const [selectedAnalyticsDay, setSelectedAnalyticsDay] = useState(null);
  const [hoveredAnalyticsDay, setHoveredAnalyticsDay] = useState(null);
  const [selectedProgressProject, setSelectedProgressProject] = useState('all');
  const [hoveredOrbitIndex, setHoveredOrbitIndex] = useState(null);
  const [perfFilter, setPerfFilter] = useState('This Week');
  const [hoveredPerfPoint, setHoveredPerfPoint] = useState(null);

  // Time Tracker state (Starts at 01:24:36 matching reference image)
  const [selectedTrackerProject, setSelectedTrackerProject] = useState('p3');
  const [currentSessionNotes, setCurrentSessionNotes] = useState('Biometric WebAuthn challenge handling and token verification.');
  const [timerSeconds, setTimerSeconds] = useState(5076); // 1h 24m 36s
  const [timerRunning, setTimerRunning] = useState(true);

  // Session history records
  const [sessionLogs, setSessionLogs] = useState([
    { id: 's1', project: 'Passkey Sign In', duration: '01:24:36', date: 'Today, 2:30 PM - 3:54 PM', notes: 'Biometric WebAuthn challenge handling', status: 'In Progress' },
    { id: 's2', project: 'Website Redesign', duration: '02:21:00', date: 'Today, 10:15 AM - 12:36 PM', notes: 'Design system tokens & responsive layouts', status: 'Completed' },
    { id: 's3', project: 'API Integration', duration: '00:48:15', date: 'Yesterday, 4:00 PM - 4:48 PM', notes: 'JWT rotation and rate limit handling', status: 'Completed' },
    { id: 's4', project: 'Mobile App v2.0', duration: '01:12:00', date: 'Oct 20, 11:00 AM - 12:12 PM', notes: 'SQLite offline cache sync routines', status: 'Completed' }
  ]);

  // Modern project creation state
  const [newProject, setNewProject] = useState({
    name: '',
    category: 'Engineering',
    status: 'running',
    progress: 15,
    dueDate: '2026-11-20',
    iconType: 'stripes',
    color: '#4f46e5'
  });
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberModule, setNewMemberModule] = useState('');

  // Active stopwatch tick
  useEffect(() => {
    let interval = null;
    if (timerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  const hrs = Math.floor(timerSeconds / 3600);
  const mins = Math.floor((timerSeconds % 3600) / 60);
  const secs = timerSeconds % 60;
  const pad = (n) => String(n).padStart(2, '0');

  const toggleTimer = () => {
    if (!timerRunning) {
      setTimerRunning(true);
      if (triggerToast) triggerToast('Timer Resumed ▶', 'Stopwatch is now running.', 'info');
    } else {
      setTimerRunning(false);
      if (triggerToast) triggerToast('Timer Paused ⏸', `Session paused at ${pad(hrs)}:${pad(mins)}:${pad(secs)}.`, 'warning');
    }
  };

  const resetTimer = () => {
    setTimerRunning(false);
    setTimerSeconds(0);
    if (triggerToast) triggerToast('Timer Reset ↺', 'Stopwatch reset back to 00:00:00.', 'info');
  };

  // Scope projects to current user: only projects they lead, created, or have joined as members
  const curUserId = state.currentUser?.id;
  const curUserName = state.currentUser?.name;
  const curUserEmail = state.currentUser?.email;

  const userProjects = (state.projects || []).filter(p =>
    (curUserId && (p.leadId === curUserId || p.createdBy === curUserId)) ||
    (curUserName && p.lead === curUserName) ||
    (Array.isArray(p.members) && (
      (curUserId && p.members.includes(curUserId)) ||
      (curUserEmail && p.members.includes(curUserEmail))
    ))
  );

  const handleProjectSelectChange = (projectId) => {
    setSelectedTrackerProject(projectId);
    const projName = (userProjects || []).find(p => p.id === projectId)?.name || 'Project';
    if (triggerToast) triggerToast('Tracking Project Changed', `Now tracking time for "${projName}".`, 'info');
  };


  const userProjectIds = new Set(userProjects.map(p => p.id));
  const userProjectNames = new Set(userProjects.map(p => p.name?.toLowerCase()));

  const userTasks = (state.tasks || []).filter(t =>
    (t.projectId && userProjectIds.has(t.projectId)) ||
    (t.project && userProjectNames.has(t.project.toLowerCase())) ||
    (curUserId && (t.assigneeId === curUserId || t.assignee === curUserId || t.createdBy === curUserId)) ||
    (curUserName && t.assignee === curUserName) ||
    (curUserEmail && t.assigneeEmail === curUserEmail)
  );

  // Metrics
  const totalProjects = userProjects.length;
  const completedProjects = userProjects.filter(p => p.status === 'ended' || p.progress === 100).length;
  const runningProjects = userProjects.filter(p => p.status === 'running' && (p.progress || 0) < 100).length;
  const pendingProjects = userProjects.filter(p => p.status === 'pending').length;

  // Live project progress & task distribution metrics
  const totalTasksCount = userTasks.length;
  const completedTasksCount = userTasks.filter(t => t.status === 'done' || t.progress === 100).length;
  const inProgressTasksCount = userTasks.filter(t => t.status === 'inprogress' || (t.progress > 0 && t.progress < 100)).length;
  const inReviewTasksCount = userTasks.filter(t => t.status === 'inreview').length;
  const todoTasksCount = userTasks.filter(t => t.status === 'todo' && (!t.progress || t.progress === 0)).length;

  const activeProjectsList = userProjects;
  const overallAvgProgress = activeProjectsList.length > 0
    ? Math.round(activeProjectsList.reduce((sum, p) => sum + (Number(p.progress) || 0), 0) / activeProjectsList.length)
    : 0;

  // Top showcase projects for concentric orbital activity rings
  const topOrbitProjects = activeProjectsList.slice(0, 4);

  const focusedProject = selectedProgressProject === 'all'
    ? null
    : topOrbitProjects.find(p => p.id === selectedProgressProject) || activeProjectsList.find(p => p.id === selectedProgressProject);


  // Add project handler
  const handleAddProject = (e) => {
    e.preventDefault();
    if (!newProject.name.trim()) return;

    let formattedDue = 'Nov 20, 2026';
    if (newProject.dueDate) {
      try {
        const parts = newProject.dueDate.split('-');
        if (parts.length === 3) {
          const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
          formattedDue = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }
      } catch {
        formattedDue = newProject.dueDate;
      }
    }

    const createdProject = {
      id: `p${Date.now()}`,
      name: newProject.name.trim(),
      status: newProject.status || 'running',
      progress: Number(newProject.progress) || 0,
      taskCount: '0/0',
      startDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      dueDate: formattedDue,
      rawDueDate: newProject.dueDate || '2026-11-20',
      lead: state.currentUser?.name || 'Project Lead',
      leadId: state.currentUser?.id,
      createdBy: state.currentUser?.id,
      iconType: newProject.iconType || 'stripes',
      color: newProject.color || '#4f46e5',
      category: newProject.category || 'Engineering',
      description: `${newProject.name} project.`,
      members: [state.currentUser?.id, state.currentUser?.email].filter(Boolean)
    };

    dispatch({
      type: 'ADD_PROJECT',
      payload: createdProject
    });
    saveSupabaseProject(createdProject);

    if (triggerToast) {
      triggerToast('Project Created 🎉', `"${newProject.name}" added to Trackify!`, 'success');
    }

    setNewProject({
      name: '',
      category: 'Engineering',
      status: 'running',
      progress: 15,
      dueDate: '2026-11-20',
      iconType: 'stripes',
      color: '#4f46e5'
    });
    setShowAddProject(false);
  };

  // Add member handler
  const handleAddMember = (e) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;
    const initials = newMemberName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    dispatch({
      type: 'ADD_MEMBER',
      payload: {
        id: `u${Date.now()}`,
        name: newMemberName.trim(),
        email: `${newMemberName.toLowerCase().replace(/\s+/g, '.')}@trackify.com`,
        role: 'Team Member',
        module: newMemberModule.trim() || 'Core Platform',
        initials,
        color: '#a7f3d0'
      }
    });
    if (triggerToast) triggerToast('Team Member Added', `${newMemberName} joined the team!`, 'success');
    setNewMemberName('');
    setNewMemberModule('');
    setShowAddMember(false);
  };

  // Deadlines list from state
  const deadlineTasks = (state.tasks || []).filter(t => t.urgency || t.status === 'inprogress' || t.status === 'todo').slice(0, 4);

  // Milestones list
  const milestones = initialMilestones;

  // Collaborators
  const collaborators = initialCollaborators;

  return (
    <div className="fernly-dashboard full-bleed-dashboard">
      {/* Top Header */}
      <div className="fernly-dashboard-header">
        <div className="header-text">
          <h1>Dashboard</h1>
          <p>Everything your team is shipping, in one calm place.</p>
        </div>
        <div className="header-actions">
          <button className="btn-add-project" onClick={() => setShowAddProject(true)}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Project
          </button>
          <button className="btn-import-data" onClick={() => setShowImportData(true)}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Import Data
          </button>
        </div>
      </div>

      {/* Row 1: 4 Metric Cards Matching Image 1 */}
      <div className="fernly-metrics-row">
        {/* Total Projects */}
        <div className="fernly-metric-card dark-card" onClick={() => navigate('/projects')}>
          <div className="metric-card-top">
            <div className="metric-icon-square dark-blue">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <span className="metric-title-small">Total Projects</span>
            <button className="metric-arrow-btn light" title="View projects">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
            </button>
          </div>
          <div className="metric-value-huge">{totalProjects}</div>
          <div className="metric-trend-row">
            <span className="trend-green">↑ 5%</span>
            <span className="trend-label">Increased from last month</span>
          </div>
        </div>

        {/* Completed Projects */}
        <div className="fernly-metric-card white-card" onClick={() => navigate('/projects?status=ended')}>
          <div className="metric-card-top">
            <div className="metric-icon-circle green">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <span className="metric-title-small">Completed Projects</span>
            <button className="metric-arrow-btn" title="View completed projects">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
            </button>
          </div>
          <div className="metric-value-huge text-dark">{completedProjects}</div>
          <div className="metric-trend-row">
            <span className="trend-green">↑ 6%</span>
            <span className="trend-label">Increased from last month</span>
          </div>
        </div>

        {/* Running Projects */}
        <div className="fernly-metric-card white-card" onClick={() => navigate('/projects?status=running')}>
          <div className="metric-card-top">
            <div className="metric-icon-circle blue">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            </div>
            <span className="metric-title-small">Running Projects</span>
            <button className="metric-arrow-btn" title="View running projects">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
            </button>
          </div>
          <div className="metric-value-huge text-dark">{runningProjects}</div>
          <div className="metric-trend-row">
            <span className="trend-green">↑ 2%</span>
            <span className="trend-label">Increased from last month</span>
          </div>
        </div>

        {/* Pending Projects */}
        <div className="fernly-metric-card white-card" onClick={() => navigate('/projects?status=pending')}>
          <div className="metric-card-top">
            <div className="metric-icon-circle orange">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <span className="metric-title-small">Pending Projects</span>
            <button className="metric-arrow-btn" title="View pending projects">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
            </button>
          </div>
          <div className="metric-value-huge text-dark">{pendingProjects}</div>
          <div className="metric-trend-row">
            <span className="trend-label">Awaiting review</span>
          </div>
        </div>
      </div>

      {/* Row 2: Project Analytics + My Tasks & Deadlines + Upcoming Milestones */}
      <div className="dashboard-grid-3col">
        {/* Card 1: Project Analytics (STREAMLINED & UNOBSTRUCTED PEAK VIEW) */}
        <div className="dashboard-widget-card nextgen-analytics-card row2-equal-card">
          {/* Header Row */}
          <div className="widget-header-row row2-aligned-header">
            <div className="widget-title-badge-row">
              <h3>Project Analytics</h3>
              <span className="live-pill-cyan"><span className="pulse-dot-cyan" /> Interactive</span>
            </div>
            
            <div className="analytics-header-controls">
              <div className="analytics-tab-group-compact">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'completed', label: 'Done' },
                  { id: 'created', label: 'Created' },
                  { id: 'velocity', label: 'Velocity' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    className={`metric-tab-pill-compact ${analyticsMetric === tab.id ? 'active' : ''}`}
                    onClick={() => setAnalyticsMetric(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <select
                className="widget-select-pill compact-select"
                value={analyticsFilter}
                onChange={e => {
                  setAnalyticsFilter(e.target.value);
                  setSelectedAnalyticsDay(null);
                }}
              >
                <option value="This Week">This Week</option>
                <option value="Last Week">Last Week</option>
                <option value="This Month">This Month</option>
              </select>
            </div>
          </div>

          {/* Docked Telemetry Inspector Bar (NEVER BLOCKS PEAK DAY OR BARS) */}
          {(() => {
            const currentData = ANALYTICS_DATASETS[analyticsFilter] || ANALYTICS_DATASETS['This Week'];
            const activeItem = currentData.find(p => p.day === (hoveredAnalyticsDay || selectedAnalyticsDay)) || currentData.find(p => p.peak) || currentData[3];
            return (
              <div className="analytics-docked-telemetry-bar">
                <div className="telemetry-pill-tag">
                  <span className="telemetry-live-dot" />
                  <strong>{activeItem.day} ({activeItem.date || 'Day'})</strong>
                  {activeItem.peak && <span className="telemetry-peak-tag">⚡ Peak Day</span>}
                </div>
                <div className="telemetry-readout-stats">
                  <span className="readout-item">
                    <span className="dot-mini dot-cyan" /> <strong>{activeItem.comp}</strong> Done
                  </span>
                  <span className="readout-sep">·</span>
                  <span className="readout-item">
                    <span className="dot-mini dot-violet" /> <strong>{activeItem.created}</strong> Created
                  </span>
                  <span className="readout-sep">·</span>
                  <span className="readout-item text-emerald">
                    <strong>{activeItem.velocity || '+24%'}</strong> Vel
                  </span>
                  <span className="readout-sep">·</span>
                  <span className="readout-item text-indigo">
                    <strong>{activeItem.efficiency || 92}%</strong> Eff
                  </span>
                </div>
              </div>
            );
          })()}

          {/* SVG Chart with Full Headroom & Clean Visibility */}
          <div className="analytics-svg-chart-container compact-chart">
            {(() => {
              const currentData = ANALYTICS_DATASETS[analyticsFilter] || ANALYTICS_DATASETS['This Week'];
              const svgW = 500;
              const svgH = 160;
              const padLeft = 32;
              const padRight = 20;
              const padTop = 26;
              const padBottom = 26;
              const chartW = svgW - padLeft - padRight;
              const chartH = svgH - padTop - padBottom;
              const colStep = chartW / currentData.length;

              const points = currentData.map((d, i) => {
                const cx = padLeft + (i + 0.5) * colStep;
                const cy = padTop + chartH - (d.compPct / 100) * (chartH - 6);
                return { ...d, cx, cy, idx: i };
              });

              let splinePath = '';
              if (points.length > 0) {
                splinePath = `M ${points[0].cx} ${points[0].cy}`;
                for (let i = 0; i < points.length - 1; i++) {
                  const p0 = points[i];
                  const p1 = points[i + 1];
                  const cpx1 = p0.cx + (p1.cx - p0.cx) * 0.45;
                  const cpx2 = p0.cx + (p1.cx - p0.cx) * 0.55;
                  splinePath += ` C ${cpx1} ${p0.cy}, ${cpx2} ${p1.cy}, ${p1.cx} ${p1.cy}`;
                }
              }
              const areaPath = splinePath
                ? `${splinePath} L ${points[points.length - 1].cx} ${padTop + chartH} L ${points[0].cx} ${padTop + chartH} Z`
                : '';

              return (
                <div className="svg-responsive-wrapper compact-svg-box">
                  <svg
                    className="analytics-interactive-svg"
                    viewBox={`0 0 ${svgW} ${svgH}`}
                    preserveAspectRatio="xMidYMid meet"
                    shapeRendering="geometricPrecision"
                    textRendering="geometricPrecision"
                  >
                    <defs>
                      <linearGradient id="cyanBlueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#38bdf8" />
                        <stop offset="100%" stopColor="#2563eb" />
                      </linearGradient>
                      <linearGradient id="violetPinkGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#c084fc" />
                        <stop offset="100%" stopColor="#7c3aed" />
                      </linearGradient>
                      <linearGradient id="emeraldTealGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#34d399" />
                        <stop offset="100%" stopColor="#059669" />
                      </linearGradient>
                      <linearGradient id="waveAreaFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.22" />
                        <stop offset="85%" stopColor="#6366f1" stopOpacity="0.03" />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                      </linearGradient>
                      <filter id="neonSplineGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#38bdf8" floodOpacity="0.6" />
                      </filter>
                      <filter id="activeBeaconGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#38bdf8" floodOpacity="0.8" />
                      </filter>
                    </defs>

                    {/* Horizontal Reference Lines */}
                    {[0, 0.5, 1].map((ratio, rIdx) => {
                      const y = padTop + chartH * ratio;
                      const val = Math.round((1 - ratio) * (analyticsFilter === 'This Month' ? 40 : 20));
                      return (
                        <g key={rIdx}>
                          <line
                            x1={padLeft - 6}
                            y1={y}
                            x2={svgW - padRight + 6}
                            y2={y}
                            stroke="rgba(148, 163, 184, 0.15)"
                            strokeDasharray={ratio === 1 ? 'none' : '3 4'}
                          />
                          <text
                            x={padLeft - 8}
                            y={y + 3}
                            textAnchor="end"
                            fontSize="9"
                            fill="#64748b"
                            fontWeight="500"
                          >
                            {val}
                          </text>
                        </g>
                      );
                    })}

                    {/* Area under wave line */}
                    {(analyticsMetric === 'all' || analyticsMetric === 'completed' || analyticsMetric === 'velocity') && (
                      <path d={areaPath} fill="url(#waveAreaFill)" pointerEvents="none" />
                    )}

                    {/* Spline Wave Line */}
                    {(analyticsMetric === 'all' || analyticsMetric === 'completed' || analyticsMetric === 'velocity') && (
                      <path
                        d={splinePath}
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="2.2"
                        filter="url(#neonSplineGlow)"
                        pointerEvents="none"
                      />
                    )}

                    {/* Day Column Groups */}
                    {points.map((p) => {
                      const isHovered = hoveredAnalyticsDay === p.day;
                      const isSelected = selectedAnalyticsDay === p.day || (!selectedAnalyticsDay && p.peak);
                      const isFocused = isHovered || isSelected;
                      const barH = (p.compPct / 100) * (chartH - 6);
                      const createdH = (p.createdPct / 100) * (chartH - 6);
                      const trackH = chartH;

                      return (
                        <g
                          key={p.day}
                          className="chart-column-node"
                          onMouseEnter={() => setHoveredAnalyticsDay(p.day)}
                          onMouseLeave={() => setHoveredAnalyticsDay(null)}
                          onClick={() => setSelectedAnalyticsDay(p.day)}
                          style={{ cursor: 'pointer' }}
                        >
                          {/* Spotlight Light Beam for Active Day */}
                          {isFocused && (
                            <rect
                              x={p.cx - colStep * 0.42}
                              y={padTop - 6}
                              width={colStep * 0.84}
                              height={chartH + 12}
                              rx="10"
                              fill="rgba(56, 189, 248, 0.08)"
                              stroke="rgba(56, 189, 248, 0.3)"
                              strokeDasharray="2 2"
                            />
                          )}

                          {/* Background Frosted Capsule Track */}
                          <rect
                            x={p.cx - 12}
                            y={padTop}
                            width="24"
                            height={trackH}
                            rx="12"
                            fill="rgba(148, 163, 184, 0.08)"
                          />

                          {/* Companion Created Bar (Right) */}
                          {(analyticsMetric === 'all' || analyticsMetric === 'created') && (
                            <rect
                              x={p.cx + 1}
                              y={padTop + chartH - createdH}
                              width="8"
                              height={createdH}
                              rx="4"
                              fill="url(#violetPinkGrad)"
                              opacity={isFocused ? 1 : 0.8}
                            />
                          )}

                          {/* Primary Completed Bar (Left) */}
                          {(analyticsMetric === 'all' || analyticsMetric === 'completed') && (
                            <rect
                              x={analyticsMetric === 'all' ? p.cx - 9 : p.cx - 6}
                              y={padTop + chartH - barH}
                              width={analyticsMetric === 'all' ? 9 : 12}
                              height={barH}
                              rx={analyticsMetric === 'all' ? 4.5 : 6}
                              fill="url(#cyanBlueGrad)"
                              opacity={isFocused ? 1 : 0.85}
                            />
                          )}

                          {/* Velocity Metric Mode Wide Bar */}
                          {analyticsMetric === 'velocity' && (
                            <rect
                              x={p.cx - 8}
                              y={padTop + chartH - barH}
                              width="16"
                              height={barH}
                              rx="8"
                              fill="url(#emeraldTealGrad)"
                              opacity={isFocused ? 1 : 0.9}
                            />
                          )}

                          {/* Vertex Dots on Spline */}
                          {(analyticsMetric === 'all' || analyticsMetric === 'completed' || analyticsMetric === 'velocity') && (
                            <circle
                              cx={p.cx}
                              cy={p.cy}
                              r={isFocused ? 5 : 3}
                              fill={isFocused ? '#ffffff' : '#38bdf8'}
                              stroke={isFocused ? '#0284c7' : '#0f172a'}
                              strokeWidth="2"
                              filter={isFocused ? 'url(#activeBeaconGlow)' : undefined}
                            />
                          )}

                          {/* Top Floating Badge for Peak / Focused Day (Never blocks!) */}
                          {isFocused && (
                            <g transform={`translate(${p.cx}, ${Math.max(12, p.cy - 12)})`}>
                              <rect
                                x="-12"
                                y="-10"
                                width="24"
                                height="15"
                                rx="4"
                                fill="#0f172a"
                                stroke="rgba(56, 189, 248, 0.4)"
                                strokeWidth="1"
                              />
                              <text
                                x="0"
                                y="1"
                                textAnchor="middle"
                                fontSize="9"
                                fontWeight="800"
                                fill="#ffffff"
                              >
                                {p.badge || p.comp}
                              </text>
                            </g>
                          )}

                          {/* X-Axis Day Label */}
                          <text
                            x={p.cx}
                            y={svgH - 8}
                            textAnchor="middle"
                            fontSize="10"
                            fontWeight={isFocused ? '700' : '500'}
                            fill={isFocused ? '#38bdf8' : '#64748b'}
                          >
                            {p.day}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              );
            })()}
          </div>

          {/* Interactive Legend Row */}
          <div className="analytics-interactive-legend compact-legend">
            <div
              className={`legend-chip ${analyticsMetric === 'completed' ? 'chip-active' : ''}`}
              onClick={() => setAnalyticsMetric(prev => prev === 'completed' ? 'all' : 'completed')}
            >
              <span className="legend-chip-bullet cyan-grad" />
              <span>Done</span>
            </div>
            <div
              className={`legend-chip ${analyticsMetric === 'created' ? 'chip-active' : ''}`}
              onClick={() => setAnalyticsMetric(prev => prev === 'created' ? 'all' : 'created')}
            >
              <span className="legend-chip-bullet violet-grad" />
              <span>Created</span>
            </div>
            <div
              className={`legend-chip ${analyticsMetric === 'velocity' ? 'chip-active' : ''}`}
              onClick={() => setAnalyticsMetric(prev => prev === 'velocity' ? 'all' : 'velocity')}
            >
              <span className="legend-chip-bullet emerald-grad" />
              <span>Velocity</span>
            </div>
          </div>
        </div>


        {/* Card 2: My Tasks & Deadlines (STRAIGHT & BALANCED) */}
        <div className="dashboard-widget-card row2-equal-card">
          <div className="widget-header-row row2-aligned-header">
            <h3>My Tasks & Deadlines</h3>
            <button className="widget-link-btn" onClick={() => navigate('/tasks')}>
              View all →
            </button>
          </div>

          <div className="deadlines-tasks-list">
            {deadlineTasks.map((task) => {
              const urgencyLabels = {
                overdue: { label: 'Overdue', class: 'overdue-pill' },
                today: { label: 'Due Today', class: 'today-pill' },
                soon: { label: 'Due in 3 days', class: 'soon-pill' },
                nextweek: { label: 'Due next week', class: 'nextweek-pill' }
              };
              const urgencyMeta = urgencyLabels[task.urgencyType] || { label: 'Due Soon', class: 'soon-pill' };

              return (
                <div key={task.id} className="deadline-task-item" onClick={() => navigate('/tasks')}>
                  <div className={`deadline-type-icon ${task.urgencyType || 'soon'}`}>
                    {task.urgencyType === 'overdue' && '🔺'}
                    {task.urgencyType === 'today' && '🟧'}
                    {task.urgencyType === 'soon' && '🟢'}
                    {task.urgencyType === 'nextweek' && '🔷'}
                  </div>
                  <div className="deadline-task-info">
                    <span className="task-title-text">{task.title}</span>
                    <span className="task-proj-text">{task.projectName || 'Website Redesign'}</span>
                  </div>
                  <div className="deadline-task-badge-box">
                    <span className={`urgency-pill ${urgencyMeta.class}`}>{task.urgency || urgencyMeta.label}</span>
                    <span className="deadline-date-text">{task.dueDate?.split('-')[1] ? `Oct ${task.dueDate.split('-')[2]}` : task.dueDate}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="card-footer-meta-bar">
            <span>4 urgent tasks tracking</span>
            <button className="link-text-subtle" onClick={() => navigate('/tasks')}>Open Kanban →</button>
          </div>
        </div>

        {/* Card 3: Upcoming Milestones (STRAIGHT & BALANCED) */}
        <div className="dashboard-widget-card row2-equal-card">
          <div className="widget-header-row row2-aligned-header">
            <h3>Upcoming Milestones</h3>
            <button className="widget-link-btn" onClick={() => navigate('/projects')}>
              View all →
            </button>
          </div>

          <div className="milestones-timeline-wrap">
            {milestones.map((m, idx) => (
              <div key={m.id} className="milestone-timeline-item">
                <div className="timeline-node-wrap">
                  <span className="timeline-dot" style={{ background: m.color }} />
                  {idx < milestones.length - 1 && <span className="timeline-connector-line" />}
                </div>

                <div className="milestone-body-content">
                  <div className="milestone-header-line">
                    <span className="milestone-title-text">{m.title}</span>
                    <span className="milestone-pct-badge" style={{ color: m.color }}>{m.progress}%</span>
                    <span className="milestone-due-text">{m.dueDate}</span>
                  </div>
                  <div className="milestone-progress-track">
                    <div
                      className="milestone-progress-fill"
                      style={{ width: `${m.progress}%`, background: m.color }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="card-footer-meta-bar">
            <span>4 active milestones tracking</span>
            <button className="link-text-subtle" onClick={() => navigate('/projects')}>Roadmap →</button>
          </div>
        </div>
      </div>

      {/* Row 3: Team Collaboration + Project Progress (New Concentric Donut) + Recent Activity */}
      <div className="dashboard-grid-3col">
        {/* Card 1: Team Collaboration */}
        <div className="dashboard-widget-card team-collaboration-card">
          <div className="widget-header-row">
            <div>
              <h3>Team Collaboration</h3>
              <span className="widget-sub-hint">5 active contributors across sprints</span>
            </div>
            <button className="btn-add-member-pill" onClick={() => setShowAddMember(true)}>
              + Add Member
            </button>
          </div>

          <div className="collaboration-members-list">
            {collaborators.map((member) => (
              <div key={member.id} className="collab-member-row">
                <div className="collab-avatar-circle" style={{ background: member.color }}>
                  {member.initials}
                </div>
                <div className="collab-info-col">
                  <span className="collab-member-name">{member.name}</span>
                  <span className="collab-module-text">{member.module}</span>
                </div>
                <div className="collab-tasks-count">
                  {member.completedTasks}/{member.totalTasks}
                  <span className="tasks-sublabel">tasks</span>
                </div>
                <span className={`collab-status-badge ${member.status.toLowerCase().replace(/\s+/g, '-')}`}>
                  {member.status}
                </span>
              </div>
            ))}
          </div>

          {/* Clean Collaboration Summary Footer */}
          <div className="collab-summary-footer">
            <div className="collab-footer-meta">
              <span className="collab-online-badge"><span className="pulse-dot-green" /> All 5 Active</span>
              <span className="collab-totals-text">28 Total Tasks</span>
            </div>
            <button className="collab-manage-team-btn" onClick={() => navigate('/team')}>
              Team Hub →
            </button>
          </div>
        </div>

        {/* Card 2: Project Progress (NEXT-GEN MULTI-ORBITAL RADIAL ACTIVITY GAUGE) */}
        <div className="dashboard-widget-card nextgen-progress-card">
          <div className="widget-header-row">
            <div>
              <div className="widget-title-badge-row">
                <h3>Project Progress</h3>
                <span className="live-pill-emerald"><span className="pulse-dot-emerald" /> Active Sprint</span>
              </div>
              <span className="widget-sub-hint">Multi-orbital velocity rings & task distribution</span>
            </div>
            <button
              className="widget-link-btn"
              onClick={() => navigate('/projects')}
              title="Manage all projects"
            >
              Projects →
            </button>
          </div>

          {/* Multi-Orbit Radial Gauge Section */}
          <div className="progress-orbit-wrapper">
            <div className="orbit-svg-container">
              {(() => {
                const cx = 135;
                const cy = 135;
                const orbitConfigs = [
                  { r: 104, stroke: 'url(#orbitGradViolet)', glow: 'rgba(99, 102, 241, 0.5)', color: '#6366f1' },
                  { r: 84, stroke: 'url(#orbitGradSky)', glow: 'rgba(14, 165, 233, 0.5)', color: '#0ea5e9' },
                  { r: 64, stroke: 'url(#orbitGradEmerald)', glow: 'rgba(16, 185, 129, 0.5)', color: '#10b981' },
                  { r: 44, stroke: 'url(#orbitGradAmber)', glow: 'rgba(245, 158, 11, 0.5)', color: '#f59e0b' }
                ];

                return (
                  <svg className="radial-orbit-svg" viewBox="0 0 270 270">
                    <defs>
                      <linearGradient id="orbitGradViolet" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#818cf8" />
                        <stop offset="100%" stopColor="#4f46e5" />
                      </linearGradient>
                      <linearGradient id="orbitGradSky" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#38bdf8" />
                        <stop offset="100%" stopColor="#0284c7" />
                      </linearGradient>
                      <linearGradient id="orbitGradEmerald" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#34d399" />
                        <stop offset="100%" stopColor="#059669" />
                      </linearGradient>
                      <linearGradient id="orbitGradAmber" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#fbbf24" />
                        <stop offset="100%" stopColor="#d97706" />
                      </linearGradient>
                      <filter id="beaconGlowFilter" x="-40%" y="-40%" width="180%" height="180%">
                        <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#ffffff" floodOpacity="0.8" />
                      </filter>
                    </defs>

                    {topOrbitProjects.map((proj, idx) => {
                      const cfg = orbitConfigs[idx];
                      if (!cfg) return null;
                      const circumference = 2 * Math.PI * cfg.r;
                      const pct = Math.min(100, Math.max(0, Number(proj.progress) || 0));
                      const dashoffset = circumference * (1 - pct / 100);
                      const isSelected = selectedProgressProject === proj.id;
                      const isHovered = hoveredOrbitIndex === idx;
                      const isDimmed = selectedProgressProject !== 'all' && !isSelected;

                      // Head beacon coordinates
                      const angle = -Math.PI / 2 + (pct / 100) * 2 * Math.PI;
                      const beaconX = cx + cfg.r * Math.cos(angle);
                      const beaconY = cy + cfg.r * Math.sin(angle);

                      return (
                        <g
                          key={proj.id || idx}
                          className="orbit-group"
                          onMouseEnter={() => setHoveredOrbitIndex(idx)}
                          onMouseLeave={() => setHoveredOrbitIndex(null)}
                          onClick={() => setSelectedProgressProject(prev => prev === proj.id ? 'all' : proj.id)}
                          style={{
                            cursor: 'pointer',
                            opacity: isDimmed ? 0.28 : 1,
                            transition: 'opacity 0.25s ease'
                          }}
                        >
                          {/* Background Rail */}
                          <circle
                            cx={cx}
                            cy={cy}
                            r={cfg.r}
                            fill="none"
                            stroke="rgba(148, 163, 184, 0.12)"
                            strokeWidth={isSelected || isHovered ? "11" : "9"}
                          />

                          {/* Active Progress Arc */}
                          <circle
                            cx={cx}
                            cy={cy}
                            r={cfg.r}
                            fill="none"
                            stroke={cfg.stroke}
                            strokeWidth={isSelected || isHovered ? "11" : "9"}
                            strokeDasharray={circumference}
                            strokeDashoffset={dashoffset}
                            strokeLinecap="round"
                            transform={`rotate(-90 ${cx} ${cy})`}
                            style={{
                              transition: 'stroke-dashoffset 0.6s cubic-bezier(0.16, 1, 0.3, 1), stroke-width 0.2s ease'
                            }}
                          />

                          {/* Active Arc Tip Beacon */}
                          {pct > 3 && (
                            <circle
                              cx={beaconX}
                              cy={beaconY}
                              r={isSelected || isHovered ? "5" : "4"}
                              fill="#ffffff"
                              filter="url(#beaconGlowFilter)"
                            />
                          )}
                        </g>
                      );
                    })}
                  </svg>
                );
              })()}

              {/* Glassmorphic Center Node */}
              <div className="orbit-center-node">
                <span className="orbit-big-number">
                  {focusedProject ? `${focusedProject.progress}%` : `${overallAvgProgress}%`}
                </span>
                <span className="orbit-sub-label">
                  {focusedProject ? focusedProject.name : 'Overall Health'}
                </span>
                <span className="orbit-pulse-pill">
                  <span className="dot-radar-beacon" />
                  {focusedProject ? `${focusedProject.taskCount || 'Active'}` : 'All Projects'}
                </span>
              </div>
            </div>

            {/* Interactive Project Switcher Chips */}
            <div className="progress-project-selector-strip">
              <button
                className={`orbit-project-pill ${selectedProgressProject === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedProgressProject('all')}
              >
                All Projects
              </button>
              {topOrbitProjects.map((p, idx) => {
                const colors = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b'];
                const isSelected = selectedProgressProject === p.id;
                return (
                  <button
                    key={p.id || idx}
                    className={`orbit-project-pill ${isSelected ? 'active' : ''}`}
                    onClick={() => setSelectedProgressProject(prev => prev === p.id ? 'all' : p.id)}
                  >
                    <span className="pill-color-indicator" style={{ background: colors[idx] }} />
                    <span className="pill-name">{p.name}</span>
                    <span className="pill-pct">{p.progress}%</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic Task Distribution Spectrum Bar */}
          <div className="progress-task-spectrum-section">
            <div className="spectrum-header-row">
              <span className="spectrum-title">Task Distribution Across Sprints</span>
              <span className="spectrum-total-badge">{totalTasksCount} Total Tasks</span>
            </div>

            <div className="task-spectrum-track">
              <div
                className="spectrum-segment seg-done"
                style={{ width: `${Math.max(4, Math.round((completedTasksCount / totalTasksCount) * 100))}%` }}
                title={`Completed: ${completedTasksCount} tasks (${Math.round((completedTasksCount / totalTasksCount) * 100)}%)`}
              />
              <div
                className="spectrum-segment seg-progress"
                style={{ width: `${Math.max(4, Math.round((inProgressTasksCount / totalTasksCount) * 100))}%` }}
                title={`In Progress: ${inProgressTasksCount} tasks (${Math.round((inProgressTasksCount / totalTasksCount) * 100)}%)`}
              />
              <div
                className="spectrum-segment seg-review"
                style={{ width: `${Math.max(4, Math.round((inReviewTasksCount / totalTasksCount) * 100))}%` }}
                title={`In Review: ${inReviewTasksCount} tasks (${Math.round((inReviewTasksCount / totalTasksCount) * 100)}%)`}
              />
              <div
                className="spectrum-segment seg-todo"
                style={{ width: `${Math.max(4, Math.round((todoTasksCount / totalTasksCount) * 100))}%` }}
                title={`To Do: ${todoTasksCount} tasks (${Math.round((todoTasksCount / totalTasksCount) * 100)}%)`}
              />
            </div>

            {/* Spectrum Breakdown Grid */}
            <div className="spectrum-legend-grid">
              <div className="spectrum-chip">
                <span className="spectrum-bullet bullet-done" />
                <span className="chip-label">Done</span>
                <span className="chip-count"><strong>{completedTasksCount}</strong> ({Math.round((completedTasksCount / totalTasksCount) * 100)}%)</span>
              </div>
              <div className="spectrum-chip">
                <span className="spectrum-bullet bullet-progress" />
                <span className="chip-label">In Progress</span>
                <span className="chip-count"><strong>{inProgressTasksCount}</strong> ({Math.round((inProgressTasksCount / totalTasksCount) * 100)}%)</span>
              </div>
              <div className="spectrum-chip">
                <span className="spectrum-bullet bullet-review" />
                <span className="chip-label">In Review</span>
                <span className="chip-count"><strong>{inReviewTasksCount}</strong> ({Math.round((inReviewTasksCount / totalTasksCount) * 100)}%)</span>
              </div>
              <div className="spectrum-chip">
                <span className="spectrum-bullet bullet-todo" />
                <span className="chip-label">To Do</span>
                <span className="chip-count"><strong>{todoTasksCount}</strong> ({Math.round((todoTasksCount / totalTasksCount) * 100)}%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Recent Activity */}
        <div className="dashboard-widget-card recent-activity-card">
          <div className="widget-header-row">
            <div>
              <h3>Recent Activity</h3>
              <span className="widget-sub-hint">Realtime actions & audit log</span>
            </div>
            <button className="widget-link-btn" onClick={() => navigate('/tasks')}>
              View all →
            </button>
          </div>

          <div className="recent-activity-feed-wrap">
            {[
              { id: '1', initials: 'MS', color: '#06b6d4', user: 'Mateo Silva', action: 'moved Passkey Sign In to In Progress', email: 'mateo@trackify.com', time: '5m ago' },
              { id: '2', initials: 'PR', color: '#f43f5e', user: 'Priya Raman', action: 'completed Design System Tokens', email: 'priya@trackify.com', time: '18m ago' },
              { id: '3', initials: 'HK', color: '#8b5cf6', user: 'Hana Kobayashi', action: 'created a new task UI Improvements', email: 'hana@trackify.com', time: '1h ago' },
              { id: '4', initials: 'OM', color: '#f59e0b', user: 'Owen Mercer', action: 'assigned Marketing Assets to Sophia Lee', email: 'owen@trackify.com', time: '2h ago' },
              { id: '5', initials: 'SL', color: '#10b981', user: 'Sophia Lee', action: 'moved Mobile App Mockups to In Review', email: 'sophia@trackify.com', time: '3h ago' },
              { id: '6', initials: 'AC', color: '#3b82f6', user: 'Alex Chen', action: 'joined Trackify team via email invite', email: 'alex@trackify.com', time: '4h ago' },
            ].map(act => (
              <div key={act.id} className="activity-feed-row">
                <div className="activity-avatar" style={{ background: act.color }}>
                  {act.initials}
                </div>
                <div className="activity-content-col">
                  <p className="activity-text">
                    <strong>{act.user}</strong> {act.action}
                  </p>
                  <span className="activity-email-sub">{act.email}</span>
                </div>
                <span className="activity-time-stamp">{act.time}</span>
              </div>
            ))}
          </div>

          {/* Activity Live Pulse Bar */}
          <div className="activity-live-footer">
            <span className="activity-live-indicator">
              <span className="pulse-dot-cyan" /> Live sync active
            </span>
            <span className="activity-sync-tag">Encrypted channel</span>
          </div>
        </div>
      </div>

      {/* Row 4: Weekly Performance + Time Tracker */}
      <div className="dashboard-grid-split-row">
        {/* Card 1 (Span 2/3): Weekly Performance */}
        <div className="dashboard-widget-card weekly-performance-card">
          <div className="widget-header-row">
            <div>
              <h3>Weekly Performance</h3>
              <span className="widget-sub-hint">Compare completed vs created delivery rate</span>
            </div>
            <select
              className="widget-select-pill"
              value={perfFilter}
              onChange={e => setPerfFilter(e.target.value)}
            >
              <option value="This Week">This Week</option>
              <option value="Last Week">Last Week</option>
            </select>
          </div>

          {(() => {
            const currentPerf = PERFORMANCE_DATASETS[perfFilter] || PERFORMANCE_DATASETS['This Week'];
            return (
              <div className="performance-content-split">
                {/* Smooth Spline Wave Area Chart */}
                <div className="performance-spline-chart-box">
                  <div className="spline-chart-with-axis">
                    <div className="spline-svg-wrapper">
                      <svg className="spline-svg" viewBox="0 0 600 160">
                        <defs>
                          <linearGradient id="perfWaveGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.32" />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.01" />
                          </linearGradient>
                        </defs>

                        {/* Y-Axis Reference Gridlines and Labels */}
                        <line x1="38" y1="30" x2="570" y2="30" stroke="var(--border)" strokeDasharray="3 3" opacity="0.6" />
                        <text x="32" y="34" textAnchor="end" className="spline-axis-text">30</text>

                        <line x1="38" y1="70" x2="570" y2="70" stroke="var(--border)" strokeDasharray="3 3" opacity="0.6" />
                        <text x="32" y="74" textAnchor="end" className="spline-axis-text">20</text>

                        <line x1="38" y1="110" x2="570" y2="110" stroke="var(--border)" strokeDasharray="3 3" opacity="0.6" />
                        <text x="32" y="114" textAnchor="end" className="spline-axis-text">10</text>

                        <line x1="38" y1="145" x2="570" y2="145" stroke="var(--border)" opacity="0.8" />
                        <text x="32" y="148" textAnchor="end" className="spline-axis-text">0</text>

                        {/* Filled Area */}
                        <path
                          d={currentPerf.areaPath}
                          fill="url(#perfWaveGrad)"
                        />

                        {/* Previous Week Dashed Line */}
                        <path
                          d={currentPerf.prevPath}
                          fill="none"
                          stroke="#94a3b8"
                          strokeWidth="2"
                          strokeDasharray="4 4"
                        />

                        {/* Main Curved Spline Line */}
                        <path
                          d={currentPerf.linePath}
                          fill="none"
                          stroke="#2563eb"
                          strokeWidth="3.2"
                          strokeLinecap="round"
                        />

                        {/* Interactive Highlight Dots and Integrated Day Labels */}
                        {currentPerf.points.map((pt, i) => (
                          <g key={i}>
                            {/* Vertical Tick Guide */}
                            <line
                              x1={pt.x}
                              y1="25"
                              x2={pt.x}
                              y2="145"
                              stroke={hoveredPerfPoint?.day === pt.day ? "rgba(37, 99, 235, 0.4)" : "rgba(148, 163, 184, 0.15)"}
                              strokeDasharray={hoveredPerfPoint?.day === pt.day ? "none" : "2 2"}
                              strokeWidth={hoveredPerfPoint?.day === pt.day ? "1.5" : "1"}
                            />

                            {/* Data Point Dot */}
                            <circle
                              cx={pt.x}
                              cy={pt.y}
                              r={hoveredPerfPoint?.day === pt.day ? "7" : "5"}
                              fill={hoveredPerfPoint?.day === pt.day ? "#2563eb" : "#3b82f6"}
                              stroke="#ffffff"
                              strokeWidth={hoveredPerfPoint?.day === pt.day ? "3" : "2"}
                              className="spline-point-dot"
                              onMouseEnter={() => setHoveredPerfPoint(pt)}
                              onMouseLeave={() => setHoveredPerfPoint(null)}
                            />

                            {/* Aligned Day Label */}
                            <text
                              x={pt.x}
                              y="158"
                              textAnchor="middle"
                              className={`spline-day-text ${hoveredPerfPoint?.day === pt.day ? 'active-day' : ''}`}
                            >
                              {pt.day}
                            </text>
                          </g>
                        ))}
                      </svg>

                      {/* Tooltip on Point Hover */}
                      {hoveredPerfPoint && (
                        <div
                          className="spline-hover-tooltip"
                          style={{
                            left: `${(hoveredPerfPoint.x / 600) * 100}%`,
                            top: `${(hoveredPerfPoint.y / 160) * 100}%`
                          }}
                        >
                          <strong>{hoveredPerfPoint.day}</strong>: {hoveredPerfPoint.comp} completed
                          <span className="tooltip-sub">vs {hoveredPerfPoint.prev} prior</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="spline-bottom-legend">
                    <span className="legend-item"><span className="legend-dot blue-fill" /> This Week</span>
                    <span className="legend-item"><span className="legend-line-dashed" /> Previous Week</span>
                  </div>
                </div>

                {/* Performance Stats Badges */}
                <div className="performance-stats-group">
                  <div className="perf-metric-box">
                    <div className="perf-metric-header">
                      <span className="perf-label">Tasks Completed</span>
                      <span className="perf-badge green">{currentPerf.stats.completedTrend}</span>
                    </div>
                    <span className="perf-huge-num">{currentPerf.stats.completed}</span>
                    <span className="perf-comparison">{currentPerf.stats.completedVs}</span>
                  </div>

                  <div className="perf-metric-box">
                    <div className="perf-metric-header">
                      <span className="perf-label">Tasks Created</span>
                      <span className="perf-badge blue">{currentPerf.stats.createdTrend}</span>
                    </div>
                    <span className="perf-huge-num">{currentPerf.stats.created}</span>
                    <span className="perf-comparison">{currentPerf.stats.createdVs}</span>
                  </div>

                  <div className="perf-metric-box">
                    <div className="perf-metric-header">
                      <span className="perf-label">Overdue Tasks</span>
                      <span className="perf-badge red">{currentPerf.stats.overdueTrend}</span>
                    </div>
                    <span className="perf-huge-num">{currentPerf.stats.overdue}</span>
                    <span className="perf-comparison">{currentPerf.stats.overdueVs}</span>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Card 2 (Span 1/3): Time Tracker */}
        <div className="dashboard-widget-card time-tracker-full-card">
          <div className="widget-header-row">
            <h3>Time Tracker</h3>
            <button className="widget-link-btn" onClick={() => setShowHistoryModal(true)}>
              View History →
            </button>
          </div>

          <div className="time-tracker-top-selector-row">
            <select
              className="tracker-project-select"
              value={selectedTrackerProject}
              onChange={e => handleProjectSelectChange(e.target.value)}
            >
              {(userProjects || []).map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>

            <button
              className="btn-add-notes-pill"
              onClick={() => setShowNotesModal(true)}
              title="Add or view session notes"
            >
              Add Notes
            </button>
          </div>

          {/* Active Sprint Session Context & Notes Card (Eliminates Empty Gap) */}
          <div className="tracker-active-session-box" onClick={() => setShowNotesModal(true)} title="Click to view/edit session notes">
            <div className="session-box-header">
              <span className={`session-badge-pill ${timerRunning ? 'running' : 'paused'}`}>
                <span className={`pulse-dot-${timerRunning ? 'green' : 'amber'}`} />
                {timerRunning ? 'ACTIVE SPRINT SESSION' : 'SESSION PAUSED'}
              </span>
              <span className="session-edit-hint">Edit notes ✎</span>
            </div>
            <div className="session-notes-snippet">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
              <span>{currentSessionNotes || 'Biometric WebAuthn challenge handling and token verification.'}</span>
            </div>
            <div className="session-progress-line-track">
              <div className="session-progress-line-fill" style={{ width: '68%' }} />
            </div>
            <div className="session-meta-subrow">
              <span>Sprint Target: 2h 00m</span>
              <span>68% elapsed</span>
            </div>
          </div>

          {/* Clean Modern Timer Display and Controls matching Image 1 */}
          <div className="tracker-stage-horizontal-row">
            {/* Digital Clock Numbers & Live Status */}
            <div className="tracker-left-clock-block">
              <div className="tracker-digits-huge">
                {pad(hrs)}:{pad(mins)}:{pad(secs)}
              </div>
              <div className="tracker-live-indicator">
                <span className={`pulse-green-dot ${timerRunning ? 'active' : 'paused'}`} />
                <span>{timerRunning ? 'Tracking...' : 'Paused'}</span>
              </div>
            </div>

            {/* Action Buttons: Pause/Start & Stop/Reset */}
            <div className="tracker-action-buttons">
              <button
                className={`btn-tracker-ctrl pause-play ${timerRunning ? 'is-running' : 'is-paused'}`}
                onClick={toggleTimer}
                title={timerRunning ? "Pause stopwatch" : "Start stopwatch"}
              >
                {timerRunning ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16" rx="1.5" />
                    <rect x="14" y="4" width="4" height="16" rx="1.5" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="6 4 20 12 6 20 6 4" />
                  </svg>
                )}
              </button>

              <button
                className="btn-tracker-ctrl stop"
                onClick={resetTimer}
                title="Reset stopwatch to 00:00:00"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="5" y="5" width="14" height="14" rx="2" />
                </svg>
              </button>
            </div>

            {/* Today's Total Summary */}
            <div className="tracker-day-summary">
              <span className="day-summary-title">Today's Total</span>
              <span className="day-summary-val">3h 45m</span>
              <span className="day-summary-count">2 sessions</span>
            </div>
          </div>
        </div>
      </div>


      {/* Modern Add Project Modal */}
      {showAddProject && (
        <div className="modern-modal-backdrop" onClick={() => setShowAddProject(false)}>
          <div className="modern-modal-card" onClick={e => e.stopPropagation()}>
            <div className="modern-modal-header">
              <div className="header-badge-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <div className="header-title-wrap">
                <h2>Create New Project</h2>
                <p>Launch a new initiative with milestone deadlines and live tracking.</p>
              </div>
              <button className="modern-modal-close" onClick={() => setShowAddProject(false)}>✕</button>
            </div>

            <form onSubmit={handleAddProject} className="modern-modal-form">
              <div className="form-field-group">
                <label className="field-label">Project Name *</label>
                <div className="input-with-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
                  <input
                    type="text"
                    placeholder="e.g. Website Redesign v3"
                    value={newProject.name}
                    onChange={e => setNewProject({ ...newProject, name: e.target.value })}
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className="form-field-group">
                <label className="field-label">Project Theme & Icon</label>
                <div className="theme-chips-grid">
                  {PROJECT_THEMES.map(theme => (
                    <button
                      key={theme.id}
                      type="button"
                      className={`theme-chip-btn ${newProject.iconType === theme.id ? 'selected' : ''}`}
                      onClick={() => setNewProject({ ...newProject, iconType: theme.id, color: theme.color })}
                      style={{ '--chip-color': theme.color }}
                    >
                      <span className="chip-icon-box">{theme.icon}</span>
                      <span className="chip-name">{theme.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-two-col-row">
                <div className="form-field-group">
                  <label className="field-label">Category</label>
                  <select
                    value={newProject.category}
                    onChange={e => setNewProject({ ...newProject, category: e.target.value })}
                    className="modern-select-input"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Design">UI/UX Design</option>
                    <option value="Mobile">Mobile Apps</option>
                    <option value="Security">Security & Auth</option>
                    <option value="Marketing">Marketing & Launch</option>
                  </select>
                </div>

                <div className="form-field-group">
                  <label className="field-label">Status</label>
                  <select
                    value={newProject.status}
                    onChange={e => setNewProject({ ...newProject, status: e.target.value })}
                    className="modern-select-input"
                  >
                    <option value="running">🟢 Running / In Progress</option>
                    <option value="pending">🟡 Pending Review</option>
                    <option value="ended">⚪ Ended / Completed</option>
                  </select>
                </div>
              </div>

              <div className="form-two-col-row">
                <div className="form-field-group">
                  <label className="field-label">Target Due Date</label>
                  <input
                    type="date"
                    value={newProject.dueDate}
                    onChange={e => setNewProject({ ...newProject, dueDate: e.target.value })}
                    className="modern-text-input"
                    required
                  />
                </div>

                <div className="form-field-group">
                  <div className="progress-label-row">
                    <label className="field-label">Initial Progress</label>
                    <span className="progress-pct-value">{newProject.progress}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={newProject.progress}
                    onChange={e => setNewProject({ ...newProject, progress: e.target.value })}
                    className="modern-range-slider"
                  />
                </div>
              </div>

              <div className="modern-modal-actions">
                <button type="button" className="btn-modern-ghost" onClick={() => setShowAddProject(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-modern-primary">
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="modern-modal-backdrop" onClick={() => setShowAddMember(false)}>
          <div className="modern-modal-card" onClick={e => e.stopPropagation()}>
            <div className="modern-modal-header">
              <div className="header-badge-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>
                </svg>
              </div>
              <div className="header-title-wrap">
                <h2>Add Team Member</h2>
                <p>Invite a colleague to collaborate across projects and tasks.</p>
              </div>
              <button className="modern-modal-close" onClick={() => setShowAddMember(false)}>✕</button>
            </div>

            <form onSubmit={handleAddMember} className="modern-modal-form">
              <div className="form-field-group">
                <label className="field-label">Member Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Liam Taylor"
                  value={newMemberName}
                  onChange={e => setNewMemberName(e.target.value)}
                  className="modern-text-input"
                  required
                  autoFocus
                />
              </div>

              <div className="form-field-group">
                <label className="field-label">Working On (Module / Area)</label>
                <input
                  type="text"
                  placeholder="e.g. Design Tokens, Passkey Auth"
                  value={newMemberModule}
                  onChange={e => setNewMemberModule(e.target.value)}
                  className="modern-text-input"
                />
              </div>

              <div className="modern-modal-actions">
                <button type="button" className="btn-modern-ghost" onClick={() => setShowAddMember(false)}>Cancel</button>
                <button type="submit" className="btn-modern-primary">Add Member</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Data Modal */}
      {showImportData && (
        <div className="modern-modal-backdrop" onClick={() => setShowImportData(false)}>
          <div className="modern-modal-card" onClick={e => e.stopPropagation()}>
            <div className="modern-modal-header">
              <div className="header-badge-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              </div>
              <div className="header-title-wrap">
                <h2>Import Data</h2>
                <p>Import project deliverables and task hierarchies from CSV or Jira.</p>
              </div>
              <button className="modern-modal-close" onClick={() => setShowImportData(false)}>✕</button>
            </div>
            <div className="modern-modal-form">
              <div className="upload-dropzone" onClick={() => { setShowImportData(false); triggerToast('Sync Complete', 'Sample projects and tasks synchronized.', 'success'); }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                <span>Click to browse files or drag CSV here</span>
              </div>
              <div className="modern-modal-actions">
                <button type="button" className="btn-modern-ghost" onClick={() => setShowImportData(false)}>Cancel</button>
                <button type="button" className="btn-modern-primary" onClick={() => { setShowImportData(false); triggerToast('Sync Complete', 'External project data imported.', 'success'); }}>Import</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Time Tracking History Modal */}
      {showHistoryModal && (
        <div className="modern-modal-backdrop" onClick={() => setShowHistoryModal(false)}>
          <div className="modern-modal-card history-modal-card" onClick={e => e.stopPropagation()}>
            <div className="modern-modal-header">
              <div className="header-badge-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <div className="header-title-wrap">
                <h2>Time Tracking History</h2>
                <p>Recorded focus sessions, duration logs, and sprint tasks.</p>
              </div>
              <button className="modern-modal-close" onClick={() => setShowHistoryModal(false)}>✕</button>
            </div>

            <div className="history-summary-banner">
              <div className="history-metric-col">
                <span className="hist-label">Today's Recorded</span>
                <span className="hist-val">03h 45m</span>
              </div>
              <div className="history-metric-col">
                <span className="hist-label">Completed Sessions</span>
                <span className="hist-val">2 sessions</span>
              </div>
              <div className="history-metric-col">
                <span className="hist-label">Weekly Recorded</span>
                <span className="hist-val">18h 30m</span>
              </div>
            </div>

            <div className="history-table-wrapper">
              <table className="history-records-table">
                <thead>
                  <tr>
                    <th>Project</th>
                    <th>Duration</th>
                    <th>Time Period</th>
                    <th>Notes</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sessionLogs.map(s => (
                    <tr key={s.id}>
                      <td><strong>{s.project}</strong></td>
                      <td><span className="duration-pill">{s.duration}</span></td>
                      <td className="date-muted">{s.date}</td>
                      <td className="session-notes-cell">{s.notes}</td>
                      <td>
                        <span className={`status-chip ${s.status === 'Completed' ? 'completed' : 'running'}`}>
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="modern-modal-actions">
              <button
                type="button"
                className="btn-modern-ghost"
                onClick={() => {
                  triggerToast('Export CSV', 'Time tracking records exported to CSV.', 'success');
                }}
              >
                Export CSV
              </button>
              <button type="button" className="btn-modern-primary" onClick={() => setShowHistoryModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Session Notes Modal */}
      {showNotesModal && (
        <div className="modern-modal-backdrop" onClick={() => setShowNotesModal(false)}>
          <div className="modern-modal-card" onClick={e => e.stopPropagation()}>
            <div className="modern-modal-header">
              <div className="header-badge-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
              </div>
              <div className="header-title-wrap">
                <h2>Session Notes</h2>
                <p>Attach context or task details to your active timer window.</p>
              </div>
              <button className="modern-modal-close" onClick={() => setShowNotesModal(false)}>✕</button>
            </div>

            <div className="modern-modal-form">
              <div className="form-field-group">
                <label className="field-label">Active Project</label>
                <div className="project-chip-static">
                  {(userProjects || []).find(p => p.id === selectedTrackerProject)?.name || 'Project'}
                </div>
              </div>

              <div className="form-field-group">
                <label className="field-label">Session Notes</label>
                <textarea
                  className="modern-text-area"
                  rows={4}
                  placeholder="e.g. Working on biometric WebAuthn prompt and token validation..."
                  value={currentSessionNotes}
                  onChange={e => setCurrentSessionNotes(e.target.value)}
                />
              </div>

              <div className="modern-modal-actions">
                <button type="button" className="btn-modern-ghost" onClick={() => setShowNotesModal(false)}>Cancel</button>
                <button
                  type="button"
                  className="btn-modern-primary"
                  onClick={() => {
                    setShowNotesModal(false);
                    triggerToast('Notes Saved', 'Session notes updated for current tracking session.', 'success');
                  }}
                >
                  Save Notes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

