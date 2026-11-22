import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './features/auth/context/auth.context';
import { WorkspaceProvider } from './features/workspace/context/workspace.context';
import { InvitationProvider } from './features/invitation/context/invitation.context';
import { TeamProvider } from './features/team/context/team.context';
import { ProjectProvider } from './features/project/context/project.context';
import { TaskProvider } from './features/task/context/task.context';
import { CommentProvider } from './features/comment/context/comment.context';
import { router } from './App.routes';

export default function App() {
  return (
    <AuthProvider>
      <WorkspaceProvider>
        <InvitationProvider>
          <TeamProvider>
            <ProjectProvider>
              <TaskProvider>
                <CommentProvider>
                  <RouterProvider router={router} />
                </CommentProvider>
              </TaskProvider>
            </ProjectProvider>
          </TeamProvider>
        </InvitationProvider>
      </WorkspaceProvider>
    </AuthProvider>
  );
}
