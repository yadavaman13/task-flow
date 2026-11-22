import { TASK_STATUS_LABELS } from '@/utils/constants';
import './TaskStatusBadge.scss';

export default function TaskStatusBadge({ status = 'TODO', size = 'md' }) {
  const label = TASK_STATUS_LABELS[status] || status;

  return (
    <span className={`task-status-badge task-status-badge--${status.toLowerCase()} task-status-badge--${size}`}>
      <span className="task-status-badge__dot" />
      <span>{label}</span>
    </span>
  );
}
