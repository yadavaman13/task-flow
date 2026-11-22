import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './features/auth/context/auth.context';
import { router } from './App.routes';

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
