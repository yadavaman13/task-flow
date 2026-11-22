import { useState } from 'react';
import Modal from '@/components/Shared/Modals/Modal/Modal';
import Input from '@/components/Shared/Form/Input/Input';
import Textarea from '@/components/Shared/Form/Textarea/Textarea';
import Button from '@/components/Shared/Buttons/Button/Button';
import { useTeam } from '../../hooks/useTeam';
import './CreateTeamModal.scss';

export default function CreateTeamModal({ isOpen, onClose, workspaceId, onCreated }) {
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [error, setError] = useState('');
  const { handleCreateTeam, isSubmitting } = useTeam();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Team name is required');
      return;
    }

    const res = await handleCreateTeam(workspaceId, formData);
    if (res.success) {
      setFormData({ name: '', description: '' });
      setError('');
      onCreated?.(res.data);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Team" size="md">
      <form onSubmit={handleSubmit} className="create-team-modal">
        <Input
          label="Team Name"
          name="name"
          value={formData.name}
          onChange={(e) => {
            setFormData((p) => ({ ...p, name: e.target.value }));
            if (error) setError('');
          }}
          placeholder="e.g. Backend Dev Team, Design System"
          error={error}
          required
          autoFocus
        />

        <Textarea
          label="Description (optional)"
          name="description"
          value={formData.description}
          onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
          placeholder="What does this team do?"
          rows={3}
        />

        <div className="create-team-modal__actions">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={isSubmitting}>
            Create Team
          </Button>
        </div>
      </form>
    </Modal>
  );
}
