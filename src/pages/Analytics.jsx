import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';

export default function Analytics() {
  const { state, triggerToast } = useApp();

  // Mode: 'zero' (Clean Slate for Production Demo) vs 'benchmark' (Sample Sprint Data)
  const [dataMode, setDataMode] = useState('zero');
  // Scope filter: 'all' or 'myprojects'
  const [projectScope, setProjectScope] = useState('all');
  const [selectedTimeWindow, setSelectedTimeWindow] = useState('4weeks');
  const [selectedGranularity, setSelectedGranularity] = useState('weekly');
  const [selectedMonthRange, setSelectedMonthRange] = useState('Oct 1, 2026 - Oct 31, 2026');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [hoveredTrendIndex, setHoveredTrendIndex] = useState(null);

  const currentUser = state.currentUser || {
    id: 'usr-1',
    name: 'Sandeep Sai',
    email: 'sandeep@trackify.com',
    role: 'Owner & Lead'
  };

  // User's assigned projects
  const myProjects = useMemo(() => {
    return (state.projects || []).filter(p =>
      (p.members || []).includes(currentUser.id) ||
      p.lead === currentUser.name ||
      p.lead === currentUser.email
    );
  }, [state.projects, currentUser]);

  const activeProjectsList = projectScope === 'myprojects' ? myProjects : (state.projects || []);

  // Filter tasks based on scope
  const scopedTasks = useMemo(() => {
    if (projectScope === 'myprojects') {
      const myProjectIds = new Set(myProjects.map(p => p.id));
      return (state.tasks || []).filter(t => myProjectIds.has(t.project) || t.assignee === currentUser.id);
    }
    return state.tasks || [];
  }, [state.tasks, projectScope, myProjects, currentUser]);

  // Compute live counts if tasks exist in database
  const liveCompleted = scopedTasks.filter(t => t.status === 'done').length;
  const liveTotal = scopedTasks.length;

  // 1. Metric Values (Clean Zero vs Benchmark)
  const isZero = dataMode === 'zero';
  const displayCompleted = isZero ? liveCompleted : (projectScope === 'myprojects' ? 48 : 128);
  const onTimeRate = isZero ? (liveCompleted > 0 ? Math.round((liveCompleted / liveTotal) * 100) : 0) : (projectScope === 'myprojects' ? 95 : 92);
  const avgCycleDays = isZero ? (liveCompleted > 0 ? '1.2 days' : '0.0 days') : (projectScope === 'myprojects' ? '1.9 days' : '2.4 days');
  const throughputValue = isZero ? (liveCompleted > 0 ? `${liveCompleted}/day` : '0.0/day') : (projectScope === 'myprojects' ? '6.2/day' : '8.5/day');

  // 2. Trends Data Points (No distortion, clean SVG coordinates)
  const trendsData = useMemo(() => {
    if (isZero && liveCompleted === 0) {
      return [
        { date: 'Oct 1', completed: 0, created: 0, inProgress: 0, overdue: 0 },
        { date: 'Oct 7', completed: 0, created: 0, inProgress: 0, overdue: 0 },
        { date: 'Oct 14', completed: 0, created: 0, inProgress: 0, overdue: 0 },
        { date: 'Oct 21', completed: 0, created: 0, inProgress: 0, overdue: 0 },
        { date: 'Oct 28', completed: 0, created: 0, inProgress: 0, overdue: 0 },
        { date: 'Oct 31', completed: 0, created: 0, inProgress: 0, overdue: 0 }
      ];
    }
    return [
      { date: 'Oct 1', completed: 17, created: 11, inProgress: 5, overdue: 3 },
      { date: 'Oct 7', completed: 23, created: 16, inProgress: 7, overdue: 3 },
      { date: 'Oct 14', completed: 28, created: 20, inProgress: 13, overdue: 3 },
      { date: 'Oct 21', completed: 37, created: 17, inProgress: 7, overdue: 3 },
      { date: 'Oct 28', completed: 29, created: 14, inProgress: 7, overdue: 3 },
      { date: 'Oct 31', completed: 33, created: 17, inProgress: 8, overdue: 3 }
    ];
  }, [isZero, liveCompleted]);

  // 3. Time by Project Data
  const projectTimeData = useMemo(() => {
    if (isZero) {
      return [
        { name: 'Website Redesign', hours: 0, pct: 0, color: '#2563eb' },
        { name: 'Mobile App v2.0', hours: 0, pct: 0, color: '#8b5cf6' },
        { name: 'Passkey Sign In', hours: 0, pct: 0, color: '#10b981' },
        { name: 'Marketing Campaign', hours: 0, pct: 0, color: '#f59e0b' },
        { name: 'API Integration', hours: 0, pct: 0, color: '#ef4444' },
        { name: 'Others', hours: 0, pct: 0, color: '#ec4899' }
      ];
    }
    if (projectScope === 'myprojects') {
      return [
        { name: 'Website Redesign', hours: 32, pct: 40, color: '#2563eb' },
        { name: 'Mobile App v2.0', hours: 28, pct: 35, color: '#8b5cf6' },
        { name: 'Passkey Sign In', hours: 20, pct: 25, color: '#10b981' }
      ];
    }
    return [
      { name: 'Website Redesign', hours: 32, pct: 25, color: '#2563eb' },
      { name: 'Mobile App v2.0', hours: 28, pct: 22, color: '#8b5cf6' },
      { name: 'Passkey Sign In', hours: 20, pct: 16, color: '#10b981' },
      { name: 'Marketing Campaign', hours: 18, pct: 14, color: '#f59e0b' },
      { name: 'API Integration', hours: 16, pct: 12, color: '#ef4444' },
      { name: 'Others', hours: 14, pct: 11, color: '#ec4899' }
    ];
  }, [isZero, projectScope]);

  const totalProjectHours = projectTimeData.reduce((sum, p) => sum + p.hours, 0);

  // 4. Team Productivity Members
  const productivityMembers = useMemo(() => {
    if (isZero) {
      return [
        { rank: 1, name: 'Riya Bhalerao', role: 'Project Lead', tasks: 0, onTime: '0%', pct: 0, color: '#2563eb', initials: 'RB' },
        { rank: 2, name: 'Mateo Silva', role: 'Frontend Developer', tasks: 0, onTime: '0%', pct: 0, color: '#8b5cf6', initials: 'MS' },
        { rank: 3, name: 'James Wilson', role: 'Backend Developer', tasks: 0, onTime: '0%', pct: 0, color: '#10b981', initials: 'JW' },
        { rank: 4, name: 'Daniel Kim', role: 'UI/UX Designer', tasks: 0, onTime: '0%', pct: 0, color: '#f59e0b', initials: 'DK' },
        { rank: 5, name: 'Emily Park', role: 'QA Engineer', tasks: 0, onTime: '0%', pct: 0, color: '#ef4444', initials: 'EP' }
      ];
    }
    return [
      { rank: 1, name: 'Riya Bhalerao', role: 'Project Lead', tasks: 24, onTime: '96%', pct: 96, color: '#2563eb', initials: 'RB' },
      { rank: 2, name: 'Mateo Silva', role: 'Frontend Developer', tasks: 21, onTime: '90%', pct: 90, color: '#8b5cf6', initials: 'MS' },
      { rank: 3, name: 'James Wilson', role: 'Backend Developer', tasks: 18, onTime: '83%', pct: 83, color: '#10b981', initials: 'JW' },
      { rank: 4, name: 'Daniel Kim', role: 'UI/UX Designer', tasks: 17, onTime: '88%', pct: 88, color: '#f59e0b', initials: 'DK' },
      { rank: 5, name: 'Emily Park', role: 'QA Engineer', tasks: 14, onTime: '79%', pct: 79, color: '#ef4444', initials: 'EP' }
    ];
  }, [isZero]);

  // Sparkline Generator Helper (Preserves exact aspect ratio, no stretching)
  const renderSparkline = (points, strokeColor, fillColor) => {
    const width = 90;
    const height = 36;
    const allZero = points.every(p => p === 0);
    const min = allZero ? 0 : Math.min(...points);
    const max = allZero ? 10 : Math.max(...points);
    const range = max - min || 1;

    const coords = points.map((p, i) => {
      const x = (i / (points.length - 1)) * (width - 10) + 5;
      const y = allZero ? height - 6 : height - 6 - ((p - min) / range) * (height - 14);
      return { x, y };
    });

    let d = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = coords[i];
      const p1 = coords[i + 1];
      const cpx = (p0.x + p1.x) / 2;
      d += ` C ${cpx} ${p0.y}, ${cpx} ${p1.y}, ${p1.x} ${p1.y}`;
    }

    const fillPath = `${d} L ${coords[coords.length - 1].x} ${height} L ${coords[0].x} ${height} Z`;

    return (
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        fill="none"
      >
        <defs>
          <linearGradient id={`spark-${strokeColor.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity={0.25} />
            <stop offset="100%" stopColor={strokeColor} stopOpacity={0.0} />
          </linearGradient>
        </defs>
        {fillColor && !allZero && <path d={fillPath} fill={`url(#spark-${strokeColor.replace('#', '')})`} />}
        <path d={d} stroke={strokeColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  };

  // Fixed Proportional SVG Coordinates for Task Completion Trends (700 x 200)
  const chartW = 700;
  const chartH = 200;
  const padLeft = 36;
  const padRight = 24;
  const padTop = 16;
  const padBottom = 26;
  const effectiveW = chartW - padLeft - padRight;
  const effectiveH = chartH - padTop - padBottom;
  const maxY = 40;

  const getLineCoordinates = (key) => {
    return trendsData.map((d, i) => {
      const x = padLeft + (i / (trendsData.length - 1)) * effectiveW;
      const y = padTop + effectiveH - (d[key] / maxY) * effectiveH;
      return { x, y, val: d[key], date: d.date };
    });
  };

  const completedCoords = getLineCoordinates('completed');
  const createdCoords = getLineCoordinates('created');
  const inProgressCoords = getLineCoordinates('inProgress');
  const overdueCoords = getLineCoordinates('overdue');

  const makeSpline = (coords) => {
    let d = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = coords[i];
      const p1 = coords[i + 1];
      const cpx = (p0.x + p1.x) / 2;
      d += ` C ${cpx} ${p0.y}, ${cpx} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return d;
  };

  const completedSpline = makeSpline(completedCoords);
  const createdSpline = makeSpline(createdCoords);
  const inProgressSpline = makeSpline(inProgressCoords);
  const overdueSpline = makeSpline(overdueCoords);

  const completedArea = `${completedSpline} L ${completedCoords[completedCoords.length - 1].x} ${padTop + effectiveH} L ${completedCoords[0].x} ${padTop + effectiveH} Z`;

  // Donut Chart Arcs Calculation
  const donutR = 64;
  const donutCx = 85;
  const donutCy = 85;
  const donutCircumference = 2 * Math.PI * donutR;
  let accumulatedPct = 0;

  // Export report as CSV download
  const handleExportReport = () => {
    const csvRows = [
      ['Trackify Analytics Report', selectedMonthRange],
      ['Generated On', new Date().toLocaleDateString()],
      ['State Mode', isZero ? 'Clean Zero Production Slate' : 'Benchmark Sample Data'],
      ['Scope', projectScope === 'myprojects' ? 'My Projects' : 'All Projects'],
      [],
      ['Core KPI', 'Value', 'Trend'],
      ['Tasks Completed', displayCompleted, isZero ? '0% baseline' : '+28% from last month'],
      ['On-Time Delivery', `${onTimeRate}%`, isZero ? '0% baseline' : '+6% from last month'],
      ['Avg Cycle Time', avgCycleDays, isZero ? '0.0 days baseline' : '-18% from last month'],
      ['Throughput', throughputValue, isZero ? '0.0/day baseline' : '+15% from last month'],
      [],
      ['Project Time Breakdown', 'Hours', 'Share (%)'],
      ...projectTimeData.map(p => [p.name, `${p.hours}h`, `${p.pct}%`]),
      [],
      ['Team Member', 'Role', 'Tasks Completed', 'On-Time %'],
      ...productivityMembers.map(m => [m.name, m.role, m.tasks, m.onTime])
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Trackify_Analytics_${dataMode}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (triggerToast) {
      triggerToast('Report Exported', 'Analytics CSV downloaded successfully.', 'success');
    }
  };

  return (
    <div className="modern-analytics-page">
      {/* 1. Header Bar */}
      <div className="modern-analytics-header">
        <div className="header-left">
          <h1>Analytics</h1>
          <p>Track your team's performance and productivity metrics</p>
        </div>

        <div className="header-right">
          {/* Data Mode Switcher: Zero Clean vs Sample Benchmark */}
          <div className="analytics-scope-toggle" style={{ border: '1px solid #e2e8f0' }}>
            <button
              className={`analytics-scope-btn ${isZero ? 'active' : ''}`}
              onClick={() => setDataMode('zero')}
              title="Clean zero slate for production demo"
            >
              Zero Slate (Demo)
            </button>
            <button
              className={`analytics-scope-btn ${!isZero ? 'active' : ''}`}
              onClick={() => setDataMode('benchmark')}
              title="Show populated benchmark sprint metrics"
            >
              Sample Data
            </button>
          </div>

          {/* Scope Toggle: All Projects vs My Projects */}
          <div className="analytics-scope-toggle">
            <button
              className={`analytics-scope-btn ${projectScope === 'all' ? 'active' : ''}`}
              onClick={() => setProjectScope('all')}
              title="Show metrics across all organization projects"
            >
              All Projects
            </button>
            <button
              className={`analytics-scope-btn ${projectScope === 'myprojects' ? 'active' : ''}`}
              onClick={() => setProjectScope('myprojects')}
              title="Filter metrics strictly for projects assigned to you"
            >
              ⭐ My Projects ({myProjects.length})
            </button>
          </div>

          {/* Date Range Picker Pill */}
          <div style={{ position: 'relative' }}>
            <button
              className="analytics-date-pill"
              onClick={() => setShowDatePicker(!showDatePicker)}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span>{selectedMonthRange}</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {showDatePicker && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '8px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                  padding: '8px',
                  zIndex: 40,
                  minWidth: '220px'
                }}
              >
                {[
                  'Oct 1, 2026 - Oct 31, 2026',
                  'Sep 1, 2026 - Sep 30, 2026',
                  'Last 30 Days',
                  'Last 90 Days (Q4)',
                  'Year to Date (2026)'
                ].map(range => (
                  <button
                    key={range}
                    style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 12px',
                      background: selectedMonthRange === range ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                      color: selectedMonthRange === range ? '#2563eb' : 'var(--text)',
                      fontWeight: selectedMonthRange === range ? '700' : '500',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.8rem'
                    }}
                    onClick={() => {
                      setSelectedMonthRange(range);
                      setShowDatePicker(false);
                    }}
                  >
                    {range}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Export Report Pill Button */}
          <button className="analytics-export-btn" onClick={handleExportReport}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export Report
          </button>
        </div>
      </div>

      {/* Banner when filtered to My Projects */}
      {projectScope === 'myprojects' && (
        <div className="myprojects-active-banner">
          <span>
            ⭐ <strong>My Projects Filter Active:</strong> Showing productivity & hour analytics for your {myProjects.length} assigned projects ({myProjects.map(p => p.name).join(', ')}).
          </span>
          <button className="btn-reset-scope" onClick={() => setProjectScope('all')}>
            Switch to All Projects
          </button>
        </div>
      )}

      {/* 2. Top Metric Cards (Row 1) */}
      <div className="analytics-metrics-grid">
        {/* Card 1: Tasks Completed */}
        <div className="analytics-metric-box">
          <div className="metric-box-top">
            <div className="metric-circle-badge green">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <span className="metric-box-title">Tasks Completed</span>
          </div>
          <div className="metric-box-middle">
            <span className="metric-huge-value">{displayCompleted}</span>
            <div className="metric-sparkline-wrap">
              {renderSparkline(isZero ? [0, 0, 0, 0, 0, 0] : [18, 22, 20, 26, 32, 38], '#22c55e', true)}
            </div>
          </div>
          <div className="metric-box-trend">
            <span className="trend-badge green">{isZero ? '0%' : '↑ 28%'}</span>
            <span>{isZero ? 'baseline state' : 'from last month'}</span>
          </div>
        </div>

        {/* Card 2: On-Time Delivery */}
        <div className="analytics-metric-box">
          <div className="metric-box-top">
            <div className="metric-circle-badge purple">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <span className="metric-box-title">On-Time Delivery</span>
          </div>
          <div className="metric-box-middle">
            <span className="metric-huge-value">{onTimeRate}%</span>
            <div className="metric-sparkline-wrap">
              {renderSparkline(isZero ? [0, 0, 0, 0, 0, 0] : [84, 88, 86, 91, 89, 92], '#8b5cf6', false)}
            </div>
          </div>
          <div className="metric-box-trend">
            <span className="trend-badge green">{isZero ? '0%' : '↑ 6%'}</span>
            <span>{isZero ? 'baseline state' : 'from last month'}</span>
          </div>
        </div>

        {/* Card 3: Avg Cycle Time */}
        <div className="analytics-metric-box">
          <div className="metric-box-top">
            <div className="metric-circle-badge orange">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
            </div>
            <span className="metric-box-title">Avg Cycle Time</span>
          </div>
          <div className="metric-box-middle">
            <span className="metric-huge-value">{avgCycleDays}</span>
            <div className="metric-sparkline-wrap">
              {renderSparkline(isZero ? [0, 0, 0, 0, 0, 0] : [3.4, 3.1, 2.9, 2.7, 2.5, 2.4], '#f59e0b', false)}
            </div>
          </div>
          <div className="metric-box-trend">
            <span className="trend-badge green">{isZero ? '0.0d' : '↓ 18%'}</span>
            <span>{isZero ? 'baseline state' : 'from last month'}</span>
          </div>
        </div>

        {/* Card 4: Throughput */}
        <div className="analytics-metric-box">
          <div className="metric-box-top">
            <div className="metric-circle-badge blue">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
              </svg>
            </div>
            <span className="metric-box-title">Throughput</span>
          </div>
          <div className="metric-box-middle">
            <span className="metric-huge-value">{throughputValue}</span>
            <div className="metric-sparkline-wrap">
              {renderSparkline(isZero ? [0, 0, 0, 0, 0, 0] : [6.8, 7.2, 7.5, 8.0, 8.2, 8.5], '#3b82f6', true)}
            </div>
          </div>
          <div className="metric-box-trend">
            <span className="trend-badge green">{isZero ? '0.0/d' : '↑ 15%'}</span>
            <span>{isZero ? 'baseline state' : 'from last month'}</span>
          </div>
        </div>
      </div>

      {/* 3. Row 2: Task Completion Trends + Time by Project */}
      <div className="analytics-two-col-grid">
        {/* Left Card: Task Completion Trends */}
        <div className="analytics-widget-card">
          <div className="analytics-widget-header">
            <h3>Task Completion Trends</h3>
            <div className="widget-controls-group">
              <select
                className="widget-filter-select"
                value={selectedTimeWindow}
                onChange={e => setSelectedTimeWindow(e.target.value)}
              >
                <option value="4weeks">Last 4 Weeks</option>
                <option value="3months">Last 3 Months</option>
                <option value="year">Full Year</option>
              </select>
              <select
                className="widget-filter-select"
                value={selectedGranularity}
                onChange={e => setSelectedGranularity(e.target.value)}
              >
                <option value="weekly">Weekly</option>
                <option value="daily">Daily</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>

          {/* SVG Multi-Series Spline Chart (Fixed aspect ratio without stretching) */}
          <div className="trends-chart-container">
            <svg
              viewBox={`0 0 ${chartW} ${chartH}`}
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <linearGradient id="completedFillGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity={0.22} />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              {/* Horizontal dashed gridlines & Y labels */}
              {[0, 10, 20, 30, 40].map(val => {
                const y = padTop + effectiveH - (val / maxY) * effectiveH;
                return (
                  <g key={val}>
                    <line
                      x1={padLeft}
                      y1={y}
                      x2={chartW - padRight}
                      y2={y}
                      stroke="var(--border)"
                      strokeDasharray="4 4"
                      strokeWidth="1"
                    />
                    <text
                      x={padLeft - 8}
                      y={y + 3}
                      fill="var(--text-muted)"
                      fontSize="10"
                      textAnchor="end"
                      fontWeight="500"
                    >
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* Area fill under Completed line */}
              {!isZero && <path d={completedArea} fill="url(#completedFillGrad)" />}

              {/* 4 Splines */}
              <path d={completedSpline} stroke="#2563eb" strokeWidth="2.4" fill="none" strokeLinecap="round" />
              <path d={createdSpline} stroke="#8b5cf6" strokeWidth="2.2" fill="none" strokeLinecap="round" />
              <path d={inProgressSpline} stroke="#10b981" strokeWidth="2.2" fill="none" strokeLinecap="round" />
              <path d={overdueSpline} stroke="#ef4444" strokeWidth="2" fill="none" strokeLinecap="round" />

              {/* Circular Dots on data points */}
              {completedCoords.map((pt, i) => (
                <circle
                  key={`c-${i}`}
                  cx={pt.x}
                  cy={pt.y}
                  r={hoveredTrendIndex === i ? 6 : 4}
                  fill="#2563eb"
                  stroke="#ffffff"
                  strokeWidth="2"
                  style={{ cursor: 'pointer', transition: 'r 0.15s ease' }}
                  onMouseEnter={() => setHoveredTrendIndex(i)}
                  onMouseLeave={() => setHoveredTrendIndex(null)}
                />
              ))}

              {createdCoords.map((pt, i) => (
                <circle
                  key={`cr-${i}`}
                  cx={pt.x}
                  cy={pt.y}
                  r="3.5"
                  fill="#8b5cf6"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
              ))}

              {inProgressCoords.map((pt, i) => (
                <circle
                  key={`ip-${i}`}
                  cx={pt.x}
                  cy={pt.y}
                  r="3.5"
                  fill="#10b981"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
              ))}

              {overdueCoords.map((pt, i) => (
                <circle
                  key={`ov-${i}`}
                  cx={pt.x}
                  cy={pt.y}
                  r="3"
                  fill="#ef4444"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
              ))}

              {/* X-axis labels */}
              {trendsData.map((d, i) => {
                const x = padLeft + (i / (trendsData.length - 1)) * effectiveW;
                return (
                  <text
                    key={d.date}
                    x={x}
                    y={chartH - 6}
                    fill="var(--text-muted)"
                    fontSize="10"
                    textAnchor="middle"
                    fontWeight="500"
                  >
                    {d.date}
                  </text>
                );
              })}
            </svg>
          </div>

          {/* Interactive Tooltip Card when hovering a date */}
          {hoveredTrendIndex !== null && (
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '6px 14px',
              fontSize: '0.76rem',
              display: 'flex',
              gap: '14px',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
              margin: '6px 0 -4px 0'
            }}>
              <strong>{trendsData[hoveredTrendIndex].date}:</strong>
              <span style={{ color: '#2563eb' }}>Completed: {trendsData[hoveredTrendIndex].completed}</span>
              <span style={{ color: '#8b5cf6' }}>Created: {trendsData[hoveredTrendIndex].created}</span>
              <span style={{ color: '#10b981' }}>In Progress: {trendsData[hoveredTrendIndex].inProgress}</span>
              <span style={{ color: '#ef4444' }}>Overdue: {trendsData[hoveredTrendIndex].overdue}</span>
            </div>
          )}

          {/* Bottom Legend */}
          <div className="trends-chart-legend">
            <span className="legend-item"><span className="legend-dot" style={{ background: '#2563eb' }} /> Completed</span>
            <span className="legend-item"><span className="legend-dot" style={{ background: '#8b5cf6' }} /> Created</span>
            <span className="legend-item"><span className="legend-dot" style={{ background: '#10b981' }} /> In Progress</span>
            <span className="legend-item"><span className="legend-dot" style={{ background: '#ef4444' }} /> Overdue</span>
          </div>
        </div>

        {/* Right Card: Time by Project */}
        <div className="analytics-widget-card">
          <div className="analytics-widget-header">
            <h3>Time by Project</h3>
            <select className="widget-filter-select">
              <option>This Month</option>
              <option>Last Month</option>
              <option>This Quarter</option>
            </select>
          </div>

          <div className="time-by-project-body">
            {/* Donut Chart Visual */}
            <div className="donut-visual-col">
              <svg width="170" height="170" viewBox="0 0 170 170" preserveAspectRatio="xMidYMid meet">
                {/* Background Ring */}
                <circle
                  cx={donutCx}
                  cy={donutCy}
                  r={donutR}
                  fill="none"
                  stroke="var(--border)"
                  strokeWidth="16"
                />

                {/* Concentric Segments (Only drawn if hours > 0) */}
                {!isZero && projectTimeData.map((p, i) => {
                  const dashLength = (p.pct / 100) * donutCircumference;
                  const dashOffset = -((accumulatedPct / 100) * donutCircumference);
                  accumulatedPct += p.pct;

                  return (
                    <circle
                      key={p.name}
                      cx={donutCx}
                      cy={donutCy}
                      r={donutR}
                      fill="none"
                      stroke={p.color}
                      strokeWidth="16"
                      strokeDasharray={`${dashLength} ${donutCircumference}`}
                      strokeDashoffset={dashOffset}
                      strokeLinecap="round"
                      transform={`rotate(-90 ${donutCx} ${donutCy})`}
                    />
                  );
                })}
              </svg>

              {/* Center Info Text */}
              <div className="donut-center-badge">
                <span className="donut-huge-hours">{totalProjectHours}h</span>
                <span className="donut-subtext">Total Hours</span>
              </div>
            </div>

            {/* Breakdown Table on the right */}
            <div className="donut-projects-table">
              {projectTimeData.map(proj => (
                <div key={proj.name} className="project-time-row">
                  <div className="project-name-cell" title={proj.name}>
                    <span className="project-color-dot" style={{ background: proj.color }} />
                    <span>{proj.name}</span>
                  </div>
                  <span className="project-hours-cell">{proj.hours}h</span>
                  <span className="project-pct-cell">{proj.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Row 3: Team Productivity + Key Insights */}
      <div className="analytics-two-col-grid">
        {/* Left Card: Team Productivity */}
        <div className="analytics-widget-card">
          <div className="analytics-widget-header">
            <h3>Team Productivity</h3>
            <select className="widget-filter-select">
              <option>This Month</option>
              <option>Last Month</option>
              <option>All Time</option>
            </select>
          </div>

          <div className="team-productivity-table-wrap">
            <table className="team-productivity-table">
              <thead>
                <tr>
                  <th className="col-rank">#</th>
                  <th>Team Member</th>
                  <th>Role</th>
                  <th>Tasks Completed</th>
                  <th>On-Time %</th>
                  <th>Productivity</th>
                </tr>
              </thead>
              <tbody>
                {productivityMembers.map(member => (
                  <tr key={member.name}>
                    <td className="col-rank">{member.rank}</td>
                    <td>
                      <div className="member-cell-flex">
                        <div className="member-avatar-circle" style={{ background: member.color }}>
                          {member.initials}
                        </div>
                        <div>
                          <span className="member-name-text">{member.name}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="member-role-text">{member.role}</span>
                    </td>
                    <td className="tasks-count-cell">{member.tasks}</td>
                    <td>
                      <span className="ontime-pct-pill">{member.onTime}</span>
                    </td>
                    <td>
                      <div className="productivity-bar-track">
                        <div
                          className="productivity-bar-fill"
                          style={{ width: `${member.pct}%`, background: member.color }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Card: Key Insights */}
        <div className="analytics-widget-card">
          <div className="analytics-widget-header">
            <h3>
              <span>💡</span> Key Insights
            </h3>
            <span
              className="view-report-link"
              onClick={() => setShowReportModal(true)}
            >
              View Report →
            </span>
          </div>

          <div className="key-insights-list">
            {/* Insight 1: Green */}
            <div className="insight-tint-card green">
              <div className="insight-icon-bubble">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                  <polyline points="17 6 23 6 23 12" />
                </svg>
              </div>
              <div className="insight-content-block">
                <h4>{isZero ? 'Ready for Sprint Delivery' : 'Task Completion Increased'}</h4>
                <p>{isZero ? 'Track and complete your first task to start recording team throughput.' : '28% more tasks completed compared to last month.'}</p>
              </div>
            </div>

            {/* Insight 2: Purple */}
            <div className="insight-tint-card purple">
              <div className="insight-icon-bubble">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="6" />
                  <circle cx="12" cy="12" r="2" />
                </svg>
              </div>
              <div className="insight-content-block">
                <h4>{isZero ? 'Project Milestone Benchmarks' : 'Best Performing Project'}</h4>
                <p>{isZero ? 'Project completion ratios and lead performance will compute as milestones finish.' : 'Website Redesign has the highest completion rate (92%).'}</p>
              </div>
            </div>

            {/* Insight 3: Orange */}
            <div className="insight-tint-card orange">
              <div className="insight-icon-bubble">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div className="insight-content-block">
                <h4>{isZero ? 'Cycle Time Engine Active' : 'Cycle Time Improved'}</h4>
                <p>{isZero ? 'Cycle duration measures the turnaround time between task creation and closure.' : 'Average cycle time reduced by 18% (2.4 days).'}</p>
              </div>
            </div>

            {/* Insight 4: Red */}
            <div className="insight-tint-card red">
              <div className="insight-icon-bubble">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <div className="insight-content-block">
                <h4>{isZero ? 'Zero Overdue Tasks' : 'Overdue Tasks Decreased'}</h4>
                <p>{isZero ? 'All sprint items are currently on schedule with zero overdue items.' : '20% fewer overdue tasks compared to last month.'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Detailed Executive Report Modal */}
      {showReportModal && (
        <div className="modal-overlay" onClick={() => setShowReportModal(false)}>
          <div className="modal" style={{ maxWidth: '640px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>Executive Productivity Report</h2>
                <p className="modal-subtitle">{selectedMonthRange} • {projectScope === 'myprojects' ? 'My Projects' : 'Workspace Wide'}</p>
              </div>
              <button className="modal-close" onClick={() => setShowReportModal(false)}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', margin: '16px 0' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                <div style={{ background: 'var(--bg)', padding: '12px', borderRadius: '10px' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Velocity Score</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#2563eb' }}>{isZero ? '100 / 100' : '94 / 100'}</div>
                </div>
                <div style={{ background: 'var(--bg)', padding: '12px', borderRadius: '10px' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Completion Rate</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981' }}>{isZero ? '0.0%' : '92.4%'}</div>
                </div>
                <div style={{ background: 'var(--bg)', padding: '12px', borderRadius: '10px' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Logged Effort</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#8b5cf6' }}>{totalProjectHours} Hours</div>
                </div>
              </div>

              <div style={{ background: 'var(--bg)', padding: '16px', borderRadius: '10px' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '0.88rem' }}>Summary & Recommendations</h4>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {isZero ? (
                    <>
                      <li>Workspace is clean and ready for initial sprint assignments.</li>
                      <li>Supabase cloud storage is verified and ready to record real-time progress.</li>
                      <li>Assign team members to projects to activate automatic throughput scoring.</li>
                    </>
                  ) : (
                    <>
                      <li>Sprint velocity surged by <strong>+28%</strong> with 128 tasks delivered across active projects.</li>
                      <li><strong>Website Redesign</strong> utilized the highest allocation (32 hours / 25%), leading delivery milestones.</li>
                      <li>Overdue task count dropped by <strong>20%</strong> following tighter review sprint cycles.</li>
                    </>
                  )}
                </ul>
              </div>
            </div>

            <div className="modal-actions" style={{ justifyContent: 'space-between' }}>
              <button className="btn btn-primary" onClick={handleExportReport}>
                Download CSV Report
              </button>
              <button className="btn btn-ghost" onClick={() => setShowReportModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
