import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Calendar, CheckSquare, MessageSquare } from 'lucide-react';
import Button from '@/components/Shared/Buttons/Button/Button';
import Input from '@/components/Shared/Form/Input/Input';
import Textarea from '@/components/Shared/Form/Textarea/Textarea';
import Select from '@/components/Shared/Form/Select/Select';
import Spinner from '@/components/Shared/Feedback/Spinner/Spinner';
import TaskStatusBadge from '../../components/TaskStatusBadge/TaskStatusBadge';
import { TASK_STATUSES, TASK_PRIORITIES } from '@/utils/constants';
import { formatDate } from '@/utils/formatters';
import { useTask } from '../../hooks/useTask';
import './TaskDetailPage.scss';

export default function TaskDetailPage() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const {
    selectedTask,
    loading,
    loadTask,
    handleUpdateTask,
    handleUpdateTaskStatus,
    handleDeleteTask,
    isSubmitting,
  } = useTask();

  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    status: 'TODO',
  });

  const loadData = useCallback(() => {
    if (taskId) {
      loadTask(taskId);
    }
  }, [taskId, loadTask]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (selectedTask) {
      setEditForm({
        title: selectedTask.title || '',
        description: selectedTask.description || '',
        priority: selectedTask.priority || 'MEDIUM',
        status: selectedTask.status || 'TODO',
      });
    }
  }, [selectedTask]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editForm.title.trim()) return;
    await handleUpdateTask(taskId, {
      title: editForm.title,
      description: editForm.description,
      priority: editForm.priority,
    });
  };

  const handleStatusChange = async (newStatus) => {
    setEditForm((prev) => ({ ...prev, status: newStatus }));
    await handleUpdateTaskStatus(taskId, newStatus);
  };

  const onDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      const res = await handleDeleteTask(taskId);
      if (res.success) {
        navigate(-1);
      }
    }
  };

  if (loading && !selectedTask) {
    return (
      <div className="task-detail-page__loading">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!selectedTask) {
    return (
      <div className="task-detail-page__not-found">
        <p>Task not found.</p>
        <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </div>
    );
  }

  const statusOptions = Object.values(TASK_STATUSES).map((st) => ({
    value: st,
    label: st,
  }));

  const priorityOptions = Object.values(TASK_PRIORITIES).map((pr) => ({
    value: pr,
    label: pr,
  }));

  return (
    <div className="task-detail-page">
      <div className="task-detail-page__nav">
        <button className="task-detail-page__back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} />
          <span>Back to Project</span>
        </button>
      </div>

      <div className="task-detail-header">
        <div className="task-detail-header__main">
          <div className="task-detail-header__icon">
            <CheckSquare size={22} />
          </div>
          <div className="task-detail-header__info">
            <div className="task-detail-header__title-row">
              <h1 className="task-detail-header__title">{selectedTask.title}</h1>
              <TaskStatusBadge status={editForm.status} />
            </div>
            {selectedTask.due_date && (
              <span className="task-detail-header__due">
                <Calendar size={14} />
                <span>Due {formatDate(selectedTask.due_date)}</span>
              </span>
            )}
          </div>
        </div>

        <div className="task-detail-header__actions">
          <Button
            variant="danger"
            size="sm"
            icon={Trash2}
            onClick={onDelete}
          >
            Delete Task
          </Button>
        </div>
      </div>

      <div className="task-detail-layout">
        <div className="task-detail-layout__main">
          <form onSubmit={handleSave} className="task-edit-form">
            <Input
              label="Title"
              name="title"
              value={editForm.title}
              onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))}
              required
            />

            <Textarea
              label="Description"
              name="description"
              value={editForm.description}
              onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
              rows={5}
            />

            <div className="task-edit-form__actions">
              <Button type="submit" variant="primary" loading={isSubmitting}>
                Save Changes
              </Button>
            </div>
          </form>

          {/* Comments section is mounted here in Task 12 */}
          <div id="task-comments-root" />
        </div>

        <div className="task-detail-layout__sidebar">
          <div className="task-sidebar-card">
            <h4>Task Properties</h4>

            <div className="task-sidebar-field">
              <label>Status</label>
              <Select
                name="status"
                value={editForm.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                options={statusOptions}
              />
            </div>

            <div className="task-sidebar-field">
              <label>Priority</label>
              <Select
                name="priority"
                value={editForm.priority}
                onChange={(e) => {
                  setEditForm((p) => ({ ...p, priority: e.target.value }));
                  handleUpdateTask(taskId, { priority: e.target.value });
                }}
                options={priorityOptions}
              />
            </div>

            <div className="task-sidebar-meta">
              <div className="task-meta-row">
                <span>Created:</span>
                <strong>{formatDate(selectedTask.created_at)}</strong>
              </div>
              {selectedTask.due_date && (
                <div className="task-meta-row">
                  <span>Due Date:</span>
                  <strong>{formatDate(selectedTask.due_date)}</strong>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
