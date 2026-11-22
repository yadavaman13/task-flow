import { Users, Shield, Archive } from 'lucide-react';
import './TeamCard.scss';

export default function TeamCard({ team, onClick }) {
  const memberCount = team.member_count ?? team.members_count;
  const isArchived = Boolean(team.is_archived);

  return (
    <div className={`team-card ${isArchived ? 'team-card--archived' : ''}`} onClick={onClick}>
      <div className="team-card__header">
        <div className="team-card__icon">
          <Users size={20} />
        </div>
        {isArchived ? (
          <span className="team-card__archived-badge">
            <Archive size={12} />
            <span>Archived</span>
          </span>
        ) : team.role ? (
          <span className="team-card__role-badge">
            <Shield size={12} />
            <span>{team.role}</span>
          </span>
        ) : null}
      </div>

      <div className="team-card__body">
        <h3 className="team-card__name">{team.name}</h3>
        <p className="team-card__desc">{team.description || 'No description provided.'}</p>
      </div>

      <div className="team-card__footer">
        {memberCount !== undefined && (
          <span className="team-card__member-count">
            <Users size={14} />
            <span>{memberCount} {memberCount === 1 ? 'member' : 'members'}</span>
          </span>
        )}
      </div>
    </div>
  );
}
