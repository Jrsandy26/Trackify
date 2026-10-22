import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useApp } from '../context/AppContext';

const columns = [
  { id: 'todo', label: 'To Do', color: '#64748b', icon: '📋' },
  { id: 'inprogress', label: 'In Progress', color: '#06b6d4', icon: '🔄' },
  { id: 'inreview', label: 'In Review', color: '#f59e0b', icon: '👀' },
  { id: 'done', label: 'Done', color: '#10b981', icon: '✅' },
];

const priorityColors = {
  high: { bg: '#fef2f2', color: '#ef4444', label: 'High' },
  medium: { bg: '#fffbeb', color: '#f59e0b', label: 'Medium' },
  low: { bg: '#f0fdf4', color: '#22c55e', label: 'Low' },
};

export default function Tasks() {
  const { state, dispatch, triggerToast } = useApp();
  const [showNewTask, setShowNewTask] = useState(false);
  const [filter, setFilter] = useState('all');
  const [newTask, setNewTask] = useState({
    title: '', description: '', priority: 'medium', assignee: '', project: '', dueDate: ''
  });

  const getFilteredTasks = (status) => {
    let tasks = state.tasks.filter(t => t.status === status);

    if (filter === 'mytask') {
      tasks = tasks.filter(t => t.assignee === state.currentUser?.id);
    } else if (filter === 'high') {
      tasks = tasks.filter(t => t.priority === 'high');
    } else if (filter === 'dueweek') {
      const now = new Date();
      const weekEnd = new Date(now);
      weekEnd.setDate(now.getDate() + (7 - now.getDay()));
      tasks = tasks.filter(t => {
        const due = new Date(t.dueDate);
        return due >= now && due <= weekEnd;
      });
    }

    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      tasks = tasks.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.tags?.some(tag => tag.toLowerCase().includes(q))
      );
    }

    return tasks;
  };

  const moveTaskStep = (taskId, currentStatus, direction) => {
    const colOrder = ['todo', 'inprogress', 'inreview', 'done'];
    const curIdx = colOrder.indexOf(currentStatus);
    const nextIdx = direction === 'next' ? curIdx + 1 : curIdx - 1;
    if (nextIdx >= 0 && nextIdx < colOrder.length) {
      const nextStatus = colOrder[nextIdx];
      dispatch({ type: 'MOVE_TASK', payload: { taskId, newStatus: nextStatus } });
      const colLabels = { todo: 'To Do', inprogress: 'In Progress', inreview: 'In Review', done: 'Done' };
      if (triggerToast) triggerToast('Card Moved 🚀', `Card moved to ${colLabels[nextStatus]}`, 'success');
    }
  };

  const handleDragEnd = (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;
    
    dispatch({
      type: 'MOVE_TASK',
      payload: {
        taskId: draggableId,
        newStatus: destination.droppableId,
        newIndex: destination.index
      }
    });

    const colLabels = { todo: 'To Do', inprogress: 'In Progress', inreview: 'In Review', done: 'Done' };
    if (triggerToast) {
      triggerToast('Task Moved 🚀', `Moved to ${colLabels[destination.droppableId] || destination.droppableId}`, 'info');
    }
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTask.title) return;
    dispatch({
      type: 'ADD_TASK',
      payload: {
        id: `t${Date.now()}`,
        title: newTask.title,
        description: newTask.description,
        status: 'todo',
        priority: newTask.priority,
        assignee: newTask.assignee || state.currentUser?.id,
        project: newTask.project || state.projects[0]?.id,
        dueDate: newTask.dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        createdAt: new Date().toISOString().split('T')[0],
        tags: []
      }
    });
    if (triggerToast) triggerToast('Task Created', `"${newTask.title}" added to To Do!`, 'success');
    setNewTask({ title: '', description: '', priority: 'medium', assignee: '', project: '', dueDate: '' });
    setShowNewTask(false);
  };

  const getAssignee = (id) => state.users.find(u => u.id === id);
  const getProject = (id) => state.projects.find(p => p.id === id);

  const filters = [
    { id: 'all', label: 'All Tasks' },
    { id: 'mytask', label: 'My Tasks' },
    { id: 'high', label: 'High Priority' },
    { id: 'dueweek', label: 'Due This Week' },
  ];

  return (
    <div className="tasks-page">
      <div className="page-header">
        <div>
          <h1>Tasks</h1>
          <p className="page-subtitle">Manage and track your team's tasks</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowNewTask(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New Task
        </button>
      </div>

      {/* Filter bar */}
      <div className="task-filters">
        {filters.map(f => (
          <button
            key={f.id}
            className={`filter-btn ${filter === f.id ? 'active' : ''}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* New Task Modal */}
      {showNewTask && (
        <div className="modal-overlay" onClick={() => setShowNewTask(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Task</h2>
              <button className="modal-close" onClick={() => setShowNewTask(false)}>✕</button>
            </div>
            <form onSubmit={handleAddTask} className="modal-form">
              <div className="form-group">
                <label>Task Title</label>
                <input type="text" placeholder="Enter task title" value={newTask.title}
                  onChange={e => setNewTask({ ...newTask, title: e.target.value })} autoFocus />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea placeholder="Task description..." value={newTask.description}
                  onChange={e => setNewTask({ ...newTask, description: e.target.value })} rows={3} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Priority</label>
                  <select value={newTask.priority} onChange={e => setNewTask({ ...newTask, priority: e.target.value })}>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Due Date</label>
                  <input type="date" value={newTask.dueDate}
                    onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Assignee</label>
                  <select value={newTask.assignee} onChange={e => setNewTask({ ...newTask, assignee: e.target.value })}>
                    <option value="">Select assignee</option>
                    {state.users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Project</label>
                  <select value={newTask.project} onChange={e => setNewTask({ ...newTask, project: e.target.value })}>
                    <option value="">Select project</option>
                    {state.projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowNewTask(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="kanban-board">
          {columns.map(col => {
            const tasks = getFilteredTasks(col.id);
            return (
              <div key={col.id} className="kanban-column">
                <div className="kanban-column-header" style={{ '--col-color': col.color }}>
                  <div className="kanban-column-title">
                    <span className="kanban-col-icon">{col.icon}</span>
                    <span>{col.label}</span>
                    <span className="kanban-count">{tasks.length}</span>
                  </div>
                </div>
                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div
                      className={`kanban-column-body ${snapshot.isDraggingOver ? 'drag-over' : ''}`}
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      {tasks.map((task, index) => {
                        const assignee = getAssignee(task.assignee);
                        const project = getProject(task.project);
                        const priority = priorityColors[task.priority] || priorityColors.medium;
                        return (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                className={`kanban-card ${snapshot.isDragging ? 'dragging' : ''}`}
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                <div className="kanban-card-top">
                                  <div className="card-top-tags">
                                    <span className="priority-badge" style={{ background: priority.bg, color: priority.color }}>
                                      {priority.label}
                                    </span>
                                    {task.tags && task.tags.slice(0, 2).map(tag => (
                                      <span key={tag} className="tag-badge">{tag}</span>
                                    ))}
                                  </div>
                                  <div className="card-stage-buttons">
                                    {col.id !== 'todo' && (
                                      <button
                                        type="button"
                                        className="btn-card-step prev"
                                        onClick={(e) => { e.stopPropagation(); moveTaskStep(task.id, col.id, 'prev'); }}
                                        title="Move back 1 column"
                                      >
                                        ‹
                                      </button>
                                    )}
                                    {col.id !== 'done' && (
                                      <button
                                        type="button"
                                        className="btn-card-step next"
                                        onClick={(e) => { e.stopPropagation(); moveTaskStep(task.id, col.id, 'next'); }}
                                        title="Move forward 1 column"
                                      >
                                        ›
                                      </button>
                                    )}
                                  </div>
                                </div>
                                <h4 className="kanban-card-title">{task.title}</h4>
                                {task.description && (
                                  <p className="kanban-card-desc">{task.description}</p>
                                )}
                                <div className="kanban-card-footer">
                                  <div className="kanban-card-meta">
                                    {assignee && (
                                      <div className="kanban-assignee" style={{ background: assignee.color }}>
                                        {assignee.initials}
                                      </div>
                                    )}
                                    {project && (
                                      <span className="kanban-project" style={{ color: project.color }}>
                                        {project.name}
                                      </span>
                                    )}
                                  </div>
                                  {task.dueDate && (
                                    <span className="kanban-due">
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                                      {task.dueDate}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}
