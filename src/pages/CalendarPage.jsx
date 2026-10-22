import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function normalizeDate(raw) {
  if (!raw) return '';
  const str = String(raw).trim();
  const lower = str.toLowerCase();

  const today = new Date(2026, 9, 22); // Default anchored to Oct 22, 2026 for consistent context
  const pad = (n) => String(n).padStart(2, '0');
  const formatYMD = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  if (lower === 'today') return formatYMD(today);
  if (lower === 'tomorrow') {
    const tmrw = new Date(today);
    tmrw.setDate(today.getDate() + 1);
    return formatYMD(tmrw);
  }
  if (lower === 'yesterday') {
    const yest = new Date(today);
    yest.setDate(today.getDate() - 1);
    return formatYMD(yest);
  }

  const ymdMatch = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (ymdMatch) {
    return `${ymdMatch[1]}-${pad(Number(ymdMatch[2]))}-${pad(Number(ymdMatch[3]))}`;
  }

  try {
    let parseable = str;
    if (!parseable.includes('202') && !parseable.includes('201')) {
      parseable = `${str}, 2026`;
    }
    const d = new Date(parseable);
    if (!isNaN(d.getTime())) {
      return formatYMD(d);
    }
  } catch {
    // fallback
  }

  return '';
}

// Seed events meticulously matching the user's reference mockup for October 2026
const INITIAL_REFERENCE_EVENTS = [
  { id: 'ref-1', date: '2026-10-01', time: '10:00 AM', title: 'API Integration', category: 'task', project: 'Website Redesign', type: 'my_tasks' },
  { id: 'ref-2', date: '2026-10-01', time: '03:00 PM', title: 'Security Audit', category: 'personal', project: 'Mobile App v2.0', type: 'team_tasks' },
  { id: 'ref-3', date: '2026-10-02', time: '11:00 AM', title: 'Design System', category: 'task', project: 'Website Redesign', type: 'my_tasks' },
  { id: 'ref-4', date: '2026-10-03', time: '02:00 PM', title: 'Family Time', category: 'personal', project: 'General', type: 'my_tasks' },
  { id: 'ref-5', date: '2026-10-04', time: '09:00 AM', title: 'Plan Q4 Campaign', category: 'milestone', project: 'Marketing Campaign', type: 'milestones' },
  { id: 'ref-6', date: '2026-10-05', time: '10:00 AM', title: 'Mobile App UI', category: 'task', project: 'Mobile App v2.0', type: 'my_tasks' },
  { id: 'ref-7', date: '2026-10-05', time: '04:00 PM', title: 'Project Sync', category: 'meeting', project: 'General', type: 'meetings' },
  { id: 'ref-8', date: '2026-10-06', time: '11:00 AM', title: 'Requirements Review', category: 'task', project: 'Passkey Sign In', type: 'my_tasks' },
  { id: 'ref-9', date: '2026-10-07', time: '02:00 PM', title: 'Client Meeting', category: 'meeting', project: 'General', type: 'meetings' },
  { id: 'ref-10', date: '2026-10-08', time: '09:00 AM', title: 'Create Marketing Assets', category: 'task', project: 'Marketing Campaign', type: 'my_tasks' },
  { id: 'ref-11', date: '2026-10-08', time: '02:00 PM', title: 'Budget Discussion', category: 'personal', project: 'General', type: 'team_tasks' },
  { id: 'ref-12', date: '2026-10-09', time: '10:00 AM', title: 'Code Implementation', category: 'task', project: 'Website Redesign', type: 'my_tasks' },
  { id: 'ref-13', date: '2026-10-09', time: '04:00 PM', title: 'Sprint Planning', category: 'meeting', project: 'General', type: 'meetings' },
  { id: 'ref-14', date: '2026-10-10', time: '11:00 AM', title: 'Marketing Campaign', category: 'milestone', project: 'Marketing Campaign', type: 'milestones' },
  { id: 'ref-15', date: '2026-10-12', time: '02:00 PM', title: 'Team Sync', category: 'meeting', project: 'General', type: 'meetings' },
  { id: 'ref-16', date: '2026-10-13', time: '01:00 PM', title: 'DB Optimization', category: 'task', project: 'Trackify App', type: 'my_tasks' },
  { id: 'ref-17', date: '2026-10-13', time: '04:00 PM', title: 'Design Review', category: 'milestone', project: 'Mobile App v2.0', type: 'milestones' },
  { id: 'ref-18', date: '2026-10-14', time: '09:00 AM', title: 'API Integration', category: 'task', project: 'Website Redesign', type: 'my_tasks' },
  { id: 'ref-19', date: '2026-10-15', time: '10:00 AM', title: 'User Testing', category: 'personal', project: 'Website Redesign', type: 'team_tasks' },
  { id: 'ref-20', date: '2026-10-15', time: '03:00 PM', title: 'Stakeholder Call', category: 'meeting', project: 'General', type: 'meetings' },
  { id: 'ref-21', date: '2026-10-16', time: '11:00 AM', title: 'Feature Planning', category: 'task', project: 'Mobile App v2.0', type: 'my_tasks' },
  { id: 'ref-22', date: '2026-10-18', time: '10:00 AM', title: 'Cache & SQL Review', category: 'task', project: 'Website Redesign', type: 'my_tasks' },
  { id: 'ref-23', date: '2026-10-19', time: '09:00 AM', title: 'Deploy Staging', category: 'personal', project: 'Mobile App v2.0', type: 'team_tasks' },
  { id: 'ref-24', date: '2026-10-19', time: '03:00 PM', title: 'Release Planning', category: 'meeting', project: 'General', type: 'meetings' },
  { id: 'ref-25', date: '2026-10-20', time: '10:00 AM', title: 'UI Improvements', category: 'task', project: 'Website Redesign', type: 'my_tasks' },
  { id: 'ref-26', date: '2026-10-20', time: '02:00 PM', title: 'Design Homepage', category: 'milestone', project: 'Website Redesign', type: 'milestones' },
  { id: 'ref-27', date: '2026-10-21', time: '11:00 AM', title: 'Validate Outcome', category: 'personal', project: 'Passkey Sign In', type: 'team_tasks' },
  // TODAY: Oct 22, 2026
  { id: 'ref-28', date: '2026-10-22', time: '10:00 AM', title: 'Adding feature to dashboard', category: 'task', project: 'Website Redesign', type: 'my_tasks' },
  { id: 'ref-29', date: '2026-10-22', time: '02:00 PM', title: 'Team Sync Meeting', category: 'meeting', project: 'General', type: 'meetings' },
  { id: 'ref-30', date: '2026-10-22', time: '04:30 PM', title: 'Design Review', category: 'milestone', project: 'Mobile App v2.0', type: 'milestones' },
  { id: 'ref-30b', date: '2026-10-22', time: '05:30 PM', title: 'Sprint Retrospective', category: 'meeting', project: 'General', type: 'meetings' },
  { id: 'ref-30c', date: '2026-10-22', time: '06:00 PM', title: 'Push Production Hotfix', category: 'task', project: 'Trackify App', type: 'my_tasks' },
  // TOMORROW: Oct 23, 2026
  { id: 'ref-31', date: '2026-10-23', time: '09:00 AM', title: 'Testing & Bug Fixes', category: 'personal', project: 'Passkey Sign In', type: 'team_tasks' },
  { id: 'ref-32', date: '2026-10-23', time: '11:00 AM', title: 'Prepare Slides', category: 'task', project: 'Marketing Campaign', type: 'my_tasks' },
  { id: 'ref-33', date: '2026-10-23', time: '03:00 PM', title: 'Sprint Planning', category: 'meeting', project: 'General', type: 'meetings' },
  { id: 'ref-33b', date: '2026-10-23', time: '05:00 PM', title: 'Code Review', category: 'milestone', project: 'Mobile App v2.0', type: 'milestones' },
  // Later in October
  { id: 'ref-34', date: '2026-10-24', time: '10:00 AM', title: 'Code Review', category: 'deadline', project: 'Mobile App v2.0', type: 'team_tasks' },
  { id: 'ref-35', date: '2026-10-24', time: '02:00 PM', title: 'Design Review', category: 'milestone', project: 'Mobile App v2.0', type: 'milestones' },
  { id: 'ref-36', date: '2026-10-25', time: '09:00 AM', title: 'Setup CI/CD', category: 'task', project: 'Passkey Sign In', type: 'my_tasks' },
  { id: 'ref-37', date: '2026-10-25', time: '01:00 PM', title: 'Review Figma', category: 'milestone', project: 'Website Redesign', type: 'milestones' },
  { id: 'ref-38', date: '2026-10-25', time: '04:00 PM', title: 'Deploy v2.0', category: 'personal', project: 'Mobile App v2.0', type: 'team_tasks' },
  { id: 'ref-39', date: '2026-10-26', time: '10:00 AM', title: 'Mobile Responsiveness', category: 'task', project: 'Website Redesign', type: 'my_tasks' },
  { id: 'ref-40', date: '2026-10-27', time: '11:00 AM', title: 'Security Vulnerability Patch', category: 'deadline', project: 'Passkey Sign In', type: 'team_tasks' },
  { id: 'ref-41', date: '2026-10-28', time: '10:00 AM', title: 'Implement Passkey', category: 'task', project: 'Passkey Sign In', type: 'my_tasks' },
  { id: 'ref-42', date: '2026-10-28', time: '03:00 PM', title: 'Marketing Assets', category: 'personal', project: 'Marketing Campaign', type: 'team_tasks' },
  { id: 'ref-43', date: '2026-10-29', time: '11:00 AM', title: 'Design System Update', category: 'task', project: 'Website Redesign', type: 'my_tasks' },
  { id: 'ref-44', date: '2026-10-30', time: '10:00 AM', title: 'Write API Docs', category: 'task', project: 'Trackify App', type: 'my_tasks' },
  { id: 'ref-45', date: '2026-10-30', time: '02:00 PM', title: 'Integration Testing', category: 'personal', project: 'Website Redesign', type: 'team_tasks' },
  { id: 'ref-46', date: '2026-10-31', time: '11:00 AM', title: 'User Onboarding', category: 'personal', project: 'Passkey Sign In', type: 'team_tasks' },
  // Trailing next month
  { id: 'ref-47', date: '2026-11-01', time: '10:00 AM', title: 'Performance Optimization', category: 'task', project: 'Website Redesign', type: 'my_tasks' },
  { id: 'ref-48', date: '2026-11-04', time: '02:00 PM', title: 'Project Retrospective', category: 'meeting', project: 'General', type: 'meetings' },
  { id: 'ref-49', date: '2026-11-05', time: '10:00 AM', title: 'Setup Monitoring', category: 'task', project: 'Trackify App', type: 'my_tasks' },
  { id: 'ref-50', date: '2026-11-05', time: '03:00 PM', title: 'Security Audit', category: 'milestone', project: 'Website Redesign', type: 'milestones' }
];

export default function CalendarPage() {
  const { state, dispatch, triggerToast } = useApp();

  // Current active calendar focus (anchored in Oct 2026)
  const [currentDate, setCurrentDate] = useState(new Date(2026, 9, 22));
  const [view, setView] = useState('month'); // 'month' | 'week' | 'day' | 'agenda'
  const [selectedDate, setSelectedDate] = useState('2026-10-22');

  // Calendar View filters (toggle checkboxes and eye visibility)
  const [activeViews, setActiveViews] = useState({
    my_tasks: true,
    team_tasks: true,
    milestones: true,
    meetings: true
  });

  const [visibleViews, setVisibleViews] = useState({
    my_tasks: true,
    team_tasks: true,
    milestones: true,
    meetings: true
  });

  // Filter dropdown & Project filter
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [selectedProjectFilter, setSelectedProjectFilter] = useState('all');

  // Custom local events added during the session
  const [customEvents, setCustomEvents] = useState([]);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEventDetail, setSelectedEventDetail] = useState(null);
  const [overflowModalData, setOverflowModalData] = useState(null);

  // Add Event Form State
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState('2026-10-22');
  const [newEventTime, setNewEventTime] = useState('10:00 AM');
  const [newEventCategory, setNewEventCategory] = useState('task'); // task, meeting, milestone, personal, deadline
  const [newEventProject, setNewEventProject] = useState('Website Redesign');
  const [newEventPriority, setNewEventPriority] = useState('medium');

  const pad = (n) => String(n).padStart(2, '0');
  const formatDateStr = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;
  const todayStr = '2026-10-22'; // Reference active date

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Consolidate events from reference, AppContext state (tasks, todos, reminders, projects) & custom events
  const allEvents = useMemo(() => {
    const list = [...INITIAL_REFERENCE_EVENTS, ...customEvents];

    // Merge in tasks from AppContext
    (state.tasks || []).forEach(t => {
      const d = normalizeDate(t.dueDate);
      if (d) {
        // Prevent duplicate with reference seed
        if (!list.some(e => e.title.toLowerCase() === t.title.toLowerCase() && e.date === d)) {
          const isMe = t.assignee === (state.currentUser?.id || 'u0');
          list.push({
            id: t.id,
            date: d,
            time: '11:00 AM',
            title: t.title,
            category: t.priority === 'urgent' ? 'deadline' : 'task',
            project: state.projects.find(p => p.id === t.project)?.name || 'Trackify',
            type: isMe ? 'my_tasks' : 'team_tasks',
            raw: t
          });
        }
      }
    });

    // Merge in reminders from AppContext
    (state.reminders || []).forEach(r => {
      const d = normalizeDate(r.date);
      if (d) {
        if (!list.some(e => e.title.toLowerCase() === r.title.toLowerCase() && e.date === d)) {
          list.push({
            id: r.id,
            date: d,
            time: r.time || '02:00 PM',
            title: r.title,
            category: 'meeting',
            project: 'General',
            type: 'meetings',
            raw: r
          });
        }
      }
    });

    // Merge in projects from AppContext
    (state.projects || []).forEach(p => {
      const d = normalizeDate(p.dueDate);
      if (d) {
        if (!list.some(e => e.title.toLowerCase() === p.name.toLowerCase() && e.date === d)) {
          list.push({
            id: `proj-${p.id}`,
            date: d,
            time: '04:00 PM',
            title: `${p.name} Launch`,
            category: 'milestone',
            project: p.name,
            type: 'milestones',
            raw: p
          });
        }
      }
    });

    return list;
  }, [state.tasks, state.reminders, state.projects, state.currentUser, customEvents]);

  // Apply filters: Sidebar Checklist & Dropdown Filters
  const filteredEvents = useMemo(() => {
    return allEvents.filter(ev => {
      // Checkbox filter
      if (!activeViews[ev.type]) return false;
      // Eye visibility toggle
      if (!visibleViews[ev.type]) return false;

      // Category filter dropdown
      if (selectedCategoryFilter !== 'all' && ev.category !== selectedCategoryFilter) {
        return false;
      }
      // Project filter dropdown
      if (selectedProjectFilter !== 'all' && ev.project !== selectedProjectFilter) {
        return false;
      }

      return true;
    });
  }, [allEvents, activeViews, visibleViews, selectedCategoryFilter, selectedProjectFilter]);

  // Event category colors & aesthetics matching the reference design
  const categoryConfig = {
    task: {
      name: 'Task',
      color: '#0284c7', // vibrant cyan/blue
      bg: '#e0f2fe',
      border: '#0284c7',
      text: '#0369a1'
    },
    meeting: {
      name: 'Meeting',
      color: '#f59e0b', // warm orange
      bg: '#fef3c7',
      border: '#f59e0b',
      text: '#b45309'
    },
    milestone: {
      name: 'Milestone',
      color: '#a855f7', // purple
      bg: '#f3e8ff',
      border: '#a855f7',
      text: '#7e22ce'
    },
    personal: {
      name: 'Personal',
      color: '#22c55e', // green
      bg: '#dcfce7',
      border: '#22c55e',
      text: '#15803d'
    },
    deadline: {
      name: 'Deadline',
      color: '#ef4444', // red/coral
      bg: '#fee2e2',
      border: '#ef4444',
      text: '#b91c1c'
    }
  };

  // Month navigation
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => {
    setCurrentDate(new Date(2026, 9, 22));
    setSelectedDate('2026-10-22');
  };

  // Build Month Grid
  const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y, m) => new Date(y, m, 1).getDay(); // 0 is Sunday

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const prevMonthDays = getDaysInMonth(year, month - 1);

  const calendarCells = [];

  // Previous month trailing days
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    const m = month - 1;
    const dateStr = formatDateStr(m < 0 ? year - 1 : year, m < 0 ? 11 : m, d);
    calendarCells.push({ day: d, dateStr, isCurrentMonth: false });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = formatDateStr(year, month, d);
    calendarCells.push({ day: d, dateStr, isCurrentMonth: true });
  }

  // Next month leading days (fill 35 or 42 cells)
  const totalSlots = calendarCells.length > 35 ? 42 : 35;
  const remaining = totalSlots - calendarCells.length;
  for (let d = 1; d <= remaining; d++) {
    const m = month + 1;
    const dateStr = formatDateStr(m > 11 ? year + 1 : year, m > 11 ? 0 : m, d);
    calendarCells.push({ day: d, dateStr, isCurrentMonth: false });
  }

  // Mini Calendar grid for left sidebar
  const miniCells = useMemo(() => {
    const cells = [];
    for (let i = firstDay - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const m = month - 1;
      cells.push({ day: d, dateStr: formatDateStr(m < 0 ? year - 1 : year, m < 0 ? 11 : m, d), isCurrentMonth: false });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ day: d, dateStr: formatDateStr(year, month, d), isCurrentMonth: true });
    }
    const rem = 35 - cells.length > 0 ? 35 - cells.length : 42 - cells.length;
    for (let d = 1; d <= rem; d++) {
      const m = month + 1;
      cells.push({ day: d, dateStr: formatDateStr(m > 11 ? year + 1 : year, m > 11 ? 0 : m, d), isCurrentMonth: false });
    }
    return cells;
  }, [year, month, firstDay, prevMonthDays, daysInMonth]);

  // Upcoming items for Next 7 days
  const upcomingEvents = useMemo(() => {
    const todayEvents = filteredEvents.filter(e => e.date === '2026-10-22');
    const tomorrowEvents = filteredEvents.filter(e => e.date === '2026-10-23');
    return {
      today: todayEvents,
      tomorrow: tomorrowEvents
    };
  }, [filteredEvents]);

  // Open Add Event modal
  const handleOpenAddModal = (dateStr) => {
    setNewEventDate(dateStr || selectedDate || '2026-10-22');
    setNewEventTitle('');
    setShowAddModal(true);
  };

  // Submit Add Event
  const handleCreateEvent = (e) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;

    const chosenDate = newEventDate || '2026-10-22';
    const typeMapping = {
      task: 'my_tasks',
      personal: 'team_tasks',
      milestone: 'milestones',
      meeting: 'meetings',
      deadline: 'my_tasks'
    };

    const newEv = {
      id: `ev-${Date.now()}`,
      date: chosenDate,
      time: newEventTime,
      title: newEventTitle.trim(),
      category: newEventCategory,
      project: newEventProject,
      type: typeMapping[newEventCategory] || 'my_tasks',
      priority: newEventPriority
    };

    // Save to custom events so it shows in calendar
    setCustomEvents(prev => [...prev, newEv]);

    // Also dispatch to AppContext for cross-functionality!
    if (newEventCategory === 'task' || newEventCategory === 'deadline') {
      dispatch({
        type: 'ADD_TASK',
        payload: {
          id: `t${Date.now()}`,
          title: newEventTitle.trim(),
          description: `Scheduled for ${chosenDate} at ${newEventTime}`,
          status: 'todo',
          priority: newEventPriority,
          assignee: state.currentUser?.id || 'u0',
          project: state.projects[0]?.id || 'p1',
          dueDate: chosenDate,
          createdAt: '2026-10-22',
          tags: ['calendar', newEventCategory]
        }
      });
    } else if (newEventCategory === 'meeting') {
      dispatch({
        type: 'ADD_REMINDER',
        payload: {
          id: `r${Date.now()}`,
          title: newEventTitle.trim(),
          date: chosenDate,
          time: newEventTime,
          type: 'Meeting'
        }
      });
    }

    if (triggerToast) {
      triggerToast('Event Added', `"${newEventTitle.trim()}" scheduled for ${chosenDate}`, 'success');
    }

    setShowAddModal(false);
    setNewEventTitle('');
  };

  // Toggle checklist filter
  const toggleViewCheck = (key) => {
    setActiveViews(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Toggle eye visibility
  const toggleViewEye = (e, key) => {
    e.stopPropagation();
    setVisibleViews(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="ref-calendar-page-wrapper">
      {/* 1. Header Bar */}
      <header className="ref-calendar-header">
        <div className="ref-cal-header-left">
          <h1 className="ref-cal-title">Calendar</h1>
          <p className="ref-cal-subtitle">Track team tasks, personal to-dos, project milestones, and reminders.</p>
        </div>

        <div className="ref-cal-header-right">
          {/* View Switcher: Month, Week, Day, Agenda */}
          <div className="ref-view-segmented-control">
            <button
              className={`ref-view-tab ${view === 'month' ? 'active' : ''}`}
              onClick={() => setView('month')}
            >
              Month
            </button>
            <button
              className={`ref-view-tab ${view === 'week' ? 'active' : ''}`}
              onClick={() => setView('week')}
            >
              Week
            </button>
            <button
              className={`ref-view-tab ${view === 'day' ? 'active' : ''}`}
              onClick={() => setView('day')}
            >
              Day
            </button>
            <button
              className={`ref-view-tab ${view === 'agenda' ? 'active' : ''}`}
              onClick={() => setView('agenda')}
            >
              Agenda
            </button>
          </div>

          {/* Filter Dropdown */}
          <div className="ref-filter-relative-box">
            <button
              className={`ref-cal-filter-btn ${showFilterDropdown ? 'open' : ''}`}
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
              <span>Filter</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {showFilterDropdown && (
              <div className="ref-filter-dropdown-menu">
                <div className="dropdown-section-title">Category</div>
                <div className="dropdown-options-list">
                  {['all', 'task', 'meeting', 'milestone', 'personal', 'deadline'].map(cat => (
                    <button
                      key={cat}
                      className={`filter-opt-btn ${selectedCategoryFilter === cat ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedCategoryFilter(cat);
                        setShowFilterDropdown(false);
                      }}
                    >
                      {cat === 'all' ? 'All Categories' : categoryConfig[cat]?.name || cat}
                    </button>
                  ))}
                </div>

                <div className="dropdown-section-title" style={{ marginTop: '8px' }}>Project</div>
                <div className="dropdown-options-list">
                  {['all', 'Website Redesign', 'Mobile App v2.0', 'Passkey Sign In', 'Marketing Campaign', 'General'].map(p => (
                    <button
                      key={p}
                      className={`filter-opt-btn ${selectedProjectFilter === p ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedProjectFilter(p);
                        setShowFilterDropdown(false);
                      }}
                    >
                      {p === 'all' ? 'All Projects' : p}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Add Event Primary Button */}
          <button className="ref-add-event-primary-btn" onClick={() => handleOpenAddModal(selectedDate)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Add Event</span>
          </button>
        </div>
      </header>

      {/* 2. Main Layout: Left Sidebar + Right Calendar Area */}
      <div className="ref-calendar-body-grid">
        {/* Left Sidebar */}
        <aside className="ref-cal-sidebar">
          {/* Card 1: Interactive Mini Calendar */}
          <div className="ref-cal-card ref-mini-calendar-widget">
            <div className="ref-mini-cal-header">
              <span className="ref-mini-month-label">{MONTHS[month]} {year}</span>
              <div className="ref-mini-cal-nav">
                <button className="ref-mini-arrow-btn" onClick={prevMonth} title="Previous Month">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <button className="ref-mini-arrow-btn" onClick={nextMonth} title="Next Month">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="ref-mini-weekdays-row">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <span key={day} className="ref-mini-weekday-col">{day}</span>
              ))}
            </div>

            <div className="ref-mini-days-matrix">
              {miniCells.map((c, idx) => {
                const isSelected = c.dateStr === selectedDate;
                const isToday = c.dateStr === todayStr;

                return (
                  <button
                    key={idx}
                    className={`ref-mini-day-cell ${!c.isCurrentMonth ? 'dimmed' : ''} ${isToday ? 'is-today' : ''} ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedDate(c.dateStr);
                      if (!c.isCurrentMonth) {
                        const [y, m] = c.dateStr.split('-');
                        setCurrentDate(new Date(Number(y), Number(m) - 1, 1));
                      }
                    }}
                  >
                    <span>{c.day}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card 2: Calendar View Filter Checklist */}
          <div className="ref-cal-card ref-view-filters-card">
            <h3 className="ref-card-subheading">Calendar View</h3>
            <div className="ref-filter-checklist">
              {/* My Tasks */}
              <div className={`ref-filter-check-row ${!visibleViews.my_tasks ? 'dimmed-row' : ''}`}>
                <label className="ref-check-label">
                  <input
                    type="checkbox"
                    checked={activeViews.my_tasks}
                    onChange={() => toggleViewCheck('my_tasks')}
                    className="ref-custom-checkbox blue-checkbox"
                  />
                  <span className="ref-category-dot blue-dot" />
                  <span className="ref-check-name">My Tasks</span>
                </label>
                <button
                  className="ref-eye-toggle-btn"
                  onClick={(e) => toggleViewEye(e, 'my_tasks')}
                  title={visibleViews.my_tasks ? 'Hide from calendar' : 'Show on calendar'}
                >
                  {visibleViews.my_tasks ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Team Tasks */}
              <div className={`ref-filter-check-row ${!visibleViews.team_tasks ? 'dimmed-row' : ''}`}>
                <label className="ref-check-label">
                  <input
                    type="checkbox"
                    checked={activeViews.team_tasks}
                    onChange={() => toggleViewCheck('team_tasks')}
                    className="ref-custom-checkbox green-checkbox"
                  />
                  <span className="ref-category-dot green-dot" />
                  <span className="ref-check-name">Team Tasks</span>
                </label>
                <button
                  className="ref-eye-toggle-btn"
                  onClick={(e) => toggleViewEye(e, 'team_tasks')}
                  title={visibleViews.team_tasks ? 'Hide from calendar' : 'Show on calendar'}
                >
                  {visibleViews.team_tasks ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Projects & Milestones */}
              <div className={`ref-filter-check-row ${!visibleViews.milestones ? 'dimmed-row' : ''}`}>
                <label className="ref-check-label">
                  <input
                    type="checkbox"
                    checked={activeViews.milestones}
                    onChange={() => toggleViewCheck('milestones')}
                    className="ref-custom-checkbox purple-checkbox"
                  />
                  <span className="ref-category-dot purple-dot" />
                  <span className="ref-check-name">Projects & Milestones</span>
                </label>
                <button
                  className="ref-eye-toggle-btn"
                  onClick={(e) => toggleViewEye(e, 'milestones')}
                  title={visibleViews.milestones ? 'Hide from calendar' : 'Show on calendar'}
                >
                  {visibleViews.milestones ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Meetings */}
              <div className={`ref-filter-check-row ${!visibleViews.meetings ? 'dimmed-row' : ''}`}>
                <label className="ref-check-label">
                  <input
                    type="checkbox"
                    checked={activeViews.meetings}
                    onChange={() => toggleViewCheck('meetings')}
                    className="ref-custom-checkbox orange-checkbox"
                  />
                  <span className="ref-category-dot orange-dot" />
                  <span className="ref-check-name">Meetings</span>
                </label>
                <button
                  className="ref-eye-toggle-btn"
                  onClick={(e) => toggleViewEye(e, 'meetings')}
                  title={visibleViews.meetings ? 'Hide from calendar' : 'Show on calendar'}
                >
                  {visibleViews.meetings ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Card 3: Upcoming (Next 7 days) */}
          <div className="ref-cal-card ref-upcoming-widget">
            <div className="ref-upcoming-header">
              <h3 className="ref-card-subheading">Upcoming (Next 7 days)</h3>
              <button className="ref-view-all-link" onClick={() => setView('agenda')}>
                View All
              </button>
            </div>

            <div className="ref-upcoming-groups">
              {/* Group 1: Today, Oct 22 */}
              <div className="ref-upcoming-group">
                <div className="ref-group-title-row">
                  <span className="ref-group-date-text">Today, Oct 22</span>
                  <span className="ref-group-badge">{upcomingEvents.today.length}</span>
                </div>
                <div className="ref-upcoming-list">
                  {upcomingEvents.today.map(ev => {
                    const cfg = categoryConfig[ev.category] || categoryConfig.task;
                    return (
                      <div
                        key={ev.id}
                        className="ref-upcoming-item"
                        onClick={() => setSelectedEventDetail(ev)}
                      >
                        <span className="ref-item-indicator-dot" style={{ backgroundColor: cfg.color }} />
                        <div className="ref-item-content">
                          <div className="ref-item-line1">
                            <span className="ref-item-time">{ev.time}</span>
                            <span className="ref-item-title">{ev.title}</span>
                          </div>
                          <span className="ref-item-subproject">{ev.project}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Group 2: Tomorrow, Oct 23 */}
              <div className="ref-upcoming-group">
                <div className="ref-group-title-row">
                  <span className="ref-group-date-text">Tomorrow, Oct 23</span>
                  <span className="ref-group-badge">{upcomingEvents.tomorrow.length}</span>
                </div>
                <div className="ref-upcoming-list">
                  {upcomingEvents.tomorrow.map(ev => {
                    const cfg = categoryConfig[ev.category] || categoryConfig.task;
                    return (
                      <div
                        key={ev.id}
                        className="ref-upcoming-item"
                        onClick={() => setSelectedEventDetail(ev)}
                      >
                        <span className="ref-item-indicator-dot" style={{ backgroundColor: cfg.color }} />
                        <div className="ref-item-content">
                          <div className="ref-item-line1">
                            <span className="ref-item-time">{ev.time}</span>
                            <span className="ref-item-title">{ev.title}</span>
                          </div>
                          <span className="ref-item-subproject">{ev.project}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Main Calendar Section */}
        <main className="ref-cal-main-card">
          {/* Calendar Toolbar */}
          <div className="ref-cal-toolbar">
            <div className="ref-toolbar-left">
              <button className="ref-today-pill-btn" onClick={goToday}>Today</button>
              <div className="ref-nav-arrows-group">
                <button className="ref-arrow-btn" onClick={prevMonth} title="Previous">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <button className="ref-arrow-btn" onClick={nextMonth} title="Next">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>
              <h2 className="ref-current-month-heading">{MONTHS[month]} {year}</h2>
            </div>

            {/* Legend matching reference: Task, Meeting, Milestone, Personal, Deadline */}
            <div className="ref-cal-legend">
              <div className="ref-legend-item">
                <span className="legend-circle" style={{ background: '#0284c7' }} />
                <span>Task</span>
              </div>
              <div className="ref-legend-item">
                <span className="legend-circle" style={{ background: '#f59e0b' }} />
                <span>Meeting</span>
              </div>
              <div className="ref-legend-item">
                <span className="legend-circle" style={{ background: '#a855f7' }} />
                <span>Milestone</span>
              </div>
              <div className="ref-legend-item">
                <span className="legend-circle" style={{ background: '#22c55e' }} />
                <span>Personal</span>
              </div>
              <div className="ref-legend-item">
                <span className="legend-circle" style={{ background: '#ef4444' }} />
                <span>Deadline</span>
              </div>
            </div>
          </div>

          {/* VIEW 1: MONTH VIEW (Default matching reference screenshot) */}
          {view === 'month' && (
            <div className="ref-month-calendar-view">
              {/* Weekday Column Headers */}
              <div className="ref-weekday-header-grid">
                {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => (
                  <div key={d} className="ref-weekday-header-cell">{d}</div>
                ))}
              </div>

              {/* Month Days Grid */}
              <div className="ref-days-matrix-grid">
                {calendarCells.map((cell, idx) => {
                  const dayEvents = filteredEvents.filter(e => e.date === cell.dateStr);
                  const isToday = cell.dateStr === todayStr;
                  const isSelected = cell.dateStr === selectedDate;
                  const displayLimit = 3;
                  const visibleList = dayEvents.slice(0, displayLimit);
                  const overflowCount = dayEvents.length - displayLimit;

                  return (
                    <div
                      key={idx}
                      className={`ref-day-grid-cell ${!cell.isCurrentMonth ? 'other-month' : ''} ${isToday ? 'cell-today' : ''} ${isSelected ? 'cell-selected' : ''}`}
                      onClick={() => setSelectedDate(cell.dateStr)}
                      onDoubleClick={() => handleOpenAddModal(cell.dateStr)}
                    >
                      {/* Top Day Number Row */}
                      <div className="ref-cell-top-bar">
                        <span className={`ref-cell-day-num ${isToday ? 'active-today-bubble' : ''}`}>
                          {cell.day}
                        </span>
                      </div>

                      {/* Event Pill List */}
                      <div className="ref-cell-events-stack">
                        {visibleList.map(ev => {
                          const cfg = categoryConfig[ev.category] || categoryConfig.task;
                          return (
                            <div
                              key={ev.id}
                              className={`ref-event-pill cat-${ev.category}`}
                              style={{
                                backgroundColor: cfg.bg,
                                color: cfg.text,
                                borderLeft: `3px solid ${cfg.border}`
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedEventDetail(ev);
                              }}
                              title={`${ev.time} - ${ev.title} (${ev.project})`}
                            >
                              <span className="ref-pill-time">{ev.time}</span>
                              <span className="ref-pill-title">{ev.title}</span>
                            </div>
                          );
                        })}

                        {/* Overflow link badge */}
                        {overflowCount > 0 && (
                          <button
                            className="ref-overflow-more-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOverflowModalData({ date: cell.dateStr, day: cell.day, events: dayEvents });
                            }}
                          >
                            +{overflowCount} more
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW 2: WEEK VIEW */}
          {view === 'week' && (
            <div className="ref-week-timeline-view">
              <div className="ref-week-header-row">
                <div className="ref-week-time-gutter-head" />
                {DAYS.map((d, dIdx) => {
                  const curr = new Date(currentDate);
                  const startOffset = -curr.getDay();
                  const targetDate = new Date(curr);
                  targetDate.setDate(curr.getDate() + startOffset + dIdx);
                  const dStr = formatDateStr(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
                  const isToday = dStr === todayStr;

                  return (
                    <div
                      key={d}
                      className={`ref-week-header-col ${isToday ? 'active' : ''}`}
                      onClick={() => setSelectedDate(dStr)}
                    >
                      <span className="ref-wh-day">{d}</span>
                      <span className={`ref-wh-num ${isToday ? 'today-pill' : ''}`}>{targetDate.getDate()}</span>
                    </div>
                  );
                })}
              </div>

              <div className="ref-week-body-scroll">
                {Array.from({ length: 12 }, (_, i) => i + 8).map(hour => {
                  const hourLabel = hour > 12 ? `${hour - 12}:00 PM` : hour === 12 ? '12:00 PM' : `${hour}:00 AM`;
                  return (
                    <div key={hour} className="ref-week-hour-row">
                      <div className="ref-week-hour-label">{hourLabel}</div>
                      {DAYS.map((d, dIdx) => {
                        const curr = new Date(currentDate);
                        const startOffset = -curr.getDay();
                        const targetDate = new Date(curr);
                        targetDate.setDate(curr.getDate() + startOffset + dIdx);
                        const dStr = formatDateStr(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());

                        const slotEvents = filteredEvents.filter(ev => {
                          if (ev.date !== dStr) return false;
                          const evHour = parseInt(ev.time, 10);
                          const isPM = ev.time.includes('PM');
                          const normalizedEvHour = isPM && evHour !== 12 ? evHour + 12 : (!isPM && evHour === 12 ? 0 : evHour);
                          return normalizedEvHour === hour;
                        });

                        return (
                          <div
                            key={d}
                            className="ref-week-slot-cell"
                            onClick={() => handleOpenAddModal(dStr)}
                          >
                            {slotEvents.map(ev => {
                              const cfg = categoryConfig[ev.category] || categoryConfig.task;
                              return (
                                <div
                                  key={ev.id}
                                  className="ref-week-slot-pill"
                                  style={{
                                    backgroundColor: cfg.bg,
                                    color: cfg.text,
                                    borderLeft: `3px solid ${cfg.border}`
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedEventDetail(ev);
                                  }}
                                >
                                  <strong>{ev.time}</strong> {ev.title}
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW 3: DAY VIEW */}
          {view === 'day' && (
            <div className="ref-day-timeline-view">
              <div className="ref-day-top-bar">
                <h3>Schedule for {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</h3>
                <button className="ref-quick-add-btn" onClick={() => handleOpenAddModal(selectedDate)}>
                  + Add Event for this day
                </button>
              </div>

              <div className="ref-day-slots-container">
                {Array.from({ length: 14 }, (_, i) => i + 8).map(hour => {
                  const hourLabel = hour > 12 ? `${hour - 12}:00 PM` : hour === 12 ? '12:00 PM' : `${hour}:00 AM`;
                  const slotEvents = filteredEvents.filter(ev => {
                    if (ev.date !== selectedDate) return false;
                    const evHour = parseInt(ev.time, 10);
                    const isPM = ev.time.includes('PM');
                    const normalizedEvHour = isPM && evHour !== 12 ? evHour + 12 : (!isPM && evHour === 12 ? 0 : evHour);
                    return normalizedEvHour === hour;
                  });

                  return (
                    <div key={hour} className="ref-day-hour-block">
                      <div className="ref-day-hour-time">{hourLabel}</div>
                      <div className="ref-day-hour-events">
                        {slotEvents.length === 0 ? (
                          <div className="ref-empty-slot" onClick={() => handleOpenAddModal(selectedDate)}>
                            <span>+ Click to schedule</span>
                          </div>
                        ) : (
                          slotEvents.map(ev => {
                            const cfg = categoryConfig[ev.category] || categoryConfig.task;
                            return (
                              <div
                                key={ev.id}
                                className="ref-day-event-card"
                                style={{
                                  backgroundColor: cfg.bg,
                                  borderColor: cfg.border
                                }}
                                onClick={() => setSelectedEventDetail(ev)}
                              >
                                <div className="ref-dec-left" style={{ background: cfg.color }} />
                                <div className="ref-dec-info">
                                  <div className="ref-dec-title-row">
                                    <h4 style={{ color: cfg.text }}>{ev.title}</h4>
                                    <span className="ref-dec-tag" style={{ background: cfg.color, color: '#fff' }}>
                                      {cfg.name}
                                    </span>
                                  </div>
                                  <p className="ref-dec-meta">
                                    <span>🕒 {ev.time}</span> • <span>📁 {ev.project}</span>
                                  </p>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW 4: AGENDA VIEW */}
          {view === 'agenda' && (
            <div className="ref-agenda-timeline-view">
              <div className="ref-agenda-header">
                <h3>Upcoming Agenda & Milestones</h3>
                <span className="ref-agenda-count-badge">{filteredEvents.length} events scheduled</span>
              </div>

              <div className="ref-agenda-items-stream">
                {filteredEvents.length === 0 ? (
                  <div className="ref-agenda-empty">
                    <span>📅</span>
                    <p>No events match your current view filters.</p>
                  </div>
                ) : (
                  filteredEvents.map(ev => {
                    const cfg = categoryConfig[ev.category] || categoryConfig.task;
                    const isToday = ev.date === todayStr;

                    return (
                      <div
                        key={ev.id}
                        className={`ref-agenda-row-card ${isToday ? 'today-highlight' : ''}`}
                        onClick={() => setSelectedEventDetail(ev)}
                      >
                        <div className="ref-agenda-date-col">
                          <span className="ref-ag-date-text">
                            {new Date(ev.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                          <span className="ref-ag-weekday">
                            {new Date(ev.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' })}
                          </span>
                        </div>

                        <div className="ref-agenda-badge-marker" style={{ backgroundColor: cfg.color }} />

                        <div className="ref-agenda-content-col">
                          <div className="ref-ag-title-row">
                            <h4>{ev.title}</h4>
                            <span className="ref-ag-cat-badge" style={{ backgroundColor: cfg.bg, color: cfg.text, borderColor: cfg.border }}>
                              {cfg.name}
                            </span>
                          </div>
                          <div className="ref-ag-meta-row">
                            <span className="ref-ag-time">🕒 {ev.time}</span>
                            <span className="ref-ag-dot">•</span>
                            <span className="ref-ag-project">📁 {ev.project}</span>
                          </div>
                        </div>

                        <button className="ref-agenda-action-btn">
                          View ➔
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL 1: ADD EVENT MODAL */}
      {showAddModal && (
        <div className="ref-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="ref-modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="ref-modal-top">
              <div className="ref-modal-title-box">
                <div className="ref-modal-icon-badge">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>
                <div>
                  <h3 className="ref-modal-heading">Add New Event</h3>
                  <p className="ref-modal-subheading">Schedule a task, meeting, milestone, or reminder.</p>
                </div>
              </div>
              <button className="ref-modal-close-btn" onClick={() => setShowAddModal(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateEvent} className="ref-modal-form">
              {/* Category selector */}
              <div className="ref-form-group">
                <label className="ref-form-label">Category</label>
                <div className="ref-category-chips">
                  {Object.entries(categoryConfig).map(([key, cfg]) => (
                    <button
                      key={key}
                      type="button"
                      className={`ref-category-chip-btn ${newEventCategory === key ? 'active' : ''}`}
                      onClick={() => setNewEventCategory(key)}
                      style={{
                        borderColor: newEventCategory === key ? cfg.color : 'rgba(226, 232, 240, 0.8)',
                        background: newEventCategory === key ? cfg.bg : '#fff',
                        color: newEventCategory === key ? cfg.text : '#475569'
                      }}
                    >
                      <span className="ref-chip-dot" style={{ backgroundColor: cfg.color }} />
                      <span>{cfg.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Event Title */}
              <div className="ref-form-group">
                <label className="ref-form-label">Event Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Design review with engineering team"
                  value={newEventTitle}
                  onChange={e => setNewEventTitle(e.target.value)}
                  className="ref-input-control"
                  required
                  autoFocus
                />
              </div>

              {/* Date & Time Row */}
              <div className="ref-form-row-2">
                <div className="ref-form-group">
                  <label className="ref-form-label">Date</label>
                  <input
                    type="date"
                    value={newEventDate}
                    onChange={e => setNewEventDate(e.target.value)}
                    className="ref-input-control"
                    required
                  />
                </div>

                <div className="ref-form-group">
                  <label className="ref-form-label">Time</label>
                  <select
                    value={newEventTime}
                    onChange={e => setNewEventTime(e.target.value)}
                    className="ref-select-control"
                  >
                    {['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '04:30 PM', '05:00 PM', '06:00 PM'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Project & Priority */}
              <div className="ref-form-row-2">
                <div className="ref-form-group">
                  <label className="ref-form-label">Project</label>
                  <select
                    value={newEventProject}
                    onChange={e => setNewEventProject(e.target.value)}
                    className="ref-select-control"
                  >
                    <option value="Website Redesign">Website Redesign</option>
                    <option value="Mobile App v2.0">Mobile App v2.0</option>
                    <option value="Passkey Sign In">Passkey Sign In</option>
                    <option value="Marketing Campaign">Marketing Campaign</option>
                    <option value="Trackify App">Trackify App</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div className="ref-form-group">
                  <label className="ref-form-label">Priority</label>
                  <select
                    value={newEventPriority}
                    onChange={e => setNewEventPriority(e.target.value)}
                    className="ref-select-control"
                  >
                    <option value="low">🌱 Low</option>
                    <option value="medium">⚡ Medium</option>
                    <option value="high">🔥 High</option>
                    <option value="urgent">🚨 Urgent</option>
                  </select>
                </div>
              </div>

              {/* Footer actions */}
              <div className="ref-modal-actions-bar">
                <button
                  type="button"
                  className="ref-btn-subtle"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="ref-btn-create"
                >
                  Create Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EVENT DETAILS MODAL */}
      {selectedEventDetail && (
        <div className="ref-modal-overlay" onClick={() => setSelectedEventDetail(null)}>
          <div className="ref-modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="ref-modal-top">
              <div className="ref-modal-title-box">
                <div
                  className="ref-modal-icon-badge"
                  style={{
                    backgroundColor: categoryConfig[selectedEventDetail.category]?.bg || '#e0f2fe',
                    color: categoryConfig[selectedEventDetail.category]?.color || '#0284c7'
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div>
                  <h3 className="ref-modal-heading">{selectedEventDetail.title}</h3>
                  <p className="ref-modal-subheading">
                    {categoryConfig[selectedEventDetail.category]?.name || 'Event'} • {selectedEventDetail.project}
                  </p>
                </div>
              </div>
              <button className="ref-modal-close-btn" onClick={() => setSelectedEventDetail(null)}>✕</button>
            </div>

            <div className="ref-event-detail-body">
              <div className="ref-detail-card-item">
                <span className="ref-det-label">Date & Time</span>
                <span className="ref-det-val">
                  📅 {new Date(selectedEventDetail.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })} at {selectedEventDetail.time}
                </span>
              </div>

              <div className="ref-detail-card-item">
                <span className="ref-det-label">Project</span>
                <span className="ref-det-val">📁 {selectedEventDetail.project}</span>
              </div>

              <div className="ref-detail-card-item">
                <span className="ref-det-label">Category</span>
                <span
                  className="ref-det-badge"
                  style={{
                    backgroundColor: categoryConfig[selectedEventDetail.category]?.bg,
                    color: categoryConfig[selectedEventDetail.category]?.text
                  }}
                >
                  {categoryConfig[selectedEventDetail.category]?.name}
                </span>
              </div>
            </div>

            <div className="ref-modal-actions-bar">
              <button
                type="button"
                className="ref-btn-danger"
                onClick={() => {
                  setCustomEvents(prev => prev.filter(e => e.id !== selectedEventDetail.id));
                  if (triggerToast) triggerToast('Event Removed', 'Event deleted from calendar', 'info');
                  setSelectedEventDetail(null);
                }}
              >
                Delete Event
              </button>
              <button
                type="button"
                className="ref-btn-create"
                onClick={() => {
                  if (triggerToast) triggerToast('Event Completed', `"${selectedEventDetail.title}" marked completed!`, 'success');
                  setSelectedEventDetail(null);
                }}
              >
                Mark Completed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: DAY OVERFLOW POPOVER */}
      {overflowModalData && (
        <div className="ref-modal-overlay" onClick={() => setOverflowModalData(null)}>
          <div className="ref-modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="ref-modal-top">
              <div>
                <h3 className="ref-modal-heading">
                  All Events for {new Date(overflowModalData.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </h3>
                <p className="ref-modal-subheading">{overflowModalData.events.length} events scheduled</p>
              </div>
              <button className="ref-modal-close-btn" onClick={() => setOverflowModalData(null)}>✕</button>
            </div>

            <div className="ref-overflow-list-container">
              {overflowModalData.events.map(ev => {
                const cfg = categoryConfig[ev.category] || categoryConfig.task;
                return (
                  <div
                    key={ev.id}
                    className="ref-overflow-item-row"
                    onClick={() => {
                      setOverflowModalData(null);
                      setSelectedEventDetail(ev);
                    }}
                  >
                    <div className="ref-of-pill" style={{ backgroundColor: cfg.bg, color: cfg.text, borderLeft: `3px solid ${cfg.border}` }}>
                      <span className="ref-of-time">{ev.time}</span>
                      <span className="ref-of-title">{ev.title}</span>
                    </div>
                    <span className="ref-of-project">{ev.project}</span>
                  </div>
                );
              })}
            </div>

            <div className="ref-modal-actions-bar">
              <button
                className="ref-btn-create"
                onClick={() => {
                  setOverflowModalData(null);
                  handleOpenAddModal(overflowModalData.date);
                }}
              >
                + Add Another Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
