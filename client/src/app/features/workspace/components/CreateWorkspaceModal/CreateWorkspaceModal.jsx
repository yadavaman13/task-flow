import { useState } from 'react';
import Modal from '@/components/Shared/Modals/Modal/Modal';
import Input from '@/components/Shared/Form/Input/Input';
import Textarea from '@/components/Shared/Form/Textarea/Textarea';
import Button from '@/components/Shared/Buttons/Button/Button';
import { useWorkspace } from '../../hooks/useWorkspace';
import './CreateWorkspaceModal.scss';

export default function CreateWorkspaceModal({ isOpen, onClose, onCreated }) {
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [error, setError] = useState('');
  const { handleCreateWorkspace, isSubmitting } = useWorkspace();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Workspace name is required');
      return;
    }

    const res = await handleCreateWorkspace(formData);
    if (res.success) {
      setFormData({ name: '', description: '' });
      setError('');
      onCreated?.(res.data);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Workspace" size="md">
      <form onSubmit={handleSubmit} className="create-workspace-modal">
        <Input
          label="Workspace Name"
          name="name"
          value={formData.name}
          onChange={(e) => {
            setFormData((p) => ({ ...p, name: e.target.value }));
            if (error) setError('');
          }}
          placeholder="e.g. Engineering, Marketing, Operations"
          error={error}
          required
          autoFocus
        />

        <Textarea
          label="Description (optional)"
          name="description"
          value={formData.description}
          onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
          placeholder="What is this workspace for?"
          rows={3}
        />

        <div className="create-workspace-modal__actions">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={isSubmitting}>
            Create Workspace
          </Button>
        </div>
      </form>
    </Modal>
  );
}
