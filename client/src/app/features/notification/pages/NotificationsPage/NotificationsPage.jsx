import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck } from 'lucide-react';
import Button from '@/components/Shared/Buttons/Button/Button';
import Spinner from '@/components/Shared/Feedback/Spinner/Spinner';
import EmptyState from '@/components/Shared/Feedback/EmptyState/EmptyState';
import NotificationItem from '../../components/NotificationItem/NotificationItem';
import { useNotification } from '../../hooks/useNotification';
import './NotificationsPage.scss';

export default function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    loadNotifications,
    handleMarkAsRead,
    handleMarkAllAsRead,
    loading,
    isSubmitting,
  } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleNotificationClick = (item) => {
    if (!item.is_read) {
      handleMarkAsRead(item.id || item._id);
    }

    if (item.reference_type === 'TASK' && item.reference_id) {
      navigate(`/tasks/${item.reference_id}`);
    } else if (item.reference_type === 'WORKSPACE') {
      navigate('/workspaces');
    }
  };

  return (
    <div className="notifications-page">
      <div className="notifications-page__header">
        <div className="notifications-page__title-group">
          <h1 className="notifications-page__title">Notifications</h1>
          <p className="notifications-page__subtitle">
            Stay updated with task assignments, comments, and workspace invites
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="secondary"
            size="sm"
            icon={CheckCheck}
            onClick={handleMarkAllAsRead}
            loading={isSubmitting}
          >
            Mark all as read
          </Button>
        )}
      </div>

      {loading ? (
        <div className="notifications-page__loading">
          <Spinner size="lg" />
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="All caught up!"
          description="You don't have any notifications right now."
        />
      ) : (
        <div className="notifications-page__list">
          {notifications.map((item) => (
            <NotificationItem
              key={item.id || item._id}
              notification={item}
              onMarkRead={handleMarkAsRead}
              onClick={() => handleNotificationClick(item)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
