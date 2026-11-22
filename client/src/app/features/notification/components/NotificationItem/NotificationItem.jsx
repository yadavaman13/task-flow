import { CheckSquare, MessageSquare, Mail, FolderKanban, Bell, Check } from 'lucide-react';
import { formatRelativeTime } from '@/utils/formatters';
import './NotificationItem.scss';

export default function NotificationItem({ notification, onMarkRead, onClick }) {
  const isRead = Boolean(notification.is_read);

  const getIcon = () => {
    switch (notification.type) {
      case 'TASK_ASSIGNED':
        return <CheckSquare size={16} />;
      case 'COMMENT_ADDED':
        return <MessageSquare size={16} />;
      case 'WORKSPACE_INVITATION':
        return <Mail size={16} />;
      case 'PROJECT_ADDED':
        return <FolderKanban size={16} />;
      default:
        return <Bell size={16} />;
    }
  };

  return (
    <div
      className={`notification-item ${!isRead ? 'notification-item--unread' : ''}`}
      onClick={onClick}
    >
      <div className="notification-item__icon-wrapper">{getIcon()}</div>

      <div className="notification-item__content">
        <div className="notification-item__header">
          <span className="notification-item__title">{notification.title || 'Notification'}</span>
          <span className="notification-item__time">
            {formatRelativeTime(notification.created_at)}
          </span>
        </div>

        <p className="notification-item__message">{notification.message}</p>
      </div>

      {!isRead && onMarkRead && (
        <button
          className="notification-item__read-btn"
          onClick={(e) => {
            e.stopPropagation();
            onMarkRead(notification.id || notification._id);
          }}
          title="Mark as read"
          aria-label="Mark as read"
        >
          <Check size={14} />
        </button>
      )}
    </div>
  );
}
