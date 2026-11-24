import { Building2, Check, Shield, Clock, X } from 'lucide-react';
import { formatDate } from '@/utils/formatters';
import Button from '@/components/Shared/Buttons/Button/Button';
import './InvitationCard.scss';

export default function InvitationCard({
  invitation,
  onAccept,
  onDecline,
  isSubmitting = false,
}) {
  const workspaceName = invitation.workspace_name || invitation.workspace?.name || 'Workspace';
  const role = invitation.role || 'MEMBER';
  const inviter =
    invitation.invited_by_name ||
    invitation.inviter_name ||
    invitation.inviter?.name ||
    'A team member';
  const expiryDate = invitation.expires_at || invitation.expiresAt;

  return (
    <div className="invitation-card">
      <div className="invitation-card__icon">
        <Building2 size={24} />
      </div>

      <div className="invitation-card__info">
        <div className="invitation-card__header-row">
          <h3 className="invitation-card__workspace">{workspaceName}</h3>
          <span className={`invitation-card__role invitation-card__role--${role.toLowerCase()}`}>
            <Shield size={12} />
            <span>{role}</span>
          </span>
        </div>

        <p className="invitation-card__meta">
          Invited by <strong>{inviter}</strong>
        </p>

        {expiryDate && (
          <div className="invitation-card__expiry">
            <Clock size={12} />
            <span>Expires {formatDate(expiryDate)}</span>
          </div>
        )}
      </div>

      <div className="invitation-card__actions">
        {onDecline && (
          <Button
            variant="ghost"
            size="sm"
            icon={X}
            disabled={isSubmitting}
            onClick={() => onDecline(invitation)}
          >
            Decline
          </Button>
        )}
        <Button
          variant="primary"
          size="sm"
          icon={Check}
          loading={isSubmitting}
          disabled={isSubmitting}
          onClick={() => onAccept(invitation)}
        >
          Accept Invitation
        </Button>
      </div>
    </div>
  );
}
