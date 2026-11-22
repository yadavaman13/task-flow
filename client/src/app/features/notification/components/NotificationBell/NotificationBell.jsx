import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import './NotificationBell.scss';

export default function NotificationBell({ unreadCount = 0 }) {
  return (
    <Link to="/notifications" className="notification-bell" aria-label="Notifications">
      <Bell size={18} />
      {unreadCount > 0 && (
        <span className="notification-bell__badge">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Link>
  );
}
