import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './features/auth/context/auth.context';
import { WorkspaceProvider } from './features/workspace/context/workspace.context';
import { router } from './App.routes';

export default function App() {
  return (
    <AuthProvider>
      <WorkspaceProvider>
        <RouterProvider router={router} />
      </WorkspaceProvider>
    </AuthProvider>
  );
}
