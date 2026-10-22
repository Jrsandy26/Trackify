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
  const [editingTask, setEditingTask] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [filter, setFilter] = useState('all');

  // Inline additions for predefined fields
  const [showAddAssignee, setShowAddAssignee] = useState(false);
  const [inlineMemberName, setInlineMemberName] = useState('');
  const [inlineMemberRole, setInlineMemberRole] = useState('Developer');

  const [showAddProject, setShowAddProject] = useState(false);
  const [inlineProjectName, setInlineProjectName] = useState('');

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

  // Add Dynamic Member Inline Handler
  const handleAddNewMemberInline = (isEditing = false) => {
    if (!inlineMemberName.trim()) return;
    const newId = `u${Date.now()}`;
    const initials = inlineMemberName.trim().split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'TM';
    const memberObj = {
      id: newId,
      name: inlineMemberName.trim(),
      email: `${inlineMemberName.toLowerCase().replace(/\s+/g, '.')}@trackify.com`,
      role: inlineMemberRole || 'Developer',
      department: 'Engineering',
      color: '#10b981',
      initials
    };
    dispatch({ type: 'ADD_MEMBER', payload: memberObj });
    if (isEditing) {
      setEditingTask(prev => ({ ...prev, assignee: newId }));
    } else {
      setNewTask(prev => ({ ...prev, assignee: newId }));
    }
    if (triggerToast) triggerToast('Member Added 👤', `${memberObj.name} added to workspace!`, 'success');
    setInlineMemberName('');
    setShowAddAssignee(false);
  };

  // Add Dynamic Project Inline Handler
  const handleAddNewProjectInline = (isEditing = false) => {
    if (!inlineProjectName.trim()) return;
    const newProjId = `p${Date.now()}`;
    const projObj = {
      id: newProjId,
      name: inlineProjectName.trim(),
      status: 'running',
      progress: 0,
      taskCount: '0/1',
      startDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      dueDate: 'Nov 30, 2026',
      lead: state.currentUser?.name || 'Sandeep Sai',
      leadId: state.currentUser?.id || 'u0',
      members: [state.currentUser?.id || 'u0'],
      description: `${inlineProjectName.trim()} initiative`,
      color: '#6366f1',
      iconType: 'stripes',
      category: 'Engineering'
    };
    dispatch({ type: 'ADD_PROJECT', payload: projObj });
    if (isEditing) {
      setEditingTask(prev => ({ ...prev, project: newProjId }));
    } else {
      setNewTask(prev => ({ ...prev, project: newProjId }));
    }
    if (triggerToast) triggerToast('Project Added 📁', `"${projObj.name}" created!`, 'success');
    setInlineProjectName('');
    setShowAddProject(false);
  };

  // Add Task Handler
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
    if (triggerToast) triggerToast('Task Created 🎉', `"${newTask.title}" added to To Do!`, 'success');
    setNewTask({ title: '', description: '', priority: 'medium', assignee: '', project: '', dueDate: '' });
    setShowNewTask(false);
  };

  // Update Task Handler
  const handleUpdateTask = (e) => {
    e.preventDefault();
    if (!editingTask || !editingTask.title.trim()) return;
    dispatch({
      type: 'UPDATE_TASK',
      payload: {
        id: editingTask.id,
        title: editingTask.title.trim(),
        description: editingTask.description,
        status: editingTask.status || 'todo',
        priority: editingTask.priority || 'medium',
        assignee: editingTask.assignee,
        project: editingTask.project,
        dueDate: editingTask.dueDate
      }
    });
    if (triggerToast) triggerToast('Task Updated ✎', `"${editingTask.title}" updated successfully!`, 'success');
    setEditingTask(null);
  };

  // Delete Task Handler
  const handleDeleteTask = (taskId, taskTitle) => {
    dispatch({ type: 'DELETE_TASK', payload: taskId });
    if (triggerToast) triggerToast('Task Deleted', `"${taskTitle || 'Task'}" removed.`, 'info');
    if (taskToDelete && taskToDelete.id === taskId) {
      setTaskToDelete(null);
    }
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
          <p className="page-subtitle">Manage, create, edit and track all your team's tasks</p>
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

      {/* CREATE NEW TASK MODAL */}
      {showNewTask && (
        <div className="modal-overlay" onClick={() => setShowNewTask(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Task</h2>
              <button className="modal-close" onClick={() => setShowNewTask(false)}>✕</button>
            </div>
            <form onSubmit={handleAddTask} className="modal-form">
              <div className="form-group">
                <label>Task Title *</label>
                <input type="text" placeholder="Enter task title" value={newTask.title}
                  onChange={e => setNewTask({ ...newTask, title: e.target.value })} autoFocus required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea placeholder="Task details, requirements..." value={newTask.description}
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

              {/* Dynamic Assignee and Project */}
              <div className="form-row">
                <div className="form-group">
                  <div className="field-label-with-action">
                    <label>Assignee</label>
                    <button
                      type="button"
                      className="btn-inline-add-field"
                      onClick={() => setShowAddAssignee(!showAddAssignee)}
                    >
                      {showAddAssignee ? 'Cancel' : '+ New Entry'}
                    </button>
                  </div>
                  {showAddAssignee ? (
                    <div className="inline-add-input-box">
                      <input
                        type="text"
                        placeholder="Member name..."
                        value={inlineMemberName}
                        onChange={e => setInlineMemberName(e.target.value)}
                        className="modern-text-input small"
                        autoFocus
                      />
                      <button type="button" className="btn-save-inline-field" onClick={() => handleAddNewMemberInline(false)}>Add</button>
                    </div>
                  ) : (
                    <select value={newTask.assignee} onChange={e => setNewTask({ ...newTask, assignee: e.target.value })}>
                      <option value="">Select assignee</option>
                      {state.users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role || 'Member'})</option>)}
                    </select>
                  )}
                </div>

                <div className="form-group">
                  <div className="field-label-with-action">
                    <label>Project</label>
                    <button
                      type="button"
                      className="btn-inline-add-field"
                      onClick={() => setShowAddProject(!showAddProject)}
                    >
                      {showAddProject ? 'Cancel' : '+ New Entry'}
                    </button>
                  </div>
                  {showAddProject ? (
                    <div className="inline-add-input-box">
                      <input
                        type="text"
                        placeholder="Project name..."
                        value={inlineProjectName}
                        onChange={e => setInlineProjectName(e.target.value)}
                        className="modern-text-input small"
                        autoFocus
                      />
                      <button type="button" className="btn-save-inline-field" onClick={() => handleAddNewProjectInline(false)}>Add</button>
                    </div>
                  ) : (
                    <select value={newTask.project} onChange={e => setNewTask({ ...newTask, project: e.target.value })}>
                      <option value="">Select project</option>
                      {state.projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  )}
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

      {/* EDIT TASK MODAL */}
      {editingTask && (
        <div className="modal-overlay" onClick={() => setEditingTask(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Task</h2>
              <button className="modal-close" onClick={() => setEditingTask(null)}>✕</button>
            </div>
            <form onSubmit={handleUpdateTask} className="modal-form">
              <div className="form-group">
                <label>Task Title *</label>
                <input
                  type="text"
                  value={editingTask.title}
                  onChange={e => setEditingTask({ ...editingTask, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={editingTask.description || ''}
                  onChange={e => setEditingTask({ ...editingTask, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={editingTask.status || 'todo'}
                    onChange={e => setEditingTask({ ...editingTask, status: e.target.value })}
                  >
                    <option value="todo">📋 To Do</option>
                    <option value="inprogress">🔄 In Progress</option>
                    <option value="inreview">👀 In Review</option>
                    <option value="done">✅ Done</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select
                    value={editingTask.priority || 'medium'}
                    onChange={e => setEditingTask({ ...editingTask, priority: e.target.value })}
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <div className="field-label-with-action">
                    <label>Assignee</label>
                    <button
                      type="button"
                      className="btn-inline-add-field"
                      onClick={() => setShowAddAssignee(!showAddAssignee)}
                    >
                      {showAddAssignee ? 'Cancel' : '+ New Entry'}
                    </button>
                  </div>
                  {showAddAssignee ? (
                    <div className="inline-add-input-box">
                      <input
                        type="text"
                        placeholder="Member name..."
                        value={inlineMemberName}
                        onChange={e => setInlineMemberName(e.target.value)}
                        className="modern-text-input small"
                        autoFocus
                      />
                      <button type="button" className="btn-save-inline-field" onClick={() => handleAddNewMemberInline(true)}>Add</button>
                    </div>
                  ) : (
                    <select
                      value={editingTask.assignee || ''}
                      onChange={e => setEditingTask({ ...editingTask, assignee: e.target.value })}
                    >
                      <option value="">Select assignee</option>
                      {state.users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                  )}
                </div>

                <div className="form-group">
                  <div className="field-label-with-action">
                    <label>Project</label>
                    <button
                      type="button"
                      className="btn-inline-add-field"
                      onClick={() => setShowAddProject(!showAddProject)}
                    >
                      {showAddProject ? 'Cancel' : '+ New Entry'}
                    </button>
                  </div>
                  {showAddProject ? (
                    <div className="inline-add-input-box">
                      <input
                        type="text"
                        placeholder="Project name..."
                        value={inlineProjectName}
                        onChange={e => setInlineProjectName(e.target.value)}
                        className="modern-text-input small"
                        autoFocus
                      />
                      <button type="button" className="btn-save-inline-field" onClick={() => handleAddNewProjectInline(true)}>Add</button>
                    </div>
                  ) : (
                    <select
                      value={editingTask.project || ''}
                      onChange={e => setEditingTask({ ...editingTask, project: e.target.value })}
                    >
                      <option value="">Select project</option>
                      {state.projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Due Date</label>
                <input
                  type="date"
                  value={editingTask.dueDate || ''}
                  onChange={e => setEditingTask({ ...editingTask, dueDate: e.target.value })}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setEditingTask(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE TASK CONFIRMATION MODAL */}
      {taskToDelete && (
        <div className="modal-overlay" onClick={() => setTaskToDelete(null)}>
          <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
            <div className="danger-modal-icon-badge">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                <line x1="10" y1="11" x2="10" y2="17"/>
                <line x1="14" y1="11" x2="14" y2="17"/>
              </svg>
            </div>
            <h2>Delete Task?</h2>
            <p>Are you sure you want to delete <strong>"{taskToDelete.title}"</strong>? This action cannot be undone.</p>
            <div className="modal-actions" style={{ justifyContent: 'center', marginTop: '16px' }}>
              <button className="btn btn-ghost" onClick={() => setTaskToDelete(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDeleteTask(taskToDelete.id, taskToDelete.title)}>Delete Task</button>
            </div>
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

                                  <div className="card-top-right-group">
                                    <div className="card-action-icons">
                                      <button
                                        type="button"
                                        className="btn-card-icon edit"
                                        onClick={(e) => { e.stopPropagation(); setEditingTask(task); }}
                                        title="Edit Task"
                                      >
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                        </svg>
                                      </button>
                                      <button
                                        type="button"
                                        className="btn-card-icon delete"
                                        onClick={(e) => { e.stopPropagation(); setTaskToDelete(task); }}
                                        title="Delete Task"
                                      >
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                          <polyline points="3 6 5 6 21 6"/>
                                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                          <line x1="10" y1="11" x2="10" y2="17"/>
                                          <line x1="14" y1="11" x2="14" y2="17"/>
                                        </svg>
                                      </button>
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
                                </div>
                                <h4 className="kanban-card-title">{task.title}</h4>
                                {task.description && (
                                  <p className="kanban-card-desc">{task.description}</p>
                                )}
                                <div className="kanban-card-footer">
                                  <div className="kanban-card-meta">
                                    {assignee && (
                                      <div className="kanban-assignee" style={{ background: assignee.color }} title={assignee.name}>
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
