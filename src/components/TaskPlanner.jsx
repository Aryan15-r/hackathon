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
  const { tasks, addTask, toggleTask, deleteTask } = useApp();

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

  return (
    <div className="task-planner-page animate-fade-in">
      {/* Header Bar */}
      <div className="planner-header glass-card">
        <div className="header-info">
          <h2>Task & Deadline Planner</h2>
          <p>Organize assignments, lab exams, group projects, and personal deadlines.</p>
        </div>

        <button className="gradient-button" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={18} /> Add New Task
        </button>
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

      {/* Add Task Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content glass-card animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Academic Task</h2>
              <button className="close-btn" onClick={() => setIsAddModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateTask} className="task-form">
              <div className="form-group">
                <label>Task Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Operating Systems Lab 4 Submission"
                  value={newTask.title}
                  onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description / Notes</label>
                <textarea
                  placeholder="Optional details, subtasks, or submission links..."
                  value={newTask.description}
                  onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={newTask.category}
                    onChange={e => setNewTask({ ...newTask, category: e.target.value })}
                  >
                    <option value="assignment">Assignment</option>
                    <option value="exam">Exam</option>
                    <option value="project">Project</option>
                    <option value="college">College Event</option>
                    <option value="personal">Personal</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Due Date</label>
                  <input
                    type="date"
                    value={newTask.due_date}
                    onChange={e => setNewTask({ ...newTask, due_date: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Due Time</label>
                  <input
                    type="time"
                    value={newTask.due_time}
                    onChange={e => setNewTask({ ...newTask, due_time: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="gradient-button">
                  Save Task
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
