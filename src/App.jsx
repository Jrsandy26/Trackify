import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import ToastContainer from './components/ToastContainer';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Tasks from './pages/Tasks';
import CalendarPage from './pages/CalendarPage';
import Analytics from './pages/Analytics';
import Team from './pages/Team';
import Settings from './pages/Settings';
import Help from './pages/Help';

function ProtectedLayout() {
  const { state } = useApp();
  
  if (!state.isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  
  return (
    <div className={`app-layout ${state.sidebarOpen ? '' : 'sidebar-collapsed'}`} data-theme={state.settings.theme} style={{ '--accent': state.settings.accent, '--accent-light': state.settings.accent + '20', '--accent-hover': state.settings.accent + 'dd' }}>
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
      <Route path="/*" element={<ProtectedLayout />} />
    </Routes>
  );
}
