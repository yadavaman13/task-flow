import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './features/auth/context/auth.context';
import { WorkspaceProvider } from './features/workspace/context/workspace.context';
import { InvitationProvider } from './features/invitation/context/invitation.context';
import { router } from './App.routes';

export default function App() {
  return (
    <AuthProvider>
      <WorkspaceProvider>
        <InvitationProvider>
          <RouterProvider router={router} />
        </InvitationProvider>
      </WorkspaceProvider>
    </AuthProvider>
  );
}
