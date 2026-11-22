import { NavLink } from 'react-router-dom';
import {
  Building2,
  LayoutDashboard,
  Mail,
  Bell,
  Settings,
  LogOut,
  X,
  CheckSquare,
} from 'lucide-react';
import { formatInitials } from '@/utils/formatters';
import './Sidebar.scss';

export default function Sidebar({
  user,
  currentWorkspace,
  onLogout,
  isOpen = false,
  onClose,
}) {
  const workspaceId = currentWorkspace?._id || currentWorkspace?.id;

  const navLinks = [
    {
      to: '/workspaces',
      label: 'Workspaces',
      icon: Building2,
      end: true,
    },
    ...(workspaceId
      ? [
          {
            to: `/dashboard/${workspaceId}`,
            label: 'Dashboard',
            icon: LayoutDashboard,
          },
        ]
      : []),
    {
      to: '/invitations',
      label: 'Invitations',
      icon: Mail,
    },
    {
      to: '/notifications',
      label: 'Notifications',
      icon: Bell,
    },
    {
      to: '/settings',
      label: 'Settings',
      icon: Settings,
    },
  ];

  return (
    <>
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar__header">
          <div className="sidebar__brand">
            <div className="sidebar__logo-icon">
              <CheckSquare size={20} />
            </div>
            <span className="sidebar__brand-title">TaskFlow</span>
          </div>
          {onClose && (
            <button className="sidebar__close-btn" onClick={onClose} aria-label="Close menu">
              <X size={18} />
            </button>
          )}
        </div>

        {currentWorkspace && (
          <div className="sidebar__workspace">
            <span className="sidebar__workspace-label">Current Workspace</span>
            <div className="sidebar__workspace-card">
              <div className="sidebar__workspace-avatar">
                {formatInitials(currentWorkspace.name || 'W')}
              </div>
              <span className="sidebar__workspace-name" title={currentWorkspace.name}>
                {currentWorkspace.name}
              </span>
            </div>
          </div>
        )}

        <nav className="sidebar__nav">
          <span className="sidebar__nav-heading">Menu</span>
          <ul className="sidebar__nav-list">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    end={link.end}
                    className={({ isActive }) =>
                      `sidebar__nav-link ${isActive ? 'sidebar__nav-link--active' : ''}`
                    }
                    onClick={onClose}
                  >
                    <Icon size={18} className="sidebar__nav-icon" />
                    <span>{link.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="sidebar__footer">
          <div className="sidebar__user">
            <div className="sidebar__user-avatar">
              {formatInitials(user?.name || user?.email || 'User')}
            </div>
            <div className="sidebar__user-info">
              <span className="sidebar__user-name">{user?.name || 'User'}</span>
              <span className="sidebar__user-email">{user?.email || ''}</span>
            </div>
          </div>
          {onLogout && (
            <button
              className="sidebar__logout-btn"
              onClick={onLogout}
              title="Log out"
              aria-label="Log out"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
