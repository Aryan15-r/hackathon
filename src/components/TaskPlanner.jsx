import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  CheckSquare,
  Plus,
  Trash2,
  Calendar,
  Clock,
  Tag,
  AlertTriangle,
  Search,
  Filter,
  CheckCircle2
} from 'lucide-react';

export default function TaskPlanner() {
  const { tasks, addTask, toggleTask, deleteTask, triggerAlarm } = useApp();

  const [activeCategory, setActiveCategory] = useState('all');
  const [activePriority, setActivePriority] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    category: 'assignment',
    priority: 'medium',
    due_date: new Date().toISOString().split('T')[0],
    due_time: '23:59'
  });

  const categories = ['all', 'assignment', 'exam', 'project', 'college', 'personal'];

  const filteredTasks = tasks.filter(task => {
    const matchesCategory = activeCategory === 'all' || task.category === activeCategory;
    const matchesPriority = activePriority === 'all' || task.priority === activePriority;
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesPriority && matchesSearch;
  });

  const completedCount = tasks.filter(t => t.completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    await addTask(newTask);
    setNewTask({
      title: '',
      description: '',
      category: 'assignment',
      priority: 'medium',
      due_date: new Date().toISOString().split('T')[0],
      due_time: '23:59'
    });
    setIsAddModalOpen(false);
  };

  const handleTestAlarm = () => {
    triggerAlarm({
      id: 'test-alarm-' + Date.now(),
      title: 'Operating Systems Lab Submission Deadline',
      category: 'Assignment',
      due_time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      description: 'Submit PDF report and C code for Banker\'s Algorithm deadlock avoidance.'
    });
  };

  return (
    <div className="task-planner-page animate-fade-in">
      {/* Header Bar */}
      <div className="planner-header glass-card">
        <div className="header-info">
          <h2>Task & Deadline Planner</h2>
          <p>Organize assignments, lab exams, group projects, and set custom audio alarms.</p>
        </div>

        <div style={{ display: 'flex', items: 'center', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={handleTestAlarm}
            style={{ borderRadius: '12px', fontSize: '0.85rem', fontWeight: 600, border: '1px solid rgba(217, 119, 6, 0.3)', color: '#B45309', background: '#FFFBEB' }}
            title="Trigger an instant alarm pop-up with sound chime"
          >
            🔔 Test Alarm
          </button>

          <button className="gradient-button" onClick={() => setIsAddModalOpen(true)} style={{ borderRadius: '12px' }}>
            <Plus size={18} /> Add New Task
          </button>
        </div>
      </div>

      {/* Progress Bar & Summary */}
      <div className="progress-card glass-card">
        <div className="progress-info">
          <div className="progress-text">
            <span>Task Completion Overview</span>
            <strong>{completedCount} of {tasks.length} tasks completed ({progressPercent}%)</strong>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="filter-bar glass-card">
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Filter tasks by name or description..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="filter-search-input"
          />
        </div>

        <div className="category-pills">
          {categories.map(cat => (
            <button
              key={cat}
              className={`cat-pill ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Task List Grid */}
      <div className="tasks-grid">
        {filteredTasks.length === 0 ? (
          <div className="empty-tasks-placeholder glass-card">
            <CheckCircle2 size={40} className="empty-icon" />
            <h3>No tasks match your criteria</h3>
            <p>Try switching filters or add a new task deadline!</p>
          </div>
        ) : (
          filteredTasks.map(task => (
            <div key={task.id} className={`task-card glass-card ${task.completed ? 'completed' : ''}`}>
              <div className="task-card-header">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task.id)}
                  className="task-checkbox"
                />

                <div className="task-card-title-group">
                  <h4 className={`task-title ${task.completed ? 'done' : ''}`}>{task.title}</h4>
                  {task.description && <p className="task-desc">{task.description}</p>}
                </div>

                <button className="delete-task-btn" onClick={() => deleteTask(task.id)} title="Delete Task">
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="task-card-footer">
                <span className={`category-tag ${task.category}`}>{task.category}</span>
                <span className={`priority-tag ${task.priority}`}>{task.priority} priority</span>

                <div className="due-info">
                  <Calendar size={13} />
                  <span>{task.due_date} {task.due_time}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Task Modal — Spacious, Aesthetic & Modern */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div
            className="glass-card animate-fade-in"
            style={{
              width: '100%',
              maxWidth: '620px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '2rem',
              borderRadius: '24px',
              boxShadow: '0 25px 60px -15px rgba(30, 58, 95, 0.25)',
              background: '#FFFFFF',
              border: '1px solid rgba(30, 58, 95, 0.15)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(30, 58, 95, 0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{ width: 44, height: 44, borderRadius: '14px', background: 'rgba(30, 58, 95, 0.08)', color: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckSquare size={22} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1A1A2E', fontFamily: 'Outfit, sans-serif', margin: 0 }}>
                    Create New Academic Task
                  </h2>
                  <p style={{ fontSize: '0.8rem', color: '#6B7280', margin: '2px 0 0' }}>
                    Track assignments, exam milestones, and study commitments
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: 'rgba(0,0,0,0.05)', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#6B7280' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Task Title */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#1A1A2E', marginBottom: 6 }}>
                  Task Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Operating Systems Lab 4 Deadlock Implementation"
                  value={newTask.title}
                  onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    height: '46px',
                    padding: '0 1rem',
                    borderRadius: '12px',
                    border: '1px solid rgba(30, 58, 95, 0.2)',
                    background: '#FAFAF7',
                    fontSize: '0.92rem',
                    color: '#1A1A2E',
                    fontFamily: 'Inter, sans-serif',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Category Selector (Chips) */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#1A1A2E', marginBottom: 8 }}>
                  Category
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {[
                    { id: 'assignment', label: 'Assignment', icon: '📝' },
                    { id: 'exam', label: 'Exam / Quiz', icon: '🎯' },
                    { id: 'project', label: 'Project', icon: '🚀' },
                    { id: 'college', label: 'College Event', icon: '🏛️' },
                    { id: 'personal', label: 'Personal', icon: '⭐' },
                  ].map(cat => {
                    const isSelected = newTask.category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setNewTask({ ...newTask, category: cat.id })}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          padding: '0.5rem 0.85rem',
                          borderRadius: '10px',
                          border: isSelected ? '2px solid #1E3A5F' : '1px solid rgba(30, 58, 95, 0.15)',
                          background: isSelected ? 'rgba(30, 58, 95, 0.08)' : '#FAFAF7',
                          color: isSelected ? '#1E3A5F' : '#374151',
                          fontWeight: isSelected ? 700 : 500,
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <span>{cat.icon}</span>
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Priority Cards */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#1A1A2E', marginBottom: 8 }}>
                  Urgency & Priority
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                  {[
                    { id: 'low', label: 'Low', badge: 'Normal Pace', color: '#059669', bg: '#ECFDF5', border: '#A7F3D0' },
                    { id: 'medium', label: 'Medium', badge: 'Standard', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
                    { id: 'high', label: 'High Priority', badge: 'Urgent Deadline', color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
                  ].map(p => {
                    const isSelected = newTask.priority === p.id;
                    return (
                      <div
                        key={p.id}
                        onClick={() => setNewTask({ ...newTask, priority: p.id })}
                        style={{
                          padding: '0.75rem',
                          borderRadius: '12px',
                          border: isSelected ? `2px solid ${p.color}` : '1px solid rgba(0,0,0,0.1)',
                          background: isSelected ? p.bg : '#FAFAF7',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          textAlign: 'center'
                        }}
                      >
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: p.color }}>{p.label}</div>
                        <div style={{ fontSize: '0.7rem', color: '#6B7280', marginTop: 2 }}>{p.badge}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Date & Time Row with Presets */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1A1A2E' }}>
                    Due Date & Time
                  </label>
                  {/* Presets */}
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    {[
                      { label: 'Today', days: 0 },
                      { label: 'Tomorrow', days: 1 },
                      { label: '+3 Days', days: 3 },
                      { label: 'Next Week', days: 7 },
                    ].map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          const targetDate = new Date(Date.now() + preset.days * 86400000);
                          setNewTask(prev => ({ ...prev, due_date: targetDate.toISOString().split('T')[0] }));
                        }}
                        style={{
                          fontSize: '0.68rem',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '6px',
                          border: '1px solid rgba(30, 58, 95, 0.15)',
                          background: '#fff',
                          color: '#1E3A5F',
                          cursor: 'pointer',
                          fontWeight: 600
                        }}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="date"
                      value={newTask.due_date}
                      onChange={e => setNewTask({ ...newTask, due_date: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        height: '44px',
                        padding: '0 0.85rem',
                        borderRadius: '10px',
                        border: '1px solid rgba(30, 58, 95, 0.2)',
                        background: '#FAFAF7',
                        fontSize: '0.85rem',
                        color: '#1A1A2E',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div style={{ position: 'relative' }}>
                    <input
                      type="time"
                      value={newTask.due_time}
                      onChange={e => setNewTask({ ...newTask, due_time: e.target.value })}
                      style={{
                        width: '100%',
                        height: '44px',
                        padding: '0 0.85rem',
                        borderRadius: '10px',
                        border: '1px solid rgba(30, 58, 95, 0.2)',
                        background: '#FAFAF7',
                        fontSize: '0.85rem',
                        color: '#1A1A2E',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Description / Notes */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#1A1A2E', marginBottom: 6 }}>
                  Notes & Details <span style={{ fontWeight: 400, color: '#6B7280' }}>(Optional)</span>
                </label>
                <textarea
                  placeholder="Key deliverables, sub-steps, reference links, or professor guidelines..."
                  value={newTask.description}
                  onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '12px',
                    border: '1px solid rgba(30, 58, 95, 0.2)',
                    background: '#FAFAF7',
                    fontSize: '0.88rem',
                    color: '#1A1A2E',
                    fontFamily: 'Inter, sans-serif',
                    outline: 'none',
                    resize: 'vertical',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Modal Actions */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(30, 58, 95, 0.08)' }}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  style={{
                    padding: '0.65rem 1.25rem',
                    borderRadius: '10px',
                    border: '1px solid rgba(30, 58, 95, 0.2)',
                    background: 'transparent',
                    color: '#374151',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="gradient-button"
                  style={{
                    padding: '0.65rem 1.5rem',
                    borderRadius: '10px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(30, 58, 95, 0.2)'
                  }}
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Embedded Task Planner Styles */}
      <style>{`
        .task-planner-page {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .planner-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem;
        }

        .header-info p {
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .progress-card {
          padding: 1.25rem 1.5rem;
        }

        .progress-info {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        .progress-text {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .progress-track {
          height: 10px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: var(--radius-full);
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: var(--accent-gradient);
          border-radius: var(--radius-full);
          transition: width 0.4s ease;
        }

        .filter-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.85rem 1.25rem;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .search-input-wrapper {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          flex: 1;
          min-width: 250px;
          background: var(--input-bg);
          border: 1px solid var(--card-border);
          border-radius: var(--radius-sm);
          padding: 0.5rem 0.85rem;
        }

        .filter-search-input {
          background: transparent;
          border: none;
          color: var(--text-primary);
          width: 100%;
          font-family: 'Inter', sans-serif;
          font-size: 0.88rem;
        }

        .filter-search-input:focus { outline: none; }

        .category-pills {
          display: flex;
          gap: 0.4rem;
        }

        .cat-pill {
          background: transparent;
          border: 1px solid var(--card-border);
          color: var(--text-muted);
          padding: 0.4rem 0.75rem;
          border-radius: var(--radius-full);
          font-size: 0.78rem;
          font-weight: 600;
          text-transform: capitalize;
          cursor: pointer;
        }

        .cat-pill.active {
          background: rgba(99, 102, 241, 0.2);
          border-color: var(--accent-primary);
          color: #a5b4fc;
        }

        .tasks-grid {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }

        .task-card {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }

        .task-card.completed {
          opacity: 0.6;
        }

        .task-card-header {
          display: flex;
          align-items: flex-start;
          gap: 0.85rem;
        }

        .task-card-title-group {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .task-title {
          font-size: 1rem;
          font-weight: 600;
        }

        .task-title.done {
          text-decoration: line-through;
          color: var(--text-muted);
        }

        .task-desc {
          font-size: 0.82rem;
          color: var(--text-muted);
        }

        .delete-task-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
        }

        .delete-task-btn:hover { color: var(--accent-red); }

        .task-card-footer {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .due-info {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.78rem;
          color: var(--text-muted);
          margin-left: auto;
        }

        .empty-tasks-placeholder {
          padding: 3rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-muted);
        }

        .task-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .task-form textarea {
          background: var(--input-bg);
          border: 1px solid var(--card-border);
          border-radius: var(--radius-sm);
          padding: 0.6rem 0.85rem;
          color: var(--text-primary);
          font-family: 'Inter', sans-serif;
          font-size: 0.9rem;
          resize: vertical;
        }
      `}</style>
    </div>
  );
}
