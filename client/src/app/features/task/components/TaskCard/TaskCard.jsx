import { Calendar, AlertCircle } from 'lucide-react';
import { formatDate } from '@/utils/formatters';
import TaskStatusBadge from '../TaskStatusBadge/TaskStatusBadge';
import './TaskCard.scss';

export default function TaskCard({ task, onClick }) {
  const priority = task.priority || 'MEDIUM';

  return (
    <div className="task-card" onClick={onClick}>
      <div className="task-card__header">
        <TaskStatusBadge status={task.status} size="sm" />
        <span className={`task-card__priority task-card__priority--${priority.toLowerCase()}`}>
          {priority}
        </span>
      </div>

      <h4 className="task-card__title">{task.title}</h4>
      {task.description && <p className="task-card__desc">{task.description}</p>}

      <div className="task-card__footer">
        {task.due_date && (
          <span className="task-card__due">
            <Calendar size={12} />
            <span>{formatDate(task.due_date)}</span>
          </span>
        )}
      </div>
    </div>
  );
}
