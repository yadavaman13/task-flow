import { FolderKanban, Lock, Users, Shield } from 'lucide-react';
import './ProjectCard.scss';

export default function ProjectCard({ project, onClick }) {
  const status = project.status || 'ACTIVE';
  const isPrivate = project.visibility === 'PRIVATE';

  return (
    <div className={`project-card project-card--${status.toLowerCase()}`} onClick={onClick}>
      <div className="project-card__header">
        <div className="project-card__icon">
          <FolderKanban size={18} />
        </div>
        <div className="project-card__badges">
          {isPrivate && (
            <span className="project-card__badge project-card__badge--private" title="Private to assigned members">
              <Lock size={12} />
              <span>Private</span>
            </span>
          )}
          <span className={`project-card__badge project-card__badge--${status.toLowerCase()}`}>
            {status}
          </span>
        </div>
      </div>

      <div className="project-card__body">
        <h3 className="project-card__name">{project.name}</h3>
        <p className="project-card__desc">{project.description || 'No description provided.'}</p>
      </div>

      <div className="project-card__footer">
        {project.task_count !== undefined && (
          <span className="project-card__meta">
            <span>{project.task_count} {project.task_count === 1 ? 'task' : 'tasks'}</span>
          </span>
        )}
        {project.role && (
          <span className="project-card__role">
            <Shield size={12} />
            <span>{project.role}</span>
          </span>
        )}
      </div>
    </div>
  );
}
