import { formatInitials } from '@/utils/formatters';
import './WorkloadChart.scss';

export default function WorkloadChart({ data = [] }) {
  if (data.length === 0) {
    return (
      <div className="workload-chart-empty">
        <p>No workload data available.</p>
      </div>
    );
  }

  const maxTasks = Math.max(...data.map((d) => d.task_count || 1), 1);

  return (
    <div className="workload-chart">
      <div className="workload-chart__list">
        {data.map((item, idx) => {
          const count = item.task_count || item.count || 0;
          const completed = item.completed_count || 0;
          const name = item.user_name || item.name || `Member ${idx + 1}`;
          const pct = Math.min(100, Math.round((count / maxTasks) * 100));

          return (
            <div key={item.user_id || idx} className="workload-row">
              <div className="workload-row__user">
                <div className="workload-row__avatar">{formatInitials(name)}</div>
                <span className="workload-row__name">{name}</span>
              </div>

              <div className="workload-row__bar-track">
                <div className="workload-row__bar-fill" style={{ width: `${pct}%` }} />
              </div>

              <span className="workload-row__count">
                {count} {count === 1 ? 'task' : 'tasks'}
                {completed > 0 && ` (${completed} done)`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
