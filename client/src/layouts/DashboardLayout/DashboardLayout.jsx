import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar/Sidebar';
import TopBar from './TopBar/TopBar';
import { useAuth } from '@/app/features/auth/hooks/useAuth';
import { useNotification } from '@/app/features/notification/hooks/useNotification';
import { useWorkspace } from '@/app/features/workspace/hooks/useWorkspace';
import './DashboardLayout.scss';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, handleLogout } = useAuth();
  const { unreadCount, loadUnreadCount } = useNotification();
  const { selectedWorkspace } = useWorkspace();

  useEffect(() => {
    loadUnreadCount();
  }, [loadUnreadCount]);

  return (
    <div className="dashboard-layout">
      <Sidebar
        user={user}
        currentWorkspace={selectedWorkspace}
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
