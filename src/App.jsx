import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import ToastContainer from './components/ToastContainer';
import Auth from './pages/Auth';
import AcceptInvite from './pages/AcceptInvite';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Tasks from './pages/Tasks';
import CalendarPage from './pages/CalendarPage';
import Analytics from './pages/Analytics';
import Team from './pages/Team';
import Settings from './pages/Settings';
import Help from './pages/Help';
import { subscribeTeamEvents, syncEventTypes } from './utils/syncChannel';

function ProtectedLayout() {
  const { state, dispatch, triggerToast } = useApp();

  // Realtime subscription for cross-account and cross-tab collaboration
  useEffect(() => {
    const unsubscribe = subscribeTeamEvents((data) => {
      if (!data || !data.type) return;

      if (data.type === syncEventTypes.MEMBER_JOINED || data.type === syncEventTypes.INVITE_ACCEPTED) {
        const { member, project, role, name, email } = data.payload || {};
        if (member && !state.users.some(u => u.id === member.id || u.email === member.email)) {
          dispatch({ type: 'ADD_MEMBER', payload: member });
        }
        if (triggerToast) {
          triggerToast(
            'Team Member Joined! 🚀',
            `${name || email} has joined ${project || 'the team'} as ${role || 'Member'}.`,
            'success'
          );
        }
      } else if (data.type === syncEventTypes.INVITE_SENT) {
        const { recipientEmail, project, role } = data.payload || {};
        if (triggerToast) {
          triggerToast(
            'New Invitation Dispatched ✉️',
            `Invitation sent to ${recipientEmail} for ${project} (${role}).`,
            'info'
          );
        }
      }
    });

    return () => unsubscribe();
  }, [state.users, dispatch, triggerToast]);

  if (!state.isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div
      className={`app-layout ${state.sidebarOpen ? '' : 'sidebar-collapsed'}`}
      data-theme={state.settings.theme}
      style={{
        '--accent': state.settings.accent,
        '--accent-light': state.settings.accent + '20',
        '--accent-hover': state.settings.accent + 'dd'
      }}
    >
      <ToastContainer />
      <Sidebar />
      <div className="main-wrapper">
        <TopBar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/team" element={<Team />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/help" element={<Help />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/accept-invite" element={<AcceptInvite />} />
      <Route path="/*" element={<ProtectedLayout />} />
    </Routes>
  );
}
