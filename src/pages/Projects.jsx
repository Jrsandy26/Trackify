import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';

const PROJECT_THEMES = [
  { id: 'stripes', label: 'Tech & Core', color: '#4f46e5', bg: '#eef2ff', icon: '///' },
  { id: 'mobile', label: 'Mobile App', color: '#10b981', bg: '#ecfdf5', icon: '📱' },
  { id: 'security', label: 'Security & Auth', color: '#f43f5e', bg: '#fff1f2', icon: '🛡️' },
  { id: 'marketing', label: 'Growth / Web', color: '#f59e0b', bg: '#fffbeb', icon: '📈' },
  { id: 'api', label: 'API & Cloud', color: '#8b5cf6', bg: '#f5f3ff', icon: '⚡' },
  { id: 'cluster', label: 'Data & DB', color: '#ec4899', bg: '#fdf2f8', icon: '💾' },
  { id: 'shield', label: 'Compliance', color: '#ea580c', bg: '#fff7ed', icon: '🔒' },
  { id: 'chart', label: 'Analytics', color: '#06b6d4', bg: '#ecfeff', icon: '📊' },
  { id: 'tools', label: 'DevTools', color: '#3b82f6', bg: '#eff6ff', icon: '⚙️' },
];

function renderProjectCardIcon(proj) {
  if (proj.iconType === 'stripes' || proj.name?.includes('Website')) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <line x1="4" y1="18" x2="10" y2="6" stroke="#4f46e5" strokeWidth="2.8" strokeLinecap="round"/>
        <line x1="10" y1="18" x2="16" y2="6" stroke="#4f46e5" strokeWidth="2.8" strokeLinecap="round"/>
        <line x1="16" y1="18" x2="22" y2="6" stroke="#4f46e5" strokeWidth="2.8" strokeLinecap="round"/>
      </svg>
    );
  }
  if (proj.iconType === 'mobile' || proj.name?.includes('Mobile')) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" fill="#10b981"/>
      </svg>
    );
  }
  if (proj.iconType === 'security' || proj.name?.includes('Passkey')) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="8" cy="8" r="6" fill="#f43f5e" />
        <path d="M12.5 12.5L21 21M17 17l2 2M15 19l2 2" stroke="#f43f5e" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }
  if (proj.iconType === 'marketing' || proj.name?.includes('Marketing')) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M11 5L6 9H2v6h4l5 4V5z" fill="#f59e0b"/>
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    );
  }
  if (proj.iconType === 'api' || proj.name?.includes('API')) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <rect x="4" y="4" width="16" height="16" rx="3" fill="#8b5cf6" />
        <line x1="9" y1="9" x2="9" y2="15" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="15" y1="9" x2="15" y2="15" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    );
  }
  if (proj.iconType === 'cluster' || proj.name?.includes('Migration')) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <ellipse cx="12" cy="5" rx="9" ry="3" fill="#ec4899"/>
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" stroke="#ec4899" strokeWidth="2"/>
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" stroke="#ec4899" strokeWidth="2"/>
      </svg>
    );
  }
  if (proj.iconType === 'shield' || proj.name?.includes('Security')) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="#ea580c"/>
      </svg>
    );
  }
  if (proj.iconType === 'chart' || proj.name?.includes('Analytics')) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <line x1="18" y1="20" x2="18" y2="10" stroke="#06b6d4" strokeWidth="3" strokeLinecap="round"/>
        <line x1="12" y1="20" x2="12" y2="4" stroke="#06b6d4" strokeWidth="3" strokeLinecap="round"/>
        <line x1="6" y1="20" x2="6" y2="14" stroke="#06b6d4" strokeWidth="3" strokeLinecap="round"/>
      </svg>
    );
  }
  return (
    <div style={{ width: 22, height: 22, background: proj.color || '#3b82f6', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.8rem', fontWeight: 700 }}>
      {proj.name?.charAt(0) || '★'}
    </div>
  );
}

export default function Projects() {
  const { state, dispatch, triggerToast } = useApp();

  // View state
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'running' | 'completed' | 'pending' | 'archived'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [searchQuery, setSearchQuery] = useState(state.searchQuery || '');
  const [sortBy, setSortBy] = useState('progress');
  const [selectedLead, setSelectedLead] = useState('all');
  const [selectedMember, setSelectedMember] = useState('all');
  const [searchTag, setSearchTag] = useState('');
  const [dateRange, setDateRange] = useState('all');
  const [statusFilterChecks, setStatusFilterChecks] = useState({
    running: false,
    completed: false,
    pending: false,
    archived: false
  });

  // Modals & Drawer state
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [managingProjectId, setManagingProjectId] = useState(null);
  const managingProject = useMemo(() => {
    if (!managingProjectId) return null;
    return (state.projects || []).find(p => p.id === managingProjectId) || null;
  }, [state.projects, managingProjectId]);
  const setManagingProject = (p) => setManagingProjectId(p ? (typeof p === 'object' ? p.id : p) : null);

  // New Project Form
  const [newProject, setNewProject] = useState({
    name: '',
    category: 'Engineering',
    status: 'running',
    progress: 15,
    dueDate: '2026-11-20',
    iconType: 'stripes',
    color: '#4f46e5',
    lead: 'Priya Raman',
    description: ''
  });

  // Task inline creation in drawer
  const [drawerNewTaskTitle, setDrawerNewTaskTitle] = useState('');
  const [drawerNewTaskPriority, setDrawerNewTaskPriority] = useState('medium');
  const [drawerNewTaskAssignee, setDrawerNewTaskAssignee] = useState('u1');
  const [drawerNewTaskDue, setDrawerNewTaskDue] = useState('2026-11-15');

  // Filtered projects
  const filteredProjects = useMemo(() => {
    let list = state.projects || [];

    // Tab filter
    if (activeTab === 'running') {
      list = list.filter(p => p.status === 'running' && (p.progress || 0) < 100);
    } else if (activeTab === 'completed') {
      list = list.filter(p => p.status === 'ended' || (p.progress || 0) === 100);
    } else if (activeTab === 'pending') {
      list = list.filter(p => p.status === 'pending');
    } else if (activeTab === 'archived') {
      list = list.filter(p => p.status === 'archived');
    }

    // Checkbox status filters from sidebar (if any checked)
    const activeCheckedStatuses = Object.keys(statusFilterChecks).filter(k => statusFilterChecks[k]);
    if (activeCheckedStatuses.length > 0) {
      list = list.filter(p => {
        if (activeCheckedStatuses.includes('completed') && (p.status === 'ended' || p.progress === 100)) return true;
        if (activeCheckedStatuses.includes('running') && p.status === 'running' && p.progress < 100) return true;
        if (activeCheckedStatuses.includes('pending') && p.status === 'pending') return true;
        if (activeCheckedStatuses.includes('archived') && p.status === 'archived') return true;
        return false;
      });
    }

    // Lead filter
    if (selectedLead !== 'all') {
      list = list.filter(p => p.lead === selectedLead || p.leadId === selectedLead);
    }

    // Member filter
    if (selectedMember !== 'all') {
      list = list.filter(p => (p.members || []).includes(selectedMember));
    }

    // Search Tag filter
    if (searchTag.trim()) {
      const t = searchTag.toLowerCase();
      list = list.filter(p =>
        p.category?.toLowerCase().includes(t) ||
        p.name?.toLowerCase().includes(t) ||
        p.description?.toLowerCase().includes(t)
      );
    }

    // Date Range filter
    if (dateRange === 'oct2026') {
      list = list.filter(p => p.dueDate?.includes('Oct'));
    } else if (dateRange === 'nov2026') {
      list = list.filter(p => p.dueDate?.includes('Nov'));
    }

    // Search query (either local or global topbar)
    const effectiveQuery = (searchQuery || state.searchQuery || '').trim().toLowerCase();
    if (effectiveQuery) {
      list = list.filter(p =>
        p.name?.toLowerCase().includes(effectiveQuery) ||
        p.description?.toLowerCase().includes(effectiveQuery) ||
        p.lead?.toLowerCase().includes(effectiveQuery) ||
        p.category?.toLowerCase().includes(effectiveQuery)
      );
    }

    // Sorting
    return [...list].sort((a, b) => {
      if (sortBy === 'progress') return (b.progress || 0) - (a.progress || 0);
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
      if (sortBy === 'due') return (a.dueDate || '').localeCompare(b.dueDate || '');
      return 0;
    });
  }, [state.projects, activeTab, statusFilterChecks, selectedLead, selectedMember, searchTag, dateRange, searchQuery, state.searchQuery, sortBy]);

  const clearAllFilters = () => {
    setActiveTab('all');
    setSelectedLead('all');
    setSelectedMember('all');
    setSearchTag('');
    setDateRange('all');
    setStatusFilterChecks({ running: false, completed: false, pending: false, archived: false });
    setSearchQuery('');
    if (dispatch) dispatch({ type: 'SET_SEARCH', payload: '' });
    if (triggerToast) triggerToast('Filters Cleared', 'Showing all projects without filters.', 'info');
  };


  // Metric counts
  const totalCount = state.projects?.length || 9;
  const completedCount = state.projects?.filter(p => p.status === 'ended' || p.progress === 100)?.length || 2;
  const runningCount = state.projects?.filter(p => p.status === 'running' && p.progress < 100)?.length || 5;
  const pendingCount = state.projects?.filter(p => p.status === 'pending')?.length || 2;

  // Create Project handler
  const handleCreateProject = (e) => {
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

    const leadUser = state.users.find(u => u.name === newProject.lead) || state.users[0];

    const projectPayload = {
      id: `p${Date.now()}`,
      name: newProject.name.trim(),
      status: newProject.status || 'running',
      progress: Number(newProject.progress) || 15,
      taskCount: '0/1',
      startDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      dueDate: formattedDue,
      rawDueDate: newProject.dueDate || '2026-11-20',
      lead: newProject.lead || leadUser.name,
      leadId: leadUser.id,
      members: [leadUser.id, state.currentUser?.id || 'u0'],
      description: newProject.description || `${newProject.name} created for team milestones.`,
      color: newProject.color || '#4f46e5',
      iconType: newProject.iconType || 'stripes',
      category: newProject.category || 'Engineering'
    };

    dispatch({ type: 'ADD_PROJECT', payload: projectPayload });
    if (triggerToast) triggerToast('Project Created 🎉', `"${newProject.name}" added successfully!`, 'success');

    setNewProject({
      name: '',
      category: 'Engineering',
      status: 'running',
      progress: 15,
      dueDate: '2026-11-20',
      iconType: 'stripes',
      color: '#4f46e5',
      lead: 'Priya Raman',
      description: ''
    });
    setShowNewProjectModal(false);
  };

  // Drawer task creation handler
  const handleAddDrawerTask = (e) => {
    e.preventDefault();
    if (!drawerNewTaskTitle.trim() || !managingProject) return;

    const taskPayload = {
      id: `t${Date.now()}`,
      title: drawerNewTaskTitle.trim(),
      description: `Task for ${managingProject.name}`,
      projectName: managingProject.name,
      status: 'todo',
      priority: drawerNewTaskPriority,
      progress: 0,
      assignee: drawerNewTaskAssignee,
      project: managingProject.id,
      dueDate: drawerNewTaskDue || '2026-11-15',
      createdAt: new Date().toISOString().split('T')[0],
      tags: [managingProject.category?.toLowerCase() || 'general']
    };

    dispatch({ type: 'ADD_TASK_TO_PROJECT', payload: taskPayload });
    if (triggerToast) triggerToast('Task Added', `"${drawerNewTaskTitle}" added to ${managingProject.name}!`, 'success');
    setDrawerNewTaskTitle('');
  };

  // Update task completion percentage with single live updating toast
  const handleUpdateTaskProgress = (taskId, newPct, taskTitle = 'Task') => {
    dispatch({
      type: 'UPDATE_TASK_PROGRESS',
      payload: { taskId, progress: newPct }
    });

    if (triggerToast) {
      const toastId = 'live_task_progress_active';
      if (newPct === 100) {
        triggerToast(
          'Task Completed! 🎉',
          `"${taskTitle}" reached 100% and is marked Done.`,
          'success',
          toastId,
          { progressPct: 100, isLiveProgress: true, taskTitle }
        );
      } else {
        triggerToast(
          'Progress Updating...',
          `"${taskTitle}" is now ${newPct}% complete`,
          'info',
          toastId,
          { progressPct: newPct, isLiveProgress: true, taskTitle }
        );
      }
    }
  };


  // Tasks belonging to currently managed project
  const currentProjectTasks = useMemo(() => {
    if (!managingProject) return [];
    return (state.tasks || []).filter(t => t.project === managingProject.id);
  }, [state.tasks, managingProject]);

  // Lead options for filter
  const uniqueLeads = Array.from(new Set((state.projects || []).map(p => p.lead).filter(Boolean)));

  return (
    <div className="projects-page-wrapper">
      {/* Top Header matching Image 2 */}
      <div className="projects-page-header">
        <div className="header-text-block">
          <h1>Projects</h1>
          <p>Plan, track and manage all your projects in one place.</p>
        </div>
        <button className="btn-new-project-pill" onClick={() => setShowNewProjectModal(true)}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          + New Project
        </button>
      </div>

      {/* Row 1: 4 Metric Cards matching Image 2 */}
      <div className="fernly-metrics-row projects-metrics-row">
        {/* Total Projects */}
        <div className="fernly-metric-card dark-card" onClick={() => setActiveTab('all')}>
          <div className="metric-card-top">
            <div className="metric-icon-square dark-blue">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
            </div>
            <span className="metric-title-small">Total Projects</span>
            <button className="metric-arrow-btn light"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg></button>
          </div>
          <div className="metric-value-huge">{totalCount}</div>
          <div className="metric-trend-row">
            <span className="trend-green">↑ 12%</span>
            <span className="trend-label">from last month</span>
          </div>
        </div>

        {/* Completed Projects */}
        <div className="fernly-metric-card white-card" onClick={() => setActiveTab('completed')}>
          <div className="metric-card-top">
            <div className="metric-icon-circle green">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <span className="metric-title-small">Completed Projects</span>
            <button className="metric-arrow-btn"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg></button>
          </div>
          <div className="metric-value-huge text-dark">{completedCount}</div>
          <div className="metric-trend-row">
            <span className="trend-green">↑ 6%</span>
            <span className="trend-label">from last month</span>
          </div>
        </div>

        {/* Running Projects */}
        <div className="fernly-metric-card white-card" onClick={() => setActiveTab('running')}>
          <div className="metric-card-top">
            <div className="metric-icon-circle blue">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            </div>
            <span className="metric-title-small">Running Projects</span>
            <button className="metric-arrow-btn"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg></button>
          </div>
          <div className="metric-value-huge text-dark">{runningCount}</div>
          <div className="metric-trend-row">
            <span className="trend-green">↑ 25%</span>
            <span className="trend-label">from last month</span>
          </div>
        </div>

        {/* Pending Projects */}
        <div className="fernly-metric-card white-card" onClick={() => setActiveTab('pending')}>
          <div className="metric-card-top">
            <div className="metric-icon-circle orange">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <span className="metric-title-small">Pending Projects</span>
            <button className="metric-arrow-btn"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg></button>
          </div>
          <div className="metric-value-huge text-dark">{pendingCount}</div>
          <div className="metric-trend-row">
            <span className="trend-label">No change</span>
          </div>
        </div>
      </div>

      {/* Main Content Layout: Left Grid/Table Area + Right Filter Sidebar */}
      <div className="projects-split-layout">
        <div className="projects-main-column">
          {/* Filter Bar with Tabs, Search, Sort, and Grid/List toggle */}
          <div className="projects-filter-bar">
            {/* Filter Tabs */}
            <div className="project-status-tabs">
              <button className={`status-tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
                All Projects ({totalCount})
              </button>
              <button className={`status-tab ${activeTab === 'running' ? 'active' : ''}`} onClick={() => setActiveTab('running')}>
                Running ({runningCount})
              </button>
              <button className={`status-tab ${activeTab === 'completed' ? 'active' : ''}`} onClick={() => setActiveTab('completed')}>
                Completed ({completedCount})
              </button>
              <button className={`status-tab ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')}>
                Pending ({pendingCount})
              </button>
              <button className={`status-tab ${activeTab === 'archived' ? 'active' : ''}`} onClick={() => setActiveTab('archived')}>
                Archived (0)
              </button>
            </div>

            {/* Controls */}
            <div className="project-bar-controls">
              {/* Search */}
              <div className="project-search-pill">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery || state.searchQuery || ''}
                  onChange={e => {
                    setSearchQuery(e.target.value);
                    if (dispatch) dispatch({ type: 'SET_SEARCH', payload: e.target.value });
                  }}
                />
                {(searchQuery || state.searchQuery) && (
                  <button
                    className="btn-clear-search-mini"
                    onClick={() => {
                      setSearchQuery('');
                      if (dispatch) dispatch({ type: 'SET_SEARCH', payload: '' });
                    }}
                    title="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>


              {/* Sort by */}
              <div className="project-sort-pill">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 5h10M11 9h7M11 13h4M3 17l3 3 3-3M6 18V4"/></svg>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
                  <option value="progress">Sort by: Progress</option>
                  <option value="name">Sort by: Name</option>
                  <option value="due">Sort by: Due Date</option>
                </select>
              </div>

              {/* Grid / List View Toggle */}
              <div className="view-toggle-pill">
                <button
                  className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  title="Grid View"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                  <span>Grid</span>
                </button>
                <button
                  className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                  title="List View"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                  <span>List</span>
                </button>
              </div>
            </div>
          </div>

          {/* GRID VIEW */}
          {viewMode === 'grid' && (
            <div className="projects-cards-grid">
              {filteredProjects.map((proj) => {
                const statusMeta = {
                  running: { label: 'Running', class: 'running' },
                  ended: { label: 'Completed', class: 'completed' },
                  pending: { label: 'Pending', class: 'pending' },
                  archived: { label: 'Archived', class: 'archived' }
                }[proj.status] || { label: 'Running', class: 'running' };

                return (
                  <div
                    key={proj.id}
                    className="project-display-card"
                    onClick={() => setManagingProject(proj)}
                  >
                    <div className="card-top-header">
                      <div className="project-icon-box">
                        {renderProjectCardIcon(proj)}
                      </div>
                      <div className="project-title-area">
                        <span className="project-heading">{proj.name}</span>
                        <span className={`status-chip ${statusMeta.class}`}>{statusMeta.label}</span>
                      </div>
                      <button
                        className="card-dots-btn"
                        onClick={(e) => { e.stopPropagation(); setManagingProject(proj); }}
                        title="Manage Project & Tasks"
                      >
                        •••
                      </button>
                    </div>

                    <p className="project-card-description">
                      {proj.description || 'Project deliverables, sprints and architecture tasks.'}
                    </p>

                    {/* Progress Bar */}
                    <div className="project-card-progress-bar">
                      <div className="progress-bar-track">
                        <div
                          className="progress-bar-fill"
                          style={{
                            width: `${proj.progress || 0}%`,
                            background: proj.status === 'ended' || proj.progress === 100 ? '#10b981' : proj.status === 'pending' ? '#f59e0b' : '#2563eb'
                          }}
                        />
                      </div>
                      <span className="progress-pct-text">{proj.progress || 0}%</span>
                    </div>

                    {/* Card Footer: Tasks, Date, Member Avatars */}
                    <div className="project-card-footer">
                      <div className="footer-meta-left">
                        <span className="meta-task-badge">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                          {proj.taskCount || '8/12 tasks'}
                        </span>
                        <span className="meta-due-badge">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                          {proj.dueDate}
                        </span>
                      </div>

                      {/* Avatars */}
                      <div className="avatar-stack-group">
                        {(proj.members || ['u1', 'u2', 'u0']).slice(0, 3).map((mId, i) => {
                          const user = state.users.find(u => u.id === mId) || { initials: 'T', color: '#6366f1' };
                          return (
                            <div
                              key={i}
                              className="stack-avatar"
                              style={{ background: user.color }}
                              title={user.name}
                            >
                              {user.initials}
                            </div>
                          );
                        })}
                        {(proj.members?.length || 4) > 3 && (
                          <div className="stack-avatar extra">
                            +{(proj.members?.length || 4) - 2}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* LIST / DATA TABLE VIEW matching Image 2 */}
          <div className="all-projects-table-container">
            <div className="table-header-action-row">
              <h3>All Projects</h3>
              <button
                className="btn-export-csv"
                onClick={() => triggerToast('Export Initiated', 'Project directory CSV downloaded.', 'success')}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Export
              </button>
            </div>

            <div className="table-responsive-wrapper">
              <table className="projects-data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Project Name</th>
                    <th>Status</th>
                    <th>Progress</th>
                    <th>Task Count</th>
                    <th>Start Date</th>
                    <th>Due Date</th>
                    <th>Project Lead</th>
                    <th>Members</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.map((p, idx) => {
                    const statusClass = {
                      running: 'running',
                      ended: 'completed',
                      pending: 'pending',
                      archived: 'archived'
                    }[p.status] || 'running';

                    const leadUser = state.users.find(u => u.name === p.lead || u.id === p.leadId) || { name: p.lead || 'Priya Raman', color: '#f43f5e', initials: 'PR' };

                    return (
                      <tr key={p.id} onClick={() => setManagingProject(p)}>
                        <td className="row-number-col">{idx + 1}</td>
                        <td className="project-cell-name">
                          <div className="table-icon-wrap">
                            {renderProjectCardIcon(p)}
                          </div>
                          <strong>{p.name}</strong>
                        </td>
                        <td>
                          <span className={`status-chip ${statusClass}`}>
                            {p.status === 'ended' ? 'Completed' : p.status === 'running' ? 'Running' : 'Pending'}
                          </span>
                        </td>
                        <td className="progress-cell-wrap">
                          <div className="table-progress-track">
                            <div
                              className="table-progress-fill"
                              style={{
                                width: `${p.progress || 0}%`,
                                background: p.status === 'ended' || p.progress === 100 ? '#10b981' : p.status === 'pending' ? '#f59e0b' : '#2563eb'
                              }}
                            />
                          </div>
                          <span className="table-pct-num">{p.progress || 0}%</span>
                        </td>
                        <td>{p.taskCount || '8/12'}</td>
                        <td className="date-muted">{p.startDate || 'Aug 01, 2026'}</td>
                        <td className="date-muted">{p.dueDate || 'Oct 25, 2026'}</td>
                        <td>
                          <div className="lead-avatar-cell">
                            <div className="lead-avatar-bubble" style={{ background: leadUser.color }}>
                              {leadUser.initials}
                            </div>
                            <span>{leadUser.name}</span>
                          </div>
                        </td>
                        <td>
                          <div className="avatar-stack-group small">
                            {(p.members || ['u1', 'u2', 'u0']).slice(0, 3).map((mId, i) => {
                              const u = state.users.find(user => user.id === mId) || { initials: 'T', color: '#6366f1' };
                              return (
                                <div key={i} className="stack-avatar" style={{ background: u.color }} title={u.name}>
                                  {u.initials}
                                </div>
                              );
                            })}
                            {(p.members?.length || 4) > 3 && (
                              <div className="stack-avatar extra">
                                +{(p.members?.length || 4) - 2}
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          <button
                            className="btn-manage-table"
                            onClick={(e) => { e.stopPropagation(); setManagingProject(p); }}
                            title="Manage Tasks & Details"
                          >
                            Manage
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Side Filter Sidebar matching Image 2 */}
        <aside className="projects-filter-sidebar">
          <div className="sidebar-filter-header">
            <h3>Filters</h3>
            <button
              className="btn-clear-filters"
              onClick={clearAllFilters}
            >
              Clear All
            </button>
          </div>

          {/* Status Checkboxes */}
          <div className="filter-section-group">
            <label className="sidebar-group-label">Status</label>
            <div className="checkbox-filter-list">
              {[
                { id: 'running', label: 'Running', count: runningCount },
                { id: 'completed', label: 'Completed', count: completedCount },
                { id: 'pending', label: 'Pending', count: pendingCount },
                { id: 'archived', label: 'Archived', count: 0 },
              ].map(st => (
                <label key={st.id} className="checkbox-item-label">
                  <input
                    type="checkbox"
                    checked={statusFilterChecks[st.id] || activeTab === st.id}
                    onChange={() => {
                      setStatusFilterChecks(prev => ({
                        ...prev,
                        [st.id]: !prev[st.id]
                      }));
                      if (activeTab === st.id) setActiveTab('all');
                    }}
                  />
                  <span>{st.label}</span>
                  <span className="badge-count">({st.count})</span>
                </label>
              ))}
            </div>
          </div>

          {/* Project Lead Dropdown */}
          <div className="filter-section-group">
            <label className="sidebar-group-label">Project Lead</label>
            <select
              className="sidebar-filter-select"
              value={selectedLead}
              onChange={e => setSelectedLead(e.target.value)}
            >
              <option value="all">All Leads</option>
              {uniqueLeads.map(lead => (
                <option key={lead} value={lead}>{lead}</option>
              ))}
            </select>
          </div>

          {/* Date Range Selector */}
          <div className="filter-section-group">
            <label className="sidebar-group-label">Date Range</label>
            <select
              className="sidebar-filter-select"
              value={dateRange}
              onChange={e => setDateRange(e.target.value)}
            >
              <option value="all">All Dates</option>
              <option value="oct2026">Due October 2026</option>
              <option value="nov2026">Due November 2026</option>
            </select>
          </div>

          {/* Members Selector */}
          <div className="filter-section-group">
            <label className="sidebar-group-label">Members</label>
            <select
              className="sidebar-filter-select"
              value={selectedMember}
              onChange={e => setSelectedMember(e.target.value)}
            >
              <option value="all">All Members</option>
              {state.users.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>

          {/* Search Tags */}
          <div className="filter-section-group">
            <label className="sidebar-group-label">Search Tags</label>
            <div className="sidebar-search-box">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input
                type="text"
                placeholder="e.g. design, api, marketing"
                value={searchTag}
                onChange={e => setSearchTag(e.target.value)}
              />
              {searchTag && (
                <button
                  type="button"
                  className="btn-clear-search-mini"
                  onClick={() => setSearchTag('')}
                  title="Clear tag filter"
                >
                  ✕
                </button>
              )}
            </div>
          </div>


          {/* Recent Activity mini feed */}
          <div className="sidebar-activity-section">
            <div className="sidebar-activity-header">
              <h4>Recent Activity</h4>
              <button className="text-link-mini" onClick={() => triggerToast('Activity Feed', 'Showing recent 5 updates.', 'info')}>View All</button>
            </div>

            <div className="sidebar-activity-feed">
              {[
                { dot: '#10b981', user: 'Mateo Silva', action: 'updated progress Mobile App v2.0 to 50%', time: '10 minutes ago' },
                { dot: '#6366f1', user: 'Priya Raman', action: 'completed a task Design System Tokens', time: '25 minutes ago' },
                { dot: '#f59e0b', user: 'Hana Kobayashi', action: 'created a new project Analytics Dashboard', time: '1 hour ago' },
                { dot: '#3b82f6', user: 'Owen Mercer', action: 'moved a task to In Review Marketing Assets', time: '2 hours ago' },
                { dot: '#ef4444', user: 'Sophia Lee', action: 'commented Please check the latest designs', time: '3 hours ago' },
              ].map((act, i) => (
                <div key={i} className="mini-activity-item">
                  <span className="activity-dot-pulse" style={{ background: act.dot }} />
                  <div className="mini-activity-content">
                    <p><strong>{act.user}</strong> {act.action}</p>
                    <span>{act.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* =========================================================================
          DETAILED PROJECT & TASK MANAGEMENT DRAWER / MODAL (USER REQUIREMENT)
          Allows managing progress, viewing members, adding tasks, and updating task completion!
          ========================================================================= */}
      {managingProject && (
        <div className="project-drawer-backdrop" onClick={() => setManagingProject(null)}>
          <div className="project-drawer-card" onClick={e => e.stopPropagation()}>
            {/* Drawer Header */}
            <div className="drawer-header-row">
              <div className="drawer-icon-badge" style={{ background: managingProject.color || '#4f46e5' }}>
                {renderProjectCardIcon(managingProject)}
              </div>
              <div className="drawer-title-col">
                <h2>{managingProject.name}</h2>
                <div className="drawer-meta-tags">
                  <span className={`status-chip ${managingProject.status}`}>{managingProject.status}</span>
                  <span className="drawer-category-pill">{managingProject.category || 'General'}</span>
                  <span className="drawer-due-pill">Due {managingProject.dueDate}</span>
                  <span className="drawer-lead-pill">Lead: {managingProject.lead || 'Priya Raman'}</span>
                </div>
              </div>
              <button className="drawer-close-btn" onClick={() => setManagingProject(null)}>✕</button>
            </div>

            {/* Overall Project Progress Slider */}
            <div className="drawer-overall-progress-box">
              <div className="progress-header-flex">
                <div>
                  <span className="overall-label">Overall Project Progress</span>
                  <p className="overall-subtext">Automatically recalibrates as you complete or update tasks below.</p>
                </div>
                <span className="huge-pct-badge" style={{ color: managingProject.color || '#2563eb' }}>
                  {managingProject.progress}%
                </span>
              </div>
              <div className="drawer-progress-track">
                <div
                  className="drawer-progress-fill"
                  style={{ width: `${managingProject.progress}%`, background: managingProject.color || '#2563eb' }}
                />
              </div>
            </div>

            {/* Tasks Management Section */}
            <div className="drawer-tasks-section">
              <div className="drawer-section-header">
                <h3>Project Tasks ({currentProjectTasks.length})</h3>
                <span className="subtext-hint">Slide progress or toggle status to update completion</span>
              </div>

              {/* Task Items List */}
              <div className="drawer-tasks-scrollable-list">
                {currentProjectTasks.length === 0 && (
                  <div className="empty-tasks-drawer">
                    <p>No tasks yet for this project. Add your first task below!</p>
                  </div>
                )}

                {currentProjectTasks.map(task => (
                  <div key={task.id} className="drawer-task-row">
                    <div className="task-row-top-info">
                      <div className="task-checkbox-title">
                        <input
                          type="checkbox"
                          checked={task.status === 'done' || task.progress === 100}
                          onChange={(e) => handleUpdateTaskProgress(task.id, e.target.checked ? 100 : 0, task.title)}
                          className="task-complete-checkbox"
                          title="Mark complete"
                        />
                        <strong className={task.status === 'done' || task.progress === 100 ? 'done-strike' : ''}>
                          {task.title}
                        </strong>
                      </div>
                      <div className="task-meta-right">
                        <span className={`status-badge status-${task.status}`}>{task.status}</span>
                        <span className="task-due-date">{task.dueDate}</span>
                      </div>
                    </div>

                    {/* Interactive Completion Slider */}
                    <div className="task-completion-control-row">
                      <span className="slider-label">Completed: <strong>{task.progress || (task.status === 'done' ? 100 : 0)}%</strong></span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={task.progress || (task.status === 'done' ? 100 : 0)}
                        onChange={(e) => handleUpdateTaskProgress(task.id, Number(e.target.value), task.title)}
                        className="task-progress-slider"
                      />
                      <button
                        className="btn-mark-100"
                        onClick={() => handleUpdateTaskProgress(task.id, 100, task.title)}
                        title="Mark Done"
                      >
                        ✓ Done
                      </button>
                    </div>

                  </div>
                ))}
              </div>

              {/* Add New Task Form */}
              <form onSubmit={handleAddDrawerTask} className="drawer-add-task-form">
                <h4>+ Add New Task to this Project</h4>
                <div className="drawer-task-inputs-grid">
                  <input
                    type="text"
                    placeholder="Task title (e.g. Passkey token flow)"
                    value={drawerNewTaskTitle}
                    onChange={e => setDrawerNewTaskTitle(e.target.value)}
                    className="modern-text-input"
                    required
                  />

                  <div className="drawer-inline-row">
                    <select
                      value={drawerNewTaskPriority}
                      onChange={e => setDrawerNewTaskPriority(e.target.value)}
                      className="modern-select-input"
                    >
                      <option value="high">High Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="low">Low Priority</option>
                    </select>

                    <select
                      value={drawerNewTaskAssignee}
                      onChange={e => setDrawerNewTaskAssignee(e.target.value)}
                      className="modern-select-input"
                    >
                      {state.users.map(u => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </select>

                    <input
                      type="date"
                      value={drawerNewTaskDue}
                      onChange={e => setDrawerNewTaskDue(e.target.value)}
                      className="modern-text-input"
                    />

                    <button type="submit" className="btn-add-task-submit">
                      Add Task
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Team Members in Project */}
            <div className="drawer-members-section">
              <div className="drawer-section-header">
                <h3>Assigned Team Members</h3>
              </div>
              <div className="drawer-members-pill-grid">
                {(managingProject.members || ['u1', 'u2', 'u0']).map((mId, i) => {
                  const user = state.users.find(u => u.id === mId) || { name: 'Member', role: 'Developer', color: '#6366f1', initials: 'M' };
                  return (
                    <div key={i} className="drawer-member-card">
                      <div className="collab-avatar-circle" style={{ background: user.color }}>
                        {user.initials}
                      </div>
                      <div className="member-detail-col">
                        <span className="member-name-bold">{user.name}</span>
                        <span className="member-role-sub">{user.role || 'Contributor'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Project Modal */}
      {showNewProjectModal && (
        <div className="modern-modal-backdrop" onClick={() => setShowNewProjectModal(false)}>
          <div className="modern-modal-card" onClick={e => e.stopPropagation()}>
            <div className="modern-modal-header">
              <div className="header-badge-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
              </div>
              <div className="header-title-wrap">
                <h2>Create New Project</h2>
                <p>Launch an initiative with deliverables, assignees, and milestones.</p>
              </div>
              <button className="modern-modal-close" onClick={() => setShowNewProjectModal(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateProject} className="modern-modal-form">
              <div className="form-field-group">
                <label className="field-label">Project Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Website Redesign v3"
                  value={newProject.name}
                  onChange={e => setNewProject({ ...newProject, name: e.target.value })}
                  className="modern-text-input"
                  required
                  autoFocus
                />
              </div>

              <div className="form-field-group">
                <label className="field-label">Theme & Icon</label>
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
                  <label className="field-label">Project Lead</label>
                  <select
                    value={newProject.lead}
                    onChange={e => setNewProject({ ...newProject, lead: e.target.value })}
                    className="modern-select-input"
                  >
                    {state.users.map(u => (
                      <option key={u.id} value={u.name}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-two-col-row">
                <div className="form-field-group">
                  <label className="field-label">Due Date</label>
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
                <button type="button" className="btn-modern-ghost" onClick={() => setShowNewProjectModal(false)}>Cancel</button>
                <button type="submit" className="btn-modern-primary">Create Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
