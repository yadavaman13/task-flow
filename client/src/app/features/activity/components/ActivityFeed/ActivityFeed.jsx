import { Activity, CheckSquare, FolderKanban, Users, Building2 } from 'lucide-react';
import { formatInitials, formatRelativeTime } from '@/utils/formatters';
import Spinner from '@/components/Shared/Feedback/Spinner/Spinner';
import './ActivityFeed.scss';

export default function ActivityFeed({ activities = [], loading = false }) {
  if (loading && activities.length === 0) {
    return (
      <div className="activity-feed__loading">
        <Spinner size="md" />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="activity-feed__empty">
        <Activity size={24} className="activity-feed__empty-icon" />
        <p>No recent activity recorded yet.</p>
      </div>
    );
  }

  const getActionIcon = (action) => {
    if (action.includes('TASK')) return <CheckSquare size={14} />;
    if (action.includes('PROJECT')) return <FolderKanban size={14} />;
    if (action.includes('TEAM')) return <Users size={14} />;
    return <Building2 size={14} />;
  };

  const formatActionMessage = (act) => {
    const actor = act.actor_name || 'A team member';
    const action = act.action || '';
    const meta = act.metadata || {};

    if (action === 'TASK_CREATED') {
      return (
        <span>
          <strong>{actor}</strong> created task <em>&ldquo;{meta.title || 'Untitled'}&rdquo;</em>
        </span>
      );
    }
    if (action === 'PROJECT_CREATED') {
      return (
        <span>
          <strong>{actor}</strong> created project <em>&ldquo;{meta.project_name || 'Project'}&rdquo;</em>
        </span>
      );
    }
    if (action === 'TEAM_CREATED') {
      return (
        <span>
          <strong>{actor}</strong> created team <em>&ldquo;{meta.team_name || 'Team'}&rdquo;</em>
        </span>
      );
    }
    if (action === 'WORKSPACE_CREATED') {
      return (
        <span>
          <strong>{actor}</strong> created workspace <em>&ldquo;{meta.workspace_name || 'Workspace'}&rdquo;</em>
        </span>
      );
    }

    return (
      <span>
        <strong>{actor}</strong> performed {action.toLowerCase().replace(/_/g, ' ')}
      </span>
    );
  };

  return (
    <div className="activity-feed">
      <div className="activity-timeline">
        {activities.map((act) => {
          const actId = act.id || act._id;
          return (
            <div key={actId} className="activity-item">
              <div className="activity-item__avatar">
                {formatInitials(act.actor_name || 'User')}
              </div>

              <div className="activity-item__content">
                <div className="activity-item__text">{formatActionMessage(act)}</div>
                <div className="activity-item__footer">
                  <span className="activity-item__icon-tag">{getActionIcon(act.action)}</span>
                  <span className="activity-item__time">{formatRelativeTime(act.created_at)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
