import './StatCard.scss';

export default function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendPositive = true,
  subtitle,
}) {
  return (
    <div className="stat-card">
      <div className="stat-card__header">
        <span className="stat-card__title">{title}</span>
        {Icon && (
          <div className="stat-card__icon-wrapper">
            <Icon size={18} />
          </div>
        )}
      </div>

      <div className="stat-card__body">
        <span className="stat-card__value">{value ?? 0}</span>
        {(trend !== undefined || subtitle) && (
          <div className="stat-card__footer">
            {trend !== undefined && (
              <span
                className={`stat-card__trend ${
                  trendPositive ? 'stat-card__trend--positive' : 'stat-card__trend--negative'
                }`}
              >
                {trend}
              </span>
            )}
            {subtitle && <span className="stat-card__subtitle">{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
