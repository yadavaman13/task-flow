import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail } from 'lucide-react';
import Spinner from '@/components/Shared/Feedback/Spinner/Spinner';
import EmptyState from '@/components/Shared/Feedback/EmptyState/EmptyState';
import InvitationCard from '../../components/InvitationCard/InvitationCard';
import { useInvitation } from '../../hooks/useInvitation';
import './InvitationsPage.scss';

export default function InvitationsPage() {
  const {
    pendingInvitations,
    loadPendingInvitations,
    handleAcceptInvitation,
    handleDeclineInvitation,
    loading,
    isSubmitting,
  } = useInvitation();
  const navigate = useNavigate();

  useEffect(() => {
    loadPendingInvitations();
  }, [loadPendingInvitations]);

  const onAccept = async (invitation) => {
    const res = await handleAcceptInvitation(invitation);
    if (res.success) {
      navigate('/workspaces');
    }
  };

  const onDecline = async (invitation) => {
    await handleDeclineInvitation(invitation);
  };

  return (
    <div className="invitations-page">
      <div className="invitations-page__header">
        <h1 className="invitations-page__title">Pending Invitations</h1>
        <p className="invitations-page__subtitle">
          Workspaces you have been invited to join
        </p>
      </div>

      {loading ? (
        <div className="invitations-page__loading">
          <Spinner size="lg" />
        </div>
      ) : pendingInvitations.length === 0 ? (
        <EmptyState
          icon={Mail}
          title="No pending invitations"
          description="When someone invites you to join their workspace, the invitation will appear here."
        />
      ) : (
        <div className="invitations-page__list">
          {pendingInvitations.map((inv) => (
            <InvitationCard
              key={inv.id || inv._id || inv.token}
              invitation={inv}
              onAccept={onAccept}
              onDecline={onDecline}
              isSubmitting={isSubmitting}
            />
          ))}
        </div>
      )}
    </div>
  );
}
