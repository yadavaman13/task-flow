import { RouterProvider } from 'react-router-dom';
import ErrorBoundary from '@/components/Shared/Feedback/ErrorBoundary/ErrorBoundary';
import { AuthProvider, useAuthContext } from './features/auth/context/auth.context';
import { WorkspaceProvider } from './features/workspace/context/workspace.context';
import { InvitationProvider } from './features/invitation/context/invitation.context';
import { TeamProvider } from './features/team/context/team.context';
import { ProjectProvider } from './features/project/context/project.context';
import { TaskProvider } from './features/task/context/task.context';
import { CommentProvider } from './features/comment/context/comment.context';
import { NotificationProvider } from './features/notification/context/notification.context';
import { ActivityProvider } from './features/activity/context/activity.context';
import { DashboardProvider } from './features/dashboard/context/dashboard.context';
import { router } from './App.routes';

function UserScopedProviders({ children }) {
  const { user } = useAuthContext();
  const userId = user?.id || user?._id || 'guest';

  return (
    <WorkspaceProvider key={`workspace-${userId}`}>
      <InvitationProvider key={`invitation-${userId}`}>
        <TeamProvider key={`team-${userId}`}>
          <ProjectProvider key={`project-${userId}`}>
            <TaskProvider key={`task-${userId}`}>
              <CommentProvider key={`comment-${userId}`}>
                <NotificationProvider key={`notification-${userId}`}>
                  <ActivityProvider key={`activity-${userId}`}>
                    <DashboardProvider key={`dashboard-${userId}`}>
                      {children}
                    </DashboardProvider>
                  </ActivityProvider>
                </NotificationProvider>
              </CommentProvider>
            </TaskProvider>
          </ProjectProvider>
        </TeamProvider>
      </InvitationProvider>
    </WorkspaceProvider>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <UserScopedProviders>
          <RouterProvider router={router} />
        </UserScopedProviders>
      </AuthProvider>
    </ErrorBoundary>
  );
}
