// Mock data for Trackify application

export const initialUsers = [
  {
    id: 'u0',
    name: 'Andrew Smith',
    email: 'andrew@trackify.com',
    avatar: null,
    role: 'Product Lead',
    department: 'Product',
    bio: 'Product Lead & Founder at Trackify.',
    timezone: 'UTC+5:30 (IST)',
    password: 'demo123',
    initials: 'AS',
    color: '#4f46e5'
  },
  {
    id: 'u1',
    name: 'Priya Raman',
    email: 'priya@trackify.com',
    avatar: null,
    role: 'Design Lead',
    department: 'Design',
    bio: 'Design System & UI/UX specialist.',
    timezone: 'UTC+5:30 (IST)',
    password: 'demo123',
    initials: 'PR',
    color: '#f43f5e'
  },
  {
    id: 'u2',
    name: 'Mateo Silva',
    email: 'mateo@trackify.com',
    avatar: null,
    role: 'Senior Developer',
    department: 'Engineering',
    bio: 'Full-stack & WebAuthn authentication engineer.',
    timezone: 'UTC-5 (EST)',
    password: 'demo123',
    initials: 'MS',
    color: '#06b6d4'
  },
  {
    id: 'u3',
    name: 'Hana Kobayashi',
    email: 'hana@trackify.com',
    avatar: null,
    role: 'Fullstack Engineer',
    department: 'Engineering',
    bio: 'API architect and dashboard optimization.',
    timezone: 'UTC+9 (JST)',
    password: 'demo123',
    initials: 'HK',
    color: '#8b5cf6'
  },
  {
    id: 'u4',
    name: 'Owen Mercer',
    email: 'owen@trackify.com',
    avatar: null,
    role: 'Growth Lead',
    department: 'Marketing',
    bio: 'Product marketing and brand strategy.',
    timezone: 'UTC-5 (EST)',
    password: 'demo123',
    initials: 'OM',
    color: '#f59e0b'
  },
  {
    id: 'u5',
    name: 'Sophia Lee',
    email: 'sophia@trackify.com',
    avatar: null,
    role: 'Mobile Lead',
    department: 'Mobile',
    bio: 'iOS & Android mobile platform lead.',
    timezone: 'UTC-8 (PST)',
    password: 'demo123',
    initials: 'SL',
    color: '#10b981'
  },
  {
    id: 'u6',
    name: 'Alex Johnson',
    email: 'alex.johnson@trackify.com',
    avatar: null,
    role: 'Staff Engineer',
    department: 'Engineering',
    bio: 'Cloud architecture and infrastructure.',
    timezone: 'UTC-5 (EST)',
    password: 'demo123',
    initials: 'AJ',
    color: '#3b82f6'
  }
];

export const initialProjects = [
  {
    id: 'p1',
    name: 'Website Redesign',
    status: 'running',
    progress: 80,
    taskCount: '12/15',
    startDate: 'Aug 01, 2026',
    dueDate: 'Oct 25, 2026',
    lead: 'Priya Raman',
    leadId: 'u1',
    members: ['u1', 'u2', 'u0', 'u4'],
    description: 'Complete redesign of company website with modern UI/UX design tokens and responsive flows.',
    color: '#6366f1',
    iconType: 'stripes',
    category: 'Design'
  },
  {
    id: 'p2',
    name: 'Mobile App v2.0',
    status: 'running',
    progress: 50,
    taskCount: '8/16',
    startDate: 'Sep 10, 2026',
    dueDate: 'Oct 28, 2026',
    lead: 'Mateo Silva',
    leadId: 'u2',
    members: ['u2', 'u0', 'u5', 'u6'],
    description: 'New features, biometric login, offline cache, and real-time push notification improvements.',
    color: '#10b981',
    iconType: 'mobile',
    category: 'Mobile'
  },
  {
    id: 'p3',
    name: 'Passkey Sign In',
    status: 'running',
    progress: 65,
    taskCount: '10/15',
    startDate: 'Oct 01, 2026',
    dueDate: 'Nov 20, 2026',
    lead: 'Hana Kobayashi',
    leadId: 'u3',
    members: ['u2', 'u0', 'u3', 'u4'],
    description: 'Implement passkey WebAuthn authentication across desktop, mobile browsers, and native apps.',
    color: '#f43f5e',
    iconType: 'security',
    category: 'Security'
  },
  {
    id: 'p4',
    name: 'Marketing Campaign',
    status: 'pending',
    progress: 30,
    taskCount: '3/10',
    startDate: 'Oct 05, 2026',
    dueDate: 'Nov 12, 2026',
    lead: 'Owen Mercer',
    leadId: 'u4',
    members: ['u4', 'u1'],
    description: 'Q4 marketing campaign for product launch, media press kit, and customer case studies.',
    color: '#f59e0b',
    iconType: 'marketing',
    category: 'Marketing'
  },
  {
    id: 'p5',
    name: 'API Integration',
    status: 'running',
    progress: 60,
    taskCount: '9/15',
    startDate: 'Aug 15, 2026',
    dueDate: 'Sep 30, 2026',
    lead: 'Sophia Lee',
    leadId: 'u5',
    members: ['u2', 'u6', 'u0'],
    description: 'Integrate third-party REST and GraphQL APIs for enhanced functionality and sync.',
    color: '#8b5cf6',
    iconType: 'api',
    category: 'Engineering'
  },
  {
    id: 'p6',
    name: 'Data Migration',
    status: 'ended',
    progress: 100,
    taskCount: '12/12',
    startDate: 'Jun 10, 2026',
    dueDate: 'Aug 15, 2026',
    lead: 'Mateo Silva',
    leadId: 'u2',
    members: ['u2', 'u6'],
    description: 'Migrate legacy customer and project data to new cloud database infrastructure.',
    color: '#ec4899',
    iconType: 'cluster',
    category: 'Engineering'
  },
  {
    id: 'p7',
    name: 'Security Audit',
    status: 'pending',
    progress: 20,
    taskCount: '2/10',
    startDate: 'Oct 20, 2026',
    dueDate: 'Nov 18, 2026',
    lead: 'Priya Raman',
    leadId: 'u1',
    members: ['u1', 'u5'],
    description: 'Conduct security audit, penetration tests, and SOC2 compliance checks.',
    color: '#ea580c',
    iconType: 'shield',
    category: 'Security'
  },
  {
    id: 'p8',
    name: 'Analytics Dashboard',
    status: 'running',
    progress: 45,
    taskCount: '6/13',
    startDate: 'Sep 01, 2026',
    dueDate: 'Nov 30, 2026',
    lead: 'Hana Kobayashi',
    leadId: 'u3',
    members: ['u0', 'u2', 'u6'],
    description: 'Build advanced analytics, customer retention funnel metrics, and real-time reporting.',
    color: '#06b6d4',
    iconType: 'chart',
    category: 'Engineering'
  },
  {
    id: 'p9',
    name: 'Internal Tools',
    status: 'pending',
    progress: 10,
    taskCount: '1/10',
    startDate: 'Oct 12, 2026',
    dueDate: 'Dec 10, 2026',
    lead: 'Owen Mercer',
    leadId: 'u4',
    members: ['u4', 'u5'],
    description: 'Automate internal workflows, deployment pipelines, and customer support toolkits.',
    color: '#3b82f6',
    iconType: 'tools',
    category: 'Engineering'
  }
];

export const initialMilestones = [
  { id: 'm1', title: 'Website Redesign - Phase 1', progress: 80, dueDate: 'Oct 25, 2026', color: '#2563eb' },
  { id: 'm2', title: 'Passkey Launch', progress: 50, dueDate: 'Oct 28, 2026', color: '#f59e0b' },
  { id: 'm3', title: 'Mobile App v2.0 Release', progress: 30, dueDate: 'Nov 05, 2026', color: '#f97316' },
  { id: 'm4', title: 'Marketing Campaign', progress: 0, dueDate: 'Nov 12, 2026', color: '#64748b' }
];

export const initialCollaborators = [
  { id: 'u1', name: 'Priya Raman', module: 'Design System Tokens', completedTasks: 4, totalTasks: 6, status: 'Completed', color: '#f43f5e', initials: 'PR' },
  { id: 'u2', name: 'Mateo Silva', module: 'Passkey Sign-in', completedTasks: 5, totalTasks: 8, status: 'In Progress', color: '#06b6d4', initials: 'MS' },
  { id: 'u3', name: 'Hana Kobayashi', module: 'Saved Filters for Projects', completedTasks: 2, totalTasks: 5, status: 'Pending', color: '#8b5cf6', initials: 'HK' },
  { id: 'u4', name: 'Owen Mercer', module: 'Marketing Site Refresh', completedTasks: 3, totalTasks: 7, status: 'In Progress', color: '#f59e0b', initials: 'OM' },
  { id: 'u5', name: 'Sophia Lee', module: 'Mobile App UI', completedTasks: 1, totalTasks: 4, status: 'In Progress', color: '#10b981', initials: 'SL' }
];

export const initialTasks = [
  {
    id: 't_api',
    title: 'API Integration',
    description: 'Integrate external REST & Webhook services for Website Redesign',
    projectName: 'Website Redesign',
    urgency: 'Overdue',
    urgencyType: 'overdue',
    status: 'inprogress',
    priority: 'high',
    progress: 75,
    assignee: 'u1',
    project: 'p1',
    dueDate: '2026-10-15',
    createdAt: '2026-10-01',
    tags: ['api', 'backend']
  },
  {
    id: 't_ui',
    title: 'UI Improvements',
    description: 'Optimize responsive components and dark mode tokens for Mobile App v2.0',
    projectName: 'Mobile App v2.0',
    urgency: 'Due Today',
    urgencyType: 'today',
    status: 'inprogress',
    priority: 'high',
    progress: 60,
    assignee: 'u2',
    project: 'p2',
    dueDate: '2026-10-20',
    createdAt: '2026-10-05',
    tags: ['ui', 'mobile']
  },
  {
    id: 't_test',
    title: 'Testing & Bug Fixes',
    description: 'Execute end-to-end WebAuthn test suites across browsers',
    projectName: 'Passkey Sign In',
    urgency: 'Due in 3 days',
    urgencyType: 'soon',
    status: 'todo',
    priority: 'medium',
    progress: 25,
    assignee: 'u3',
    project: 'p3',
    dueDate: '2026-10-23',
    createdAt: '2026-10-10',
    tags: ['qa', 'security']
  },
  {
    id: 't_mkt',
    title: 'Marketing Assets',
    description: 'Prepare high-res banner exports and launch press release for Campaign',
    projectName: 'Marketing Campaign',
    urgency: 'Due next week',
    urgencyType: 'nextweek',
    status: 'todo',
    priority: 'low',
    progress: 10,
    assignee: 'u4',
    project: 'p4',
    dueDate: '2026-10-28',
    createdAt: '2026-10-12',
    tags: ['marketing', 'launch']
  },
  {
    id: 't1',
    title: 'Design homepage wireframe',
    description: 'Create wireframe for the new homepage layout',
    projectName: 'Website Redesign',
    status: 'done',
    priority: 'high',
    progress: 100,
    assignee: 'u1',
    project: 'p1',
    dueDate: '2026-10-20',
    createdAt: '2026-10-10',
    tags: ['design', 'ui']
  },
  {
    id: 't2',
    title: 'Implement passkey authentication',
    description: 'Build passkey sign-in flow using WebAuthn API',
    projectName: 'Passkey Sign In',
    status: 'inprogress',
    priority: 'high',
    progress: 70,
    assignee: 'u2',
    project: 'p3',
    dueDate: '2026-10-28',
    createdAt: '2026-10-15',
    tags: ['auth', 'security']
  },
  {
    id: 't3',
    title: 'Setup CI/CD pipeline',
    description: 'Configure GitHub Actions for automated deployment',
    projectName: 'Mobile App v2.0',
    status: 'inreview',
    priority: 'medium',
    progress: 85,
    assignee: 'u6',
    project: 'p2',
    dueDate: '2026-10-25',
    createdAt: '2026-10-12',
    tags: ['devops']
  },
  {
    id: 't4',
    title: 'Write API documentation',
    description: 'Document all REST API endpoints with examples',
    projectName: 'API Integration',
    status: 'todo',
    priority: 'medium',
    progress: 15,
    assignee: 'u5',
    project: 'p5',
    dueDate: '2026-10-30',
    createdAt: '2026-10-18',
    tags: ['docs']
  },
  {
    id: 't5',
    title: 'Mobile responsive testing',
    description: 'Test all pages on various mobile devices',
    projectName: 'Website Redesign',
    status: 'done',
    priority: 'high',
    progress: 100,
    assignee: 'u5',
    project: 'p1',
    dueDate: '2026-10-26',
    createdAt: '2026-10-16',
    tags: ['testing', 'mobile']
  },
  {
    id: 't6',
    title: 'Design system components',
    description: 'Build reusable design system components',
    projectName: 'Website Redesign',
    status: 'inprogress',
    priority: 'high',
    progress: 90,
    assignee: 'u1',
    project: 'p1',
    dueDate: '2026-10-29',
    createdAt: '2026-10-14',
    tags: ['design', 'components']
  },
  {
    id: 't7',
    title: 'Database schema migration',
    description: 'Migrate database schema to support new features',
    projectName: 'Data Migration',
    status: 'done',
    priority: 'high',
    progress: 100,
    assignee: 'u2',
    project: 'p6',
    dueDate: '2026-08-15',
    createdAt: '2026-06-12',
    tags: ['database']
  },
  {
    id: 't8',
    title: 'Security vulnerability assessment',
    description: 'Run automated OWASP penetration audit',
    projectName: 'Security Audit',
    status: 'inprogress',
    priority: 'high',
    progress: 20,
    assignee: 'u1',
    project: 'p7',
    dueDate: '2026-11-18',
    createdAt: '2026-10-20',
    tags: ['security']
  },
  {
    id: 't9',
    title: 'Analytics event schema',
    description: 'Define telemetry event dictionary for Amplitude',
    projectName: 'Analytics Dashboard',
    status: 'inprogress',
    priority: 'medium',
    progress: 45,
    assignee: 'u3',
    project: 'p8',
    dueDate: '2026-11-30',
    createdAt: '2026-09-02',
    tags: ['analytics']
  },
  {
    id: 't10',
    title: 'Customer support CLI toolkit',
    description: 'Build command-line utility for manual resets',
    projectName: 'Internal Tools',
    status: 'todo',
    priority: 'low',
    progress: 10,
    assignee: 'u4',
    project: 'p9',
    dueDate: '2026-12-10',
    createdAt: '2026-10-12',
  },
  {
    id: 't_p2_db',
    title: 'Cache & SQLite Optimization',
    description: 'Optimize local caching and session storage for Mobile App v2.0',
    projectName: 'Mobile App v2.0',
    status: 'inreview',
    priority: 'medium',
    progress: 70,
    assignee: 'u4',
    project: 'p2',
    dueDate: '2026-10-18',
    createdAt: '2026-10-08',
    tags: ['backend', 'database']
  },
  {
    id: 't8',
    title: 'Performance optimization',
    description: 'Optimize page load times and bundle size',
    status: 'todo',
    priority: 'medium',
    assignee: 'u2',
    project: 'p1',
    dueDate: '2026-11-01',
    createdAt: '2026-10-19',
    tags: ['performance']
  },
  {
    id: 't9',
    title: 'User onboarding flow',
    description: 'Design and implement user onboarding experience',
    status: 'inprogress',
    priority: 'medium',
    assignee: 'u3',
    project: 'p2',
    dueDate: '2026-10-31',
    createdAt: '2026-10-17',
    tags: ['ux', 'onboarding']
  },
  {
    id: 't10',
    title: 'Security vulnerability scan',
    description: 'Run comprehensive security scan on all endpoints',
    status: 'inreview',
    priority: 'high',
    assignee: 'u5',
    project: 'p8',
    dueDate: '2026-10-27',
    createdAt: '2026-10-13',
    tags: ['security', 'testing']
  },
  {
    id: 't11',
    title: 'Setup monitoring alerts',
    description: 'Configure Datadog alerts for critical services',
    status: 'todo',
    priority: 'low',
    assignee: 'u6',
    project: 'p8',
    dueDate: '2026-11-05',
    createdAt: '2026-10-20',
    tags: ['devops', 'monitoring']
  },
  {
    id: 't12',
    title: 'Create marketing assets',
    description: 'Design social media graphics and banners',
    status: 'done',
    priority: 'medium',
    assignee: 'u3',
    project: 'p4',
    dueDate: '2026-10-08',
    createdAt: '2026-10-01',
    tags: ['design', 'marketing']
  },
  {
    id: 't13',
    title: 'Integration testing',
    description: 'Write integration tests for auth module',
    status: 'todo',
    priority: 'high',
    assignee: 'u5',
    project: 'p3',
    dueDate: '2026-10-30',
    createdAt: '2026-10-21',
    tags: ['testing']
  },
  {
    id: 't14',
    title: 'Code review - Sprint 5',
    description: 'Review all PRs from sprint 5',
    status: 'inreview',
    priority: 'medium',
    assignee: 'u1',
    project: 'p1',
    dueDate: '2026-10-24',
    createdAt: '2026-10-20',
    tags: ['review']
  },
  {
    id: 't15',
    title: 'Deploy staging environment',
    description: 'Deploy latest build to staging for QA',
    status: 'done',
    priority: 'high',
    assignee: 'u6',
    project: 'p2',
    dueDate: '2026-10-19',
    createdAt: '2026-10-15',
    tags: ['devops', 'deployment']
  }
];

export const initialNotifications = [
  {
    id: 'n1',
    userId: 'u2',
    userName: 'Silva Rodriguez',
    userEmail: 'silva@trackify.com',
    action: 'moved',
    target: 'Passkey Sign In',
    from: 'To Do',
    to: 'In Progress',
    timestamp: Date.now() - 5 * 60 * 1000, // 5 mins ago
    read: false
  },
  {
    id: 'n2',
    userId: 'u3',
    userName: 'Maria Chen',
    userEmail: 'maria@trackify.com',
    action: 'completed',
    target: 'Design homepage wireframe',
    from: null,
    to: 'Done',
    timestamp: Date.now() - 15 * 60 * 1000, // 15 mins ago
    read: false
  },
  {
    id: 'n3',
    userId: 'u4',
    userName: 'James Wilson',
    userEmail: 'james@trackify.com',
    action: 'commented on',
    target: 'API Integration',
    from: null,
    to: null,
    timestamp: Date.now() - 32 * 60 * 1000, // 32 mins ago
    read: false
  },
  {
    id: 'n4',
    userId: 'u6',
    userName: 'David Kim',
    userEmail: 'david@trackify.com',
    action: 'moved',
    target: 'Setup CI/CD pipeline',
    from: 'In Progress',
    to: 'In Review',
    timestamp: Date.now() - 1.5 * 60 * 60 * 1000, // 1.5 hours ago
    read: true
  },
  {
    id: 'n5',
    userId: 'u5',
    userName: 'Emily Park',
    userEmail: 'emily@trackify.com',
    action: 'assigned',
    target: 'Mobile responsive testing',
    from: null,
    to: 'To Do',
    timestamp: Date.now() - 3 * 60 * 60 * 1000, // 3 hours ago
    read: true
  },
  {
    id: 'n6',
    userId: 'u2',
    userName: 'Silva Rodriguez',
    userEmail: 'silva@trackify.com',
    action: 'created',
    target: 'Performance optimization',
    from: null,
    to: null,
    timestamp: Date.now() - 5 * 60 * 60 * 1000, // 5 hours ago
    read: true
  }
];

export const initialReminders = [
  {
    id: 'r1',
    title: 'Check-in with Halcyon Labs',
    timeRange: '02.00 pm - 04.00 pm',
    date: 'Today',
    time: '02.00 pm - 04.00 pm',
    type: 'meeting'
  },
  {
    id: 'r2',
    title: 'Design Review - Homepage',
    date: '2026-10-24',
    time: '2:00 PM',
    type: 'review'
  },
  {
    id: 'r3',
    title: 'Deploy v2.0 to Production',
    date: '2026-10-25',
    time: '6:00 PM',
    type: 'deadline'
  },
  {
    id: 'r4',
    title: 'Team Standup',
    date: '2026-10-23',
    time: '9:00 AM',
    type: 'meeting'
  },
  {
    id: 'r5',
    title: 'Security Audit Report Due',
    date: '2026-11-05',
    time: '5:00 PM',
    type: 'deadline'
  }
];

export const weeklyAnalytics = [
  { name: 'Mon', tasks: 12, completed: 8 },
  { name: 'Tue', tasks: 15, completed: 11 },
  { name: 'Wed', tasks: 18, completed: 14 },
  { name: 'Thu', tasks: 14, completed: 10 },
  { name: 'Fri', tasks: 20, completed: 16 },
  { name: 'Sat', tasks: 8, completed: 6 },
  { name: 'Sun', tasks: 5, completed: 4 }
];

export const teamCollaboration = [
  { id: 'tc1', memberId: 'u11', name: 'Priya Raman', module: 'Design System Tokens', team: 'Design', status: 'Completed', initials: 'PR', color: '#fbcfe8' },
  { id: 'tc2', memberId: 'u12', name: 'Mateo Silva', module: 'Passkey Sign-in', team: 'Engineering', status: 'In Progress', initials: 'MS', color: '#a7f3d0' },
  { id: 'tc3', memberId: 'u13', name: 'Hana Kobayashi', module: 'Saved Filters for Projects', team: 'Product', status: 'Pending', initials: 'HK', color: '#ddd6fe' },
  { id: 'tc4', memberId: 'u14', name: 'Owen Mercer', module: 'Marketing Site Refresh', team: 'Marketing', status: 'In Progress', initials: 'OM', color: '#fed7aa' }
];

export const activityData = [
  { date: 'Oct 16', commits: 24, reviews: 8, deploys: 2 },
  { date: 'Oct 17', commits: 31, reviews: 12, deploys: 1 },
  { date: 'Oct 18', commits: 18, reviews: 6, deploys: 3 },
  { date: 'Oct 19', commits: 28, reviews: 10, deploys: 2 },
  { date: 'Oct 20', commits: 35, reviews: 15, deploys: 4 },
  { date: 'Oct 21', commits: 22, reviews: 9, deploys: 1 },
  { date: 'Oct 22', commits: 29, reviews: 11, deploys: 2 }
];

export const timeByProject = [
  { name: 'Website Redesign', value: 35, color: '#6366f1' },
  { name: 'Mobile App v2.0', value: 25, color: '#06b6d4' },
  { name: 'Passkey Sign In', value: 20, color: '#f43f5e' },
  { name: 'Security Audit', value: 12, color: '#14b8a6' },
  { name: 'Others', value: 8, color: '#94a3b8' }
];

export const topContributors = [
  { id: 'u2', name: 'Silva Rodriguez', tasksCompleted: 24, avatar: null, initials: 'SR', color: '#06b6d4' },
  { id: 'u3', name: 'Maria Chen', tasksCompleted: 21, avatar: null, initials: 'MC', color: '#f43f5e' },
  { id: 'u4', name: 'James Wilson', tasksCompleted: 19, avatar: null, initials: 'JW', color: '#10b981' },
  { id: 'u6', name: 'David Kim', tasksCompleted: 17, avatar: null, initials: 'DK', color: '#8b5cf6' },
  { id: 'u5', name: 'Emily Park', tasksCompleted: 15, avatar: null, initials: 'EP', color: '#f59e0b' }
];

export const initialTodos = [
  { id: 'td1', text: 'Review Passkey sign-in PR submitted by Silva', completed: true, priority: 'high', dueDate: 'Today' },
  { id: 'td2', text: 'Update sprint backlog for mobile app v2.0', completed: false, priority: 'high', dueDate: 'Today' },
  { id: 'td3', text: 'Prepare slides for tomorrow team standup', completed: false, priority: 'medium', dueDate: 'Tomorrow' },
  { id: 'td4', text: 'Review Figma wireframes with Maria', completed: false, priority: 'low', dueDate: 'Oct 25' },
  { id: 'td5', text: 'Validate OAuth and session timeout configs', completed: true, priority: 'medium', dueDate: 'Yesterday' }
];

