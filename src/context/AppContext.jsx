import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import {
  initialUsers, initialProjects, initialTasks,
  initialNotifications, initialReminders, initialTodos
} from '../data/mockData';
import {
  isSupabaseConfigured,
  fetchSupabaseWorkspace,
  syncUserProfile,
  saveSupabaseTask,
  deleteSupabaseTask,
  saveSupabaseProject,
  deleteSupabaseProject
} from '../lib/supabaseClient';

const AppContext = createContext();

const getFromStorage = (key, fallback) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
};

const getStoredUser = () => {
  const u = getFromStorage('trackify_user', null);
  if (!u || u.name === 'Alex Johnson' || u.name === 'Noah Castell') {
    return initialUsers[0];
  }
  return u;
};

const getStoredProjects = () => {
  const p = getFromStorage('trackify_projects', null);
  if (!p || p.length > 20 || !p.some(item => item.name === 'Website Redesign')) {
    return initialProjects;
  }
  return p;
};

const getStoredTasks = () => {
  const t = getFromStorage('trackify_tasks', null);
  if (!t || !t.some(item => item.id === 't_api')) {
    return initialTasks;
  }
  return t;
};

const initialCategories = ['Engineering', 'Design', 'Mobile', 'Security', 'Marketing', 'Product', 'Operations'];
const initialDepartments = ['Engineering', 'Design', 'Product', 'Marketing', 'Mobile', 'Security', 'Operations', 'General'];

const initialState = {
  isAuthenticated: getFromStorage('trackify_auth', true),
  currentUser: getStoredUser(),
  users: getFromStorage('trackify_users', initialUsers),
  projects: getStoredProjects(),
  tasks: getStoredTasks(),
  todos: getFromStorage('trackify_todos', initialTodos),
  categories: getFromStorage('trackify_categories', initialCategories),
  departments: getFromStorage('trackify_departments', initialDepartments),
  notifications: getFromStorage('trackify_notifications', initialNotifications),
  reminders: getFromStorage('trackify_reminders', initialReminders),
  settings: getFromStorage('trackify_settings', {
    theme: 'light',
    accent: '#6366f1',
    weekStart: 'monday',
    notifyEmail: true,
    notifyPush: true,
    notifyTaskUpdate: true,
    notifyMention: true,
    notifyDeadline: true
  }),
  sidebarOpen: true,
  searchQuery: '',
  toasts: []
};

function appReducer(state, action) {
  switch (action.type) {
    case 'MERGE_SUPABASE_DATA': {
      const { tasks, projects, users } = action.payload;
      return {
        ...state,
        tasks: tasks && tasks.length ? tasks : state.tasks,
        projects: projects && projects.length ? projects : state.projects,
        users: users && users.length ? users : state.users
      };
    }
    case 'LOGIN':
      return { ...state, isAuthenticated: true, currentUser: action.payload };
    case 'LOGOUT':
      return { ...state, isAuthenticated: false, currentUser: null };
    case 'ADD_TOAST':
      return { ...state, toasts: [...state.toasts, action.payload] };
    case 'UPSERT_TOAST': {
      const exists = state.toasts.some(t => t.id === action.payload.id);
      if (exists) {
        return {
          ...state,
          toasts: state.toasts.map(t =>
            t.id === action.payload.id ? { ...t, ...action.payload, timestamp: Date.now() } : t
          )
        };
      }
      return { ...state, toasts: [...state.toasts, action.payload] };
    }
    case 'REMOVE_TOAST':
      return { ...state, toasts: state.toasts.filter(t => t.id !== action.payload) };
    case 'SIGNUP': {
      const newUser = action.payload;
      return {
        ...state,
        users: [...state.users, newUser],
        isAuthenticated: true,
        currentUser: newUser
      };
    }
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };
    case 'SET_SEARCH':
      return { ...state, searchQuery: action.payload };
    case 'ADD_TASK':
      return { ...state, tasks: [action.payload, ...state.tasks] };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(t => t.id === action.payload.id ? { ...t, ...action.payload } : t)
      };
    case 'UPDATE_TASK_PROGRESS': {
      const { taskId, progress, status } = action.payload;
      const task = state.tasks.find(t => t.id === taskId);
      if (!task) return state;

      const numProgress = Math.max(0, Math.min(100, Number(progress)));
      const derivedStatus = status || (numProgress === 100 ? 'done' : numProgress > 0 ? 'inprogress' : 'todo');

      const updatedTasks = state.tasks.map(t =>
        t.id === taskId ? { ...t, progress: numProgress, status: derivedStatus } : t
      );

      // Auto-recalculate parent project overall progress and task counts
      let updatedProjects = state.projects;
      if (task.project) {
        const pTasks = updatedTasks.filter(t => t.project === task.project);
        if (pTasks.length > 0) {
          const completedCount = pTasks.filter(t => t.status === 'done' || t.progress === 100).length;
          const avgProgress = Math.round(
            pTasks.reduce((sum, t) => sum + (Number(t.progress) || (t.status === 'done' ? 100 : t.status === 'inprogress' ? 50 : 0)), 0) / pTasks.length
          );
          const pStatus = avgProgress === 100 ? 'ended' : 'running';

          updatedProjects = state.projects.map(p =>
            p.id === task.project ? {
              ...p,
              progress: avgProgress,
              status: pStatus,
              taskCount: `${completedCount}/${pTasks.length}`
            } : p
          );
        }
      }

      const newNotif = {
        id: `n${Date.now()}`,
        userId: state.currentUser?.id,
        userName: state.currentUser?.name,
        userEmail: state.currentUser?.email,
        action: 'updated task progress',
        target: `${task.title} to ${numProgress}%`,
        to: derivedStatus,
        timestamp: Date.now(),
        read: false
      };

      return {
        ...state,
        tasks: updatedTasks,
        projects: updatedProjects,
        notifications: [newNotif, ...state.notifications]
      };
    }
    case 'ADD_TASK_TO_PROJECT': {
      const newTask = action.payload;
      const updatedTasks = [newTask, ...state.tasks];

      let updatedProjects = state.projects;
      if (newTask.project) {
        const pTasks = updatedTasks.filter(t => t.project === newTask.project);
        const completedCount = pTasks.filter(t => t.status === 'done' || t.progress === 100).length;
        const avgProgress = Math.round(
          pTasks.reduce((sum, t) => sum + (Number(t.progress) || (t.status === 'done' ? 100 : t.status === 'inprogress' ? 50 : 0)), 0) / pTasks.length
        );

        updatedProjects = state.projects.map(p =>
          p.id === newTask.project ? {
            ...p,
            progress: avgProgress,
            taskCount: `${completedCount}/${pTasks.length}`
          } : p
        );
      }

      const notif = {
        id: `n${Date.now()}`,
        userId: state.currentUser?.id,
        userName: state.currentUser?.name,
        userEmail: state.currentUser?.email,
        action: 'added task',
        target: newTask.title,
        to: state.projects.find(p => p.id === newTask.project)?.name || 'Project',
        timestamp: Date.now(),
        read: false
      };

      return {
        ...state,
        tasks: updatedTasks,
        projects: updatedProjects,
        notifications: [notif, ...state.notifications]
      };
    }
    case 'ADD_MEMBER_TO_PROJECT': {
      const { projectId, memberId } = action.payload;
      return {
        ...state,
        projects: state.projects.map(p => {
          if (p.id === projectId) {
            const currentMembers = p.members || [];
            if (!currentMembers.includes(memberId)) {
              return { ...p, members: [...currentMembers, memberId] };
            }
          }
          return p;
        })
      };
    }
    case 'MOVE_TASK': {
      const { taskId, newStatus, newIndex } = action.payload;
      const task = state.tasks.find(t => t.id === taskId);
      if (!task) return state;
      const statusLabels = { todo: 'To Do', inprogress: 'In Progress', inreview: 'In Review', done: 'Done' };
      const statusChanged = newStatus && task.status !== newStatus;
      const targetStatus = newStatus || task.status;
      const updatedTask = { ...task, status: targetStatus };

      const tasksWithout = state.tasks.filter(t => t.id !== taskId);
      let nextTasks;

      if (typeof newIndex === 'number' && newIndex >= 0) {
        const colTasks = tasksWithout.filter(t => t.status === targetStatus);
        const otherTasks = tasksWithout.filter(t => t.status !== targetStatus);
        const safeIndex = Math.min(newIndex, colTasks.length);
        colTasks.splice(safeIndex, 0, updatedTask);
        nextTasks = [...otherTasks, ...colTasks];
      } else {
        nextTasks = state.tasks.map(t => t.id === taskId ? updatedTask : t);
      }

      const newNotification = statusChanged ? {
        id: `n${Date.now()}`,
        userId: state.currentUser?.id,
        userName: state.currentUser?.name,
        userEmail: state.currentUser?.email,
        action: 'moved',
        target: task.title,
        from: statusLabels[task.status] || task.status,
        to: statusLabels[targetStatus] || targetStatus,
        timestamp: Date.now(),
        read: false
      } : null;

      return {
        ...state,
        tasks: nextTasks,
        notifications: newNotification ? [newNotification, ...state.notifications] : state.notifications
      };
    }
    case 'DELETE_TASK':
      return { ...state, tasks: state.tasks.filter(t => t.id !== action.payload) };
    case 'ADD_PROJECT':
      return { ...state, projects: [action.payload, ...state.projects] };
    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map(p => p.id === action.payload.id ? { ...p, ...action.payload } : p)
      };
    case 'DELETE_PROJECT':
      return {
        ...state,
        projects: state.projects.filter(p => p.id !== action.payload),
        tasks: state.tasks.filter(t => t.project !== action.payload)
      };
    case 'ADD_CATEGORY': {
      const cat = (action.payload || '').trim();
      if (!cat || (state.categories || []).includes(cat)) return state;
      return { ...state, categories: [...(state.categories || []), cat] };
    }
    case 'ADD_DEPARTMENT': {
      const dept = (action.payload || '').trim();
      if (!dept || (state.departments || []).includes(dept)) return state;
      return { ...state, departments: [...(state.departments || []), dept] };
    }
    case 'ADD_MEMBER': {
      const newMember = action.payload;
      return { ...state, users: [...state.users, newMember] };
    }
    case 'DELETE_MEMBER': {
      const memberId = action.payload;
      return {
        ...state,
        users: state.users.filter(u => u.id !== memberId),
        projects: state.projects.map(p => ({
          ...p,
          members: (p.members || []).filter(mId => mId !== memberId)
        })),
        tasks: state.tasks.map(t => t.assignee === memberId ? { ...t, assignee: '' } : t)
      };
    }
    case 'REMOVE_MEMBER_FROM_PROJECT': {
      const { projectId, memberId } = action.payload;
      return {
        ...state,
        projects: state.projects.map(p => {
          if (p.id === projectId) {
            return {
              ...p,
              members: (p.members || []).filter(mId => mId !== memberId)
            };
          }
          return p;
        })
      };
    }
    case 'CHANGE_MEMBER_PROJECT': {
      const { memberId, oldProjectId, newProjectId } = action.payload;
      return {
        ...state,
        projects: state.projects.map(p => {
          if (p.id === oldProjectId) {
            return { ...p, members: (p.members || []).filter(mId => mId !== memberId) };
          }
          if (p.id === newProjectId) {
            const current = p.members || [];
            return { ...p, members: current.includes(memberId) ? current : [...current, memberId] };
          }
          return p;
        })
      };
    }
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case 'UPDATE_PROFILE':
      return {
        ...state,
        currentUser: { ...state.currentUser, ...action.payload },
        users: state.users.map(u => u.id === state.currentUser?.id ? { ...u, ...action.payload } : u)
      };
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.payload ? { ...n, read: true } : n
        )
      };
    case 'MARK_ALL_READ':
      return {
        ...state,
        notifications: state.notifications.map(n => ({ ...n, read: true }))
      };
    case 'ADD_REMINDER':
      return { ...state, reminders: [...state.reminders, action.payload] };
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [action.payload, ...state.notifications] };
    case 'ADD_TODO':
      return { ...state, todos: [action.payload, ...state.todos] };
    case 'TOGGLE_TODO':
      return {
        ...state,
        todos: state.todos.map(td => td.id === action.payload ? { ...td, completed: !td.completed } : td)
      };
    case 'DELETE_TODO':
      return {
        ...state,
        todos: state.todos.filter(td => td.id !== action.payload)
      };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    localStorage.setItem('trackify_auth', JSON.stringify(state.isAuthenticated));
    localStorage.setItem('trackify_user', JSON.stringify(state.currentUser));
    localStorage.setItem('trackify_users', JSON.stringify(state.users));
    localStorage.setItem('trackify_projects', JSON.stringify(state.projects));
    localStorage.setItem('trackify_tasks', JSON.stringify(state.tasks));
    localStorage.setItem('trackify_todos', JSON.stringify(state.todos));
    localStorage.setItem('trackify_categories', JSON.stringify(state.categories));
    localStorage.setItem('trackify_departments', JSON.stringify(state.departments));
    localStorage.setItem('trackify_notifications', JSON.stringify(state.notifications));
    localStorage.setItem('trackify_reminders', JSON.stringify(state.reminders));
    localStorage.setItem('trackify_settings', JSON.stringify(state.settings));
  }, [state]);

  // Sync with Supabase on initial load if configured
  useEffect(() => {
    if (isSupabaseConfigured()) {
      fetchSupabaseWorkspace().then(cloudData => {
        if (cloudData && (cloudData.tasks?.length || cloudData.projects?.length)) {
          dispatch({ type: 'MERGE_SUPABASE_DATA', payload: cloudData });
        }
      });
      if (state.currentUser) {
        syncUserProfile(state.currentUser);
      }
    }
  }, []);

  // Background auto-sync of user profile to Supabase on change
  useEffect(() => {
    if (isSupabaseConfigured() && state.currentUser) {
      syncUserProfile(state.currentUser);
    }
  }, [state.currentUser]);

  const triggerToast = (title, message = '', type = 'info', customId = null, extraData = {}) => {
    const id = customId || `t_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    dispatch({
      type: 'UPSERT_TOAST',
      payload: { id, title, message, type, ...extraData }
    });

    if (toastTimeoutsRef.current[id]) {
      clearTimeout(toastTimeoutsRef.current[id]);
    }

    const duration = extraData.duration || (extraData.isLiveProgress ? 2500 : 3800);
    toastTimeoutsRef.current[id] = setTimeout(() => {
      dispatch({ type: 'REMOVE_TOAST', payload: id });
      delete toastTimeoutsRef.current[id];
    }, duration);
  };


  return (
    <AppContext.Provider value={{ state, dispatch, triggerToast, supabaseConfigured: isSupabaseConfigured() }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
