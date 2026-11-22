import './EmptyState.scss';

export default function EmptyState({
  icon: Icon,
  title = 'No items found',
  description,
  action,
  className = '',
}) {
  return (
    <div className={`empty-state ${className}`}>
      {Icon && (
        <div className="empty-state__icon-wrapper">
          <Icon className="empty-state__icon" size={24} />
        </div>
      )}
      <h4 className="empty-state__title">{title}</h4>
      {description && <p className="empty-state__description">{description}</p>}
      {action && <div className="empty-state__action">{action}</div>}
    </div>
  );
}
