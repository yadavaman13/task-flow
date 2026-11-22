import { Link } from 'react-router-dom';
import { Menu, Bell } from 'lucide-react';
import Avatar from '@/components/Shared/Feedback/Avatar/Avatar';
import './TopBar.scss';

export default function TopBar({
  title = 'TaskFlow',
  user,
  unreadCount = 0,
  onMenuToggle,
}) {
  return (
    <header className="topbar">
      <div className="topbar__left">
        <button
          className="topbar__menu-btn"
          onClick={onMenuToggle}
          aria-label="Toggle navigation menu"
        >
          <Menu size={20} />
        </button>
      </div>

      <div className="topbar__right">
        <Link to="/notifications" className="topbar__action-btn" aria-label="Notifications">
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="topbar__badge">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Link>

        <Link to="/settings" className="topbar__profile-link" title="Account settings">
          <Avatar
            src={user?.avatar_url}
            name={user?.name}
            email={user?.email}
            size="sm"
            className="topbar__avatar"
          />
        </Link>
      </div>
    </header>
  );
}
