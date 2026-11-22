import { useState } from 'react';
import Modal from '@/components/Shared/Modals/Modal/Modal';
import Input from '@/components/Shared/Form/Input/Input';
import Textarea from '@/components/Shared/Form/Textarea/Textarea';
import Select from '@/components/Shared/Form/Select/Select';
import Button from '@/components/Shared/Buttons/Button/Button';
import { TASK_PRIORITIES } from '@/utils/constants';
import { useTask } from '../../hooks/useTask';
import './CreateTaskModal.scss';

export default function CreateTaskModal({ isOpen, onClose, projectId, onCreated }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: TASK_PRIORITIES.MEDIUM,
    dueDate: '',
  });
  const [error, setError] = useState('');
  const { handleCreateTask, isSubmitting } = useTask();

  const priorityOptions = [
    { value: TASK_PRIORITIES.LOW, label: 'Low' },
    { value: TASK_PRIORITIES.MEDIUM, label: 'Medium' },
    { value: TASK_PRIORITIES.HIGH, label: 'High' },
    { value: TASK_PRIORITIES.URGENT, label: 'Urgent' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Task title is required');
      return;
    }

    const payload = {
      title: formData.title.trim(),
      description: formData.description,
      priority: formData.priority,
      ...(formData.dueDate ? { dueDate: formData.dueDate } : {}),
    };

    const res = await handleCreateTask(projectId, payload);
    if (res.success) {
      setFormData({
        title: '',
        description: '',
        priority: TASK_PRIORITIES.MEDIUM,
        dueDate: '',
      });
      setError('');
      onCreated?.(res.data);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Task" size="md">
      <form onSubmit={handleSubmit} className="create-task-modal">
        <Input
          label="Title"
          name="title"
          value={formData.title}
          onChange={(e) => {
            setFormData((p) => ({ ...p, title: e.target.value }));
            if (error) setError('');
          }}
          placeholder="e.g. Implement Login Route, Add Jest Tests"
          error={error}
          required
          autoFocus
        />

        <Textarea
          label="Description (optional)"
          name="description"
          value={formData.description}
          onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
          placeholder="Task details and acceptance criteria..."
          rows={3}
        />

        <Select
          label="Priority"
          name="priority"
          value={formData.priority}
          onChange={(e) => setFormData((p) => ({ ...p, priority: e.target.value }))}
          options={priorityOptions}
        />

        <Input
          label="Due Date (optional)"
          name="dueDate"
          type="date"
          value={formData.dueDate}
          onChange={(e) => setFormData((p) => ({ ...p, dueDate: e.target.value }))}
        />

        <div className="create-task-modal__actions">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={isSubmitting}>
            Create Task
          </Button>
        </div>
      </form>
    </Modal>
  );
}
