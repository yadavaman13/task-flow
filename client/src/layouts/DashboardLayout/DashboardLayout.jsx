import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar/Sidebar';
import TopBar from './TopBar/TopBar';
import { storage } from '@/utils/storage';
import './DashboardLayout.scss';

export default function DashboardLayout({ user: propUser, currentWorkspace, unreadCount = 0, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = propUser || storage.getUser();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      storage.clear();
      window.location.href = '/login';
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar
        user={user}
        currentWorkspace={currentWorkspace}
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="dashboard-layout__main">
        <TopBar
          user={user}
          unreadCount={unreadCount}
          onMenuToggle={() => setSidebarOpen((prev) => !prev)}
        />
        <main className="dashboard-layout__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
