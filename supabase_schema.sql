-- ===================================================================
-- TRACKIFY SUPABASE POSTGRESQL DATABASE SCHEMA
-- Run this in your Supabase Dashboard -> SQL Editor
-- ===================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES / USERS TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'Team Member',
  department TEXT DEFAULT 'General',
  color TEXT DEFAULT '#3b82f6',
  initials TEXT DEFAULT 'U',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PROJECTS TABLE
CREATE TABLE IF NOT EXISTS public.projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  category TEXT DEFAULT 'Development',
  department TEXT DEFAULT 'Engineering',
  lead TEXT DEFAULT '',
  status TEXT DEFAULT 'running', -- running, ended, pending, archived
  progress INTEGER DEFAULT 0,
  color TEXT DEFAULT '#4f46e5',
  icon_type TEXT DEFAULT 'layout',
  members JSONB DEFAULT '[]'::jsonb,
  subtasks JSONB DEFAULT '[]'::jsonb,
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TASKS TABLE
CREATE TABLE IF NOT EXISTS public.tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  status TEXT DEFAULT 'todo', -- todo, inprogress, inreview, done
  priority TEXT DEFAULT 'medium', -- low, medium, high, urgent
  project_id TEXT REFERENCES public.projects(id) ON DELETE SET NULL,
  assignee_id TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
  due_date DATE,
  tags JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TEAM INVITATIONS TABLE (Synced with Gmail SMTP Flow)
CREATE TABLE IF NOT EXISTS public.team_invitations (
  id TEXT PRIMARY KEY,
  token TEXT UNIQUE NOT NULL,
  inviter_name TEXT NOT NULL,
  inviter_email TEXT NOT NULL,
  recipient_name TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  role TEXT DEFAULT 'Team Member',
  department TEXT DEFAULT 'General',
  project TEXT DEFAULT 'Website Redesign',
  note TEXT DEFAULT '',
  status TEXT DEFAULT 'pending', -- pending, accepted, revoked
  created_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ
);

-- 5. TIME ENTRIES TABLE
CREATE TABLE IF NOT EXISTS public.time_entries (
  id TEXT PRIMARY KEY,
  task_id TEXT,
  task_title TEXT NOT NULL,
  project_name TEXT NOT NULL,
  user_name TEXT NOT NULL,
  duration_seconds INTEGER DEFAULT 0,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CALENDAR EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.calendar_events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  time TEXT,
  category TEXT DEFAULT 'task', -- task, meeting, milestone, personal, deadline
  project TEXT DEFAULT 'Website Redesign',
  attendees JSONB DEFAULT '[]'::jsonb,
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) - Set permissive policies for quick setup
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- Allow public read/write access via Supabase anon key for the workspace
CREATE POLICY "Allow public read access to profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read access to projects" ON public.projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read access to tasks" ON public.tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read access to team_invitations" ON public.team_invitations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read access to time_entries" ON public.time_entries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read access to calendar_events" ON public.calendar_events FOR ALL USING (true) WITH CHECK (true);

-- Helpful initial sample data
INSERT INTO public.profiles (id, email, name, role, department, color, initials)
VALUES 
  ('usr-1', 'sandeep@trackify.com', 'Sandeep Sai', 'Owner & Lead', 'Executive', '#3b82f6', 'S'),
  ('usr-2', 'riya.bhalerao@trackify.com', 'Riya Bhalerao', 'Project Lead', 'Product', '#ec4899', 'RB'),
  ('usr-3', 'mateo.silva@trackify.com', 'Mateo Silva', 'Frontend Developer', 'Engineering', '#10b981', 'MS'),
  ('usr-4', 'james.wilson@trackify.com', 'James Wilson', 'Backend Developer', 'Engineering', '#6366f1', 'JW'),
  ('usr-5', 'daniel.kim@trackify.com', 'Daniel Kim', 'UI/UX Designer', 'Design', '#f59e0b', 'DK'),
  ('usr-6', 'emily.park@trackify.com', 'Emily Park', 'QA Engineer', 'QA', '#06b6d4', 'EP')
ON CONFLICT (id) DO NOTHING;
