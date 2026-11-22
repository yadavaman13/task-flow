import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Input from '@/components/Shared/Form/Input/Input';
import Button from '@/components/Shared/Buttons/Button/Button';
import { useAuth } from '../../hooks/useAuth';
import './LoginPage.scss';

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const { handleLogin, isSubmitting } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/workspaces';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const result = await handleLogin(formData);
    if (result.success) {
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="login-page">
      <div className="login-page__header">
        <h2 className="login-page__title">Welcome back</h2>
        <p className="login-page__subtitle">Sign in to your TaskFlow account</p>
      </div>

      <form onSubmit={handleSubmit} className="login-page__form" noValidate>
        <Input
          label="Email address"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          placeholder="Enter your email"
          required
          autoComplete="email"
        />

        <Input
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          placeholder="••••••••"
          required
          autoComplete="current-password"
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={isSubmitting}
          className="login-page__submit"
        >
          Sign In
        </Button>
      </form>

      <div className="login-page__footer">
        <p>
          Don&apos;t have an account?{' '}
          <Link to="/register" className="login-page__link">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
