import { createClient } from '@supabase/supabase-js';

// Retrieve Supabase URL and Publishable/Anon Key from Vite env or localStorage overrides
const envUrl = (import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL || '').trim();
const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_PUBLISHABLE_KEY || '').trim();

const savedUrl = localStorage.getItem('trackify_supabase_url') || envUrl;
const savedKey = localStorage.getItem('trackify_supabase_anon_key') || envKey;

export const isSupabaseConfigured = () => {
  const url = localStorage.getItem('trackify_supabase_url') || envUrl;
  const key = localStorage.getItem('trackify_supabase_anon_key') || envKey;
  return Boolean(url && key && url.startsWith('http') && key.length > 10);
};

export function getSupabaseCredentials() {
  return {
    url: localStorage.getItem('trackify_supabase_url') || envUrl,
    key: localStorage.getItem('trackify_supabase_anon_key') || envKey,
    isConfigured: isSupabaseConfigured()
  };
}

export function saveSupabaseCredentials(url, key) {
  if (url) localStorage.setItem('trackify_supabase_url', url.trim());
  if (key) localStorage.setItem('trackify_supabase_anon_key', key.trim());
}

// Create singleton client (or null if not configured)
export const supabase = isSupabaseConfigured()
  ? createClient(savedUrl, savedKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    })
  : null;

/**
 * Sync logged-in user profile to Supabase
 */
export async function syncUserProfile(user) {
  if (!supabase || !isSupabaseConfigured() || !user) return null;
  try {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id || user.email,
        email: user.email,
        name: user.name,
        role: user.role || 'Member',
        department: user.department || 'General',
        color: user.color || '#3b82f6',
        initials: user.initials || user.name?.slice(0, 2).toUpperCase() || 'U',
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (error) {
      console.warn('[Supabase] syncUserProfile error:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.warn('[Supabase] Failed to sync profile:', err);
    return null;
  }
}

/**
 * Fetch all workspace data from Supabase (tasks, projects, profiles, invitations)
 */
export async function fetchSupabaseWorkspace() {
  if (!supabase || !isSupabaseConfigured()) return null;
  try {
    const [tasksRes, projectsRes, profilesRes, invitesRes] = await Promise.all([
      supabase.from('tasks').select('*'),
      supabase.from('projects').select('*'),
      supabase.from('profiles').select('*'),
      supabase.from('team_invitations').select('*')
    ]);

    return {
      tasks: tasksRes.data || [],
      projects: projectsRes.data || [],
      users: profilesRes.data || [],
      invitations: invitesRes.data || []
    };
  } catch (err) {
    console.warn('[Supabase] fetchWorkspace error:', err);
    return null;
  }
}

/**
 * Upsert a task to Supabase
 */
export async function saveSupabaseTask(task) {
  if (!supabase || !isSupabaseConfigured() || !task) return null;
  try {
    const { data, error } = await supabase
      .from('tasks')
      .upsert({
        id: task.id,
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority || 'medium',
        project_id: task.project || task.projectId || null,
        assignee_id: task.assignee || task.assigneeId || null,
        due_date: task.dueDate || null,
        tags: task.tags || [],
        created_at: task.createdAt || new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (error) console.warn('[Supabase] saveTask warning:', error.message);
    return data;
  } catch (err) {
    console.warn('[Supabase] saveTask failed:', err);
    return null;
  }
}

/**
 * Delete a task from Supabase
 */
export async function deleteSupabaseTask(taskId) {
  if (!supabase || !isSupabaseConfigured() || !taskId) return;
  try {
    await supabase.from('tasks').delete().eq('id', taskId);
  } catch (err) {
    console.warn('[Supabase] deleteTask error:', err);
  }
}

/**
 * Upsert a project to Supabase
 */
export async function saveSupabaseProject(project) {
  if (!supabase || !isSupabaseConfigured() || !project) return null;
  try {
    const { data, error } = await supabase
      .from('projects')
      .upsert({
        id: project.id,
        name: project.name,
        description: project.description || '',
        category: project.category || 'Development',
        department: project.department || 'Engineering',
        lead: project.lead || '',
        status: project.status || 'running',
        progress: project.progress || 0,
        color: project.color || '#4f46e5',
        icon_type: project.iconType || 'layout',
        members: project.members || [],
        subtasks: project.subtasks || [],
        due_date: project.dueDate || null,
        created_at: project.createdAt || new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (error) console.warn('[Supabase] saveProject warning:', error.message);
    return data;
  } catch (err) {
    console.warn('[Supabase] saveProject failed:', err);
    return null;
  }
}

/**
 * Delete a project from Supabase
 */
export async function deleteSupabaseProject(projectId) {
  if (!supabase || !isSupabaseConfigured() || !projectId) return;
  try {
    await supabase.from('projects').delete().eq('id', projectId);
  } catch (err) {
    console.warn('[Supabase] deleteProject error:', err);
  }
}

/**
 * Save team invitation to Supabase
 */
export async function saveSupabaseInvitation(invitation) {
  if (!supabase || !isSupabaseConfigured() || !invitation) return null;
  try {
    const { data, error } = await supabase
      .from('team_invitations')
      .upsert({
        id: invitation.id,
        token: invitation.token,
        inviter_name: invitation.inviterName,
        inviter_email: invitation.inviterEmail,
        recipient_name: invitation.recipientName,
        recipient_email: invitation.recipientEmail,
        role: invitation.role,
        department: invitation.department,
        project: invitation.project,
        note: invitation.note || '',
        status: invitation.status || 'pending',
        created_at: invitation.createdAt || new Date().toISOString()
      }, { onConflict: 'id' });

    if (error) console.warn('[Supabase] saveInvitation warning:', error.message);
    return data;
  } catch (err) {
    console.warn('[Supabase] saveInvitation failed:', err);
    return null;
  }
}

/**
 * Save time tracking entry to Supabase
 */
export async function saveSupabaseTimeEntry(entry) {
  if (!supabase || !isSupabaseConfigured() || !entry) return null;
  try {
    const { data, error } = await supabase
      .from('time_entries')
      .upsert({
        id: entry.id,
        task_id: entry.taskId,
        task_title: entry.taskTitle,
        project_name: entry.projectName,
        user_name: entry.userName,
        duration_seconds: entry.durationSeconds || 0,
        start_time: entry.startTime,
        end_time: entry.endTime,
        created_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (error) console.warn('[Supabase] saveTimeEntry warning:', error.message);
    return data;
  } catch (err) {
    console.warn('[Supabase] saveTimeEntry failed:', err);
    return null;
  }
}
