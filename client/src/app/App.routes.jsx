import React, { Suspense, lazy } from 'react';
import { createBrowserRouter, Navigate, Outlet, useLocation } from 'react-router-dom';
import AuthLayout from '@/layouts/AuthLayout/AuthLayout';
import DashboardLayout from '@/layouts/DashboardLayout/DashboardLayout';
import Spinner from '@/components/Shared/Feedback/Spinner/Spinner';
import { useAuthContext } from './features/auth/context/auth.context';

// Lazy load pages for optimal bundle splitting
const LoginPage = lazy(() => import('./features/auth/pages/LoginPage/LoginPage'));
const RegisterPage = lazy(() => import('./features/auth/pages/RegisterPage/RegisterPage'));
const WorkspaceListPage = lazy(() => import('./features/workspace/pages/WorkspaceListPage/WorkspaceListPage'));
const WorkspaceDetailPage = lazy(() => import('./features/workspace/pages/WorkspaceDetailPage/WorkspaceDetailPage'));
const TeamDetailPage = lazy(() => import('./features/team/pages/TeamDetailPage/TeamDetailPage'));
const ProjectDetailPage = lazy(() => import('./features/project/pages/ProjectDetailPage/ProjectDetailPage'));
const TaskDetailPage = lazy(() => import('./features/task/pages/TaskDetailPage/TaskDetailPage'));
const InvitationsPage = lazy(() => import('./features/invitation/pages/InvitationsPage/InvitationsPage'));
const NotificationsPage = lazy(() => import('./features/notification/pages/NotificationsPage/NotificationsPage'));
const DashboardPage = lazy(() => import('./features/dashboard/pages/DashboardPage/DashboardPage'));
const SettingsPage = lazy(() => import('./features/settings/pages/SettingsPage/SettingsPage'));

function PageSuspense({ children }) {
  return (
    <Suspense
      fallback={
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <Spinner size="lg" />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuthContext();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

function PublicRoute() {
  const { isAuthenticated, loading } = useAuthContext();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/workspaces" replace />;
  }

  return <Outlet />;
}

export const router = createBrowserRouter([
  // Public Auth routes
  {
    element: <PublicRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          {
            path: '/login',
            element: (
              <PageSuspense>
                <LoginPage />
              </PageSuspense>
            ),
          },
          {
            path: '/register',
            element: (
              <PageSuspense>
                <RegisterPage />
              </PageSuspense>
            ),
          },
        ],
      },
    ],
  },

  // Protected App routes
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          {
            path: '/',
            element: <Navigate to="/workspaces" replace />,
          },
          {
            path: '/workspaces',
            element: (
              <PageSuspense>
                <WorkspaceListPage />
              </PageSuspense>
            ),
          },
          {
            path: '/workspaces/:workspaceId',
            element: (
              <PageSuspense>
                <WorkspaceDetailPage />
              </PageSuspense>
            ),
          },
          {
            path: '/workspaces/:workspaceId/teams/:teamId',
            element: (
              <PageSuspense>
                <TeamDetailPage />
              </PageSuspense>
            ),
          },
          {
            path: '/workspaces/:workspaceId/teams/:teamId/projects/:projectId',
            element: (
              <PageSuspense>
                <ProjectDetailPage />
              </PageSuspense>
            ),
          },
          {
            path: '/tasks/:taskId',
            element: (
              <PageSuspense>
                <TaskDetailPage />
              </PageSuspense>
            ),
          },
          {
            path: '/invitations',
            element: (
              <PageSuspense>
                <InvitationsPage />
              </PageSuspense>
            ),
          },
          {
            path: '/notifications',
            element: (
              <PageSuspense>
                <NotificationsPage />
              </PageSuspense>
            ),
          },
          {
            path: '/dashboard/:workspaceId',
            element: (
              <PageSuspense>
                <DashboardPage />
              </PageSuspense>
            ),
          },
          {
            path: '/settings',
            element: (
              <PageSuspense>
                <SettingsPage />
              </PageSuspense>
            ),
          },
        ],
      },
    ],
  },

  // Fallback route
  {
    path: '*',
    element: <Navigate to="/workspaces" replace />,
  },
]);
