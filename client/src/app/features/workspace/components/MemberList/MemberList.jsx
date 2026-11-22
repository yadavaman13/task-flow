import { Shield, Trash2 } from 'lucide-react';
import { formatInitials, formatDate } from '@/utils/formatters';
import { WORKSPACE_ROLES } from '@/utils/constants';
import Button from '@/components/Shared/Buttons/Button/Button';
import './MemberList.scss';

export default function MemberList({
  members = [],
  currentRole = 'MEMBER',
  currentUserId,
  onUpdateRole,
  onRemoveMember,
}) {
  const isOwnerOrAdmin = currentRole === WORKSPACE_ROLES.OWNER || currentRole === WORKSPACE_ROLES.ADMIN;

  const roleOptions = [
    { value: WORKSPACE_ROLES.MEMBER, label: 'Member' },
    { value: WORKSPACE_ROLES.ADMIN, label: 'Admin' },
  ];

  return (
    <div className="member-list">
      <div className="member-list__wrapper">
        <table className="member-table">
          <thead>
            <tr>
              <th>Member</th>
              <th>Role</th>
              <th>Joined</th>
              {isOwnerOrAdmin && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {members.map((member) => {
              const memberId = member.id || member.user_id;
              const isSelf = memberId === currentUserId;
              const isOwner = member.role === WORKSPACE_ROLES.OWNER;
              const canEditThisMember = isOwnerOrAdmin && !isOwner && !isSelf;

              return (
                <tr key={memberId} className="member-table__row">
                  <td className="member-table__user-cell">
                    <div className="member-avatar">
                      {formatInitials(member.name || member.email)}
                    </div>
                    <div className="member-details">
                      <span className="member-name">
                        {member.name || 'Anonymous User'}
                        {isSelf && <span className="member-self-badge">(You)</span>}
                      </span>
                      <span className="member-email">{member.email}</span>
                    </div>
                  </td>

                  <td>
                    {canEditThisMember && onUpdateRole ? (
                      <select
                        value={member.role}
                        onChange={(e) => onUpdateRole(memberId, e.target.value)}
                        className="member-role-select"
                      >
                        {roleOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className={`member-role-badge member-role-badge--${member.role?.toLowerCase()}`}>
                        <Shield size={12} />
                        <span>{member.role}</span>
                      </span>
                    )}
                  </td>

                  <td className="member-joined">
                    {formatDate(member.joined_at || member.created_at)}
                  </td>

                  {isOwnerOrAdmin && (
                    <td className="member-actions">
                      {canEditThisMember && onRemoveMember && (
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Trash2}
                          onClick={() => onRemoveMember(memberId)}
                          title="Remove member"
                          className="member-remove-btn"
                        />
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
