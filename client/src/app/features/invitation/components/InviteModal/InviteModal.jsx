import { useState } from 'react';
import Modal from '@/components/Shared/Modals/Modal/Modal';
import Input from '@/components/Shared/Form/Input/Input';
import Select from '@/components/Shared/Form/Select/Select';
import Button from '@/components/Shared/Buttons/Button/Button';
import { WORKSPACE_ROLES } from '@/utils/constants';
import { useInvitation } from '../../hooks/useInvitation';
import './InviteModal.scss';

export default function InviteModal({ isOpen, onClose, workspaceId, onSent }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState(WORKSPACE_ROLES.MEMBER);
  const [error, setError] = useState('');
  const { handleSendInvitation, isSubmitting } = useInvitation();

  const roleOptions = [
    { value: WORKSPACE_ROLES.MEMBER, label: 'Member — can view and edit assigned tasks' },
    { value: WORKSPACE_ROLES.ADMIN, label: 'Admin — can invite members and manage teams' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Enter a valid email address');
      return;
    }

    const res = await handleSendInvitation(workspaceId, { email: email.trim(), role });
    if (res.success) {
      setEmail('');
      setRole(WORKSPACE_ROLES.MEMBER);
      setError('');
      onSent?.(res.data);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Invite Member to Workspace" size="md">
      <form onSubmit={handleSubmit} className="invite-modal">
        <Input
          label="Email address"
          name="email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError('');
          }}
          placeholder="colleague@example.com"
          error={error}
          required
          autoFocus
        />

        <Select
          label="Role"
          name="role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          options={roleOptions}
        />

        <div className="invite-modal__actions">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={isSubmitting}>
            Send Invitation
          </Button>
        </div>
      </form>
    </Modal>
  );
}
