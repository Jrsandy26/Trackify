import React from 'react';
import { useApp } from '../context/AppContext';
import { activityData, timeByProject, topContributors } from '../data/mockData';
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

export default function Analytics() {
  const { state } = useApp();

  const totalTasks = state.tasks.length;
  const completedTasks = state.tasks.filter(t => t.status === 'done').length;
  const onTimeTasks = state.tasks.filter(t => {
    if (t.status !== 'done') return false;
    return new Date(t.dueDate) >= new Date(t.createdAt);
  }).length;

  const onTimePercent = completedTasks > 0 ? Math.round((onTimeTasks / completedTasks) * 100) : 0;

  const avgCycleTime = completedTasks > 0
    ? Math.round(state.tasks
        .filter(t => t.status === 'done')
        .reduce((sum, t) => {
          const created = new Date(t.createdAt);
          const due = new Date(t.dueDate);
          return sum + Math.max(1, Math.ceil((due - created) / 86400000));
        }, 0) / completedTasks)
    : 0;

  const throughputDaily = Math.round((completedTasks / 7) * 10) / 10;
  const throughputAvg = Math.round(throughputDaily * 10) / 10;
  const prevThroughput = Math.round((throughputAvg * 0.8) * 10) / 10;
  const throughputChange = prevThroughput > 0
    ? Math.round(((throughputAvg - prevThroughput) / prevThroughput) * 100)
    : 0;

  const stats = [
    {
      label: 'Tasks Completed',
      value: completedTasks,
      sub: `out of ${totalTasks} total`,
      color: '#10b981',
      icon: '✅',
      bg: '#10b98118'
    },
    {
      label: 'On-Time Delivery',
      value: `${onTimePercent}%`,
      sub: `${onTimeTasks} delivered on time`,
      color: '#6366f1',
      icon: '⏱️',
      bg: '#6366f118'
    },
    {
      label: 'Avg Cycle Time',
      value: `${avgCycleTime}d`,
      sub: 'per task completion',
      color: '#f59e0b',
      icon: '📊',
      bg: '#f59e0b18'
    },
    {
      label: 'Throughput',
      value: throughputAvg,
      sub: (
        <span style={{ color: throughputChange >= 0 ? '#10b981' : '#ef4444' }}>
          {throughputChange >= 0 ? '↑' : '↓'} {Math.abs(throughputChange)}% vs prev period
        </span>
      ),
      color: '#06b6d4',
      icon: '🚀',
      bg: '#06b6d418'
    }
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p className="chart-tooltip-label">{label}</p>
          {payload.map((p, i) => (
            <p key={i} style={{ color: p.color }}>{p.name}: {p.value}</p>
          ))}
        </div>
      );
    }
    return null;
  };

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="analytics-page">
      <div className="page-header">
        <div>
          <h1>Analytics</h1>
          <p className="page-subtitle">Track your team's performance and productivity metrics</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-row">
        {stats.map((stat, i) => (
          <div key={i} className="stat-card" style={{ '--stat-color': stat.color }}>
            <div className="stat-icon" style={{ background: stat.bg }}>
              <span>{stat.icon}</span>
            </div>
            <div className="stat-info">
              <span className="stat-value">{stat.value}</span>
              <span className="stat-label">{stat.label}</span>
              <span className="stat-sub">{stat.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="analytics-charts">
        {/* Time by Project */}
        <div className="card">
          <div className="card-header">
            <h3>Time by Project</h3>
          </div>
          <div className="chart-container pie-chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={timeByProject}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={110}
                  innerRadius={50}
                  fill="#8884d8"
                  dataKey="value"
                  paddingAngle={3}
                >
                  {timeByProject.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity Graph */}
        <div className="card">
          <div className="card-header">
            <h3>Activity Graph</h3>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="colorCommits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorReviews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorDeploys" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="date" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Area type="monotone" dataKey="commits" name="Commits" stroke="#6366f1" fill="url(#colorCommits)" strokeWidth={2} />
                <Area type="monotone" dataKey="reviews" name="Reviews" stroke="#06b6d4" fill="url(#colorReviews)" strokeWidth={2} />
                <Area type="monotone" dataKey="deploys" name="Deploys" stroke="#10b981" fill="url(#colorDeploys)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Contributors */}
      <div className="card top-contributors-card">
        <div className="card-header">
          <h3>Top Contributors</h3>
        </div>
        <div className="contributors-list">
          {topContributors.map((contributor, i) => (
            <div key={contributor.id} className="contributor-item">
              <span className="contributor-rank">#{i + 1}</span>
              <div className="contributor-avatar" style={{ background: contributor.color }}>
                {contributor.initials}
              </div>
              <div className="contributor-info">
                <span className="contributor-name">{contributor.name}</span>
                <span className="contributor-tasks">{contributor.tasksCompleted} tasks completed</span>
              </div>
              <div className="contributor-bar">
                <div
                  className="contributor-bar-fill"
                  style={{
                    width: `${(contributor.tasksCompleted / topContributors[0].tasksCompleted) * 100}%`,
                    background: contributor.color
                  }}
                />
              </div>
              <span className="contributor-count">{contributor.tasksCompleted}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
