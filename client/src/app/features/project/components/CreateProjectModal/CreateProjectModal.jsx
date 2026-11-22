import { useState } from 'react';
import Modal from '@/components/Shared/Modals/Modal/Modal';
import Input from '@/components/Shared/Form/Input/Input';
import Textarea from '@/components/Shared/Form/Textarea/Textarea';
import Select from '@/components/Shared/Form/Select/Select';
import Button from '@/components/Shared/Buttons/Button/Button';
import { PROJECT_VISIBILITY, PROJECT_STATUSES } from '@/utils/constants';
import { useProject } from '../../hooks/useProject';
import './CreateProjectModal.scss';

export default function CreateProjectModal({ isOpen, onClose, teamId, onCreated }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    visibility: PROJECT_VISIBILITY.TEAM,
    status: PROJECT_STATUSES.ACTIVE,
  });
  const [error, setError] = useState('');
  const { handleCreateProject, isSubmitting } = useProject();

  const visibilityOptions = [
    { value: PROJECT_VISIBILITY.TEAM, label: 'Team — visible to all team members' },
    { value: PROJECT_VISIBILITY.PRIVATE, label: 'Private — visible only to assigned project members' },
  ];

  const statusOptions = [
    { value: PROJECT_STATUSES.ACTIVE, label: 'Active' },
    { value: PROJECT_STATUSES.PLANNING, label: 'Planning' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Project name is required');
      return;
    }

    const res = await handleCreateProject(teamId, formData);
    if (res.success) {
      setFormData({
        name: '',
        description: '',
        visibility: PROJECT_VISIBILITY.TEAM,
        status: PROJECT_STATUSES.ACTIVE,
      });
      setError('');
      onCreated?.(res.data);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Project" size="md">
      <form onSubmit={handleSubmit} className="create-project-modal">
        <Input
          label="Project Name"
          name="name"
          value={formData.name}
          onChange={(e) => {
            setFormData((p) => ({ ...p, name: e.target.value }));
            if (error) setError('');
          }}
          placeholder="e.g. Website Redesign, Q4 Deliverables"
          error={error}
          required
          autoFocus
        />

        <Textarea
          label="Description (optional)"
          name="description"
          value={formData.description}
          onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
          placeholder="What is the scope of this project?"
          rows={3}
        />

        <Select
          label="Visibility"
          name="visibility"
          value={formData.visibility}
          onChange={(e) => setFormData((p) => ({ ...p, visibility: e.target.value }))}
          options={visibilityOptions}
        />

        <Select
          label="Initial Status"
          name="status"
          value={formData.status}
          onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value }))}
          options={statusOptions}
        />

        <div className="create-project-modal__actions">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={isSubmitting}>
            Create Project
          </Button>
        </div>
      </form>
    </Modal>
  );
}
