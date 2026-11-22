import { formatDate } from '@/utils/formatters';
import { TASK_STATUSES } from '@/utils/constants';
import TaskStatusBadge from '../TaskStatusBadge/TaskStatusBadge';
import './TaskTable.scss';

export default function TaskTable({ tasks = [], onRowClick, onStatusChange }) {
  const statusOptions = Object.values(TASK_STATUSES);

  return (
    <div className="task-table-container">
      <table className="task-table">
        <thead>
          <tr>
            <th>Task</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Due Date</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => {
            const taskId = task.id || task._id;
            const priority = task.priority || 'MEDIUM';

            return (
              <tr
                key={taskId}
                className="task-table__row"
                onClick={() => onRowClick?.(task)}
              >
                <td className="task-table__title-cell">
                  <span className="task-table__title">{task.title}</span>
                  {task.description && (
                    <span className="task-table__desc-preview">{task.description}</span>
                  )}
                </td>

                <td onClick={(e) => e.stopPropagation()}>
                  {onStatusChange ? (
                    <select
                      value={task.status || 'TODO'}
                      onChange={(e) => onStatusChange(taskId, e.target.value)}
                      className="task-status-select"
                    >
                      {statusOptions.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <TaskStatusBadge status={task.status} size="sm" />
                  )}
                </td>

                <td>
                  <span className={`task-priority-tag task-priority-tag--${priority.toLowerCase()}`}>
                    {priority}
                  </span>
                </td>

                <td className="task-table__due-cell">
                  {formatDate(task.due_date)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
