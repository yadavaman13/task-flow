import { TrendingUp, TrendingDown } from 'lucide-react';
import './InfoCard.scss';

export default function InfoCard({
  title,
  value,
  icon: Icon,
  trend,
  trendPositive = true,
  description,
  onClick,
  className = '',
}) {
  return (
    <div
      className={`info-card ${onClick ? 'info-card--clickable' : ''} ${className}`}
      onClick={onClick}
    >
      <div className="info-card__header">
        <span className="info-card__title">{title}</span>
        {Icon && (
          <div className="info-card__icon-wrap">
            <Icon size={18} />
          </div>
        )}
      </div>

      <div className="info-card__body">
        <h3 className="info-card__value">{value ?? '—'}</h3>

        {(trend !== undefined && trend !== null) || description ? (
          <div className="info-card__footer">
            {trend !== undefined && trend !== null && (
              <span
                className={`info-card__trend ${
                  trendPositive ? 'info-card__trend--positive' : 'info-card__trend--negative'
                }`}
              >
                {trendPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                <span>{trend}</span>
              </span>
            )}
            {description && <span className="info-card__description">{description}</span>}
          </div>
        ) : null}
      </div>
    </div>
  );
}
