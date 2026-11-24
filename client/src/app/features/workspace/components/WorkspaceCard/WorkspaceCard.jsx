import { Building2, Shield, Users, UserPlus } from 'lucide-react';
import './WorkspaceCard.scss';

export default function WorkspaceCard({ workspace, onClick, onInvite }) {
  const role = (workspace.role || 'MEMBER').toUpperCase();
  const memberCount = workspace.member_count ?? workspace.members_count;
  const isOwnerOrAdmin = role === 'OWNER' || role === 'ADMIN';

  return (
    <div className="workspace-card" onClick={onClick}>
      <div className="workspace-card__header">
        <div className="workspace-card__icon-wrapper">
          <Building2 size={20} />
        </div>
        <span className={`workspace-card__role-badge workspace-card__role-badge--${role.toLowerCase()}`}>
          <Shield size={12} />
          <span>{role}</span>
        </span>
      </div>

      <div className="workspace-card__body">
        <h3 className="workspace-card__title">{workspace.name}</h3>
        <p className="workspace-card__description">
          {workspace.description || 'No description provided.'}
        </p>
      </div>

      <div className="workspace-card__footer">
        {memberCount !== undefined ? (
          <span className="workspace-card__members">
            <Users size={14} />
            <span>{memberCount} {memberCount === 1 ? 'member' : 'members'}</span>
          </span>
        ) : (
          <span />
        )}
        {isOwnerOrAdmin && onInvite && (
          <button
            type="button"
            className="workspace-card__invite-btn"
            onClick={(e) => {
              e.stopPropagation();
              onInvite(workspace);
            }}
            title="Invite members to this workspace"
          >
            <UserPlus size={14} />
            <span>Invite</span>
          </button>
        )}
      </div>
    </div>
  );
}
