import { Outlet, Link } from 'react-router-dom';
import { CheckSquare } from 'lucide-react';
import './AuthLayout.scss';

export default function AuthLayout() {
  return (
    <div className="auth-layout">
      <div className="auth-layout__container">
        <div className="auth-layout__brand">
          <Link to="/" className="auth-layout__logo">
            <div className="auth-layout__logo-icon">
              <CheckSquare size={22} />
            </div>
            <span className="auth-layout__logo-text">TaskFlow</span>
          </Link>
          <p className="auth-layout__subtitle">Manage teams, projects, and tasks with ease</p>
        </div>

        <div className="auth-layout__card">
          <Outlet />
        </div>

        <div className="auth-layout__footer">
          <p>&copy; {new Date().getFullYear()} TaskFlow. Minimalist Project Management.</p>
        </div>
      </div>
    </div>
  );
}
