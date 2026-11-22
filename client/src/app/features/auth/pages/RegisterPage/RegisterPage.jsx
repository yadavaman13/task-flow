import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '@/components/Shared/Form/Input/Input';
import Button from '@/components/Shared/Buttons/Button/Button';
import { useAuth } from '../../hooks/useAuth';
import OtpVerification from '../../components/OtpVerification/OtpVerification';
import './RegisterPage.scss';


export default function RegisterPage() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showOtpModal, setShowOtpModal] = useState(false);
  const { handleRegister, handleSendOtp, isSubmitting } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const result = await handleRegister(formData);
    if (result.success) {
      // Prompt user for OTP verification or redirect to login
      const {email} = formData;
      handleSendOtp(email);
      setShowOtpModal(true);
    }
  };

  return (
    <div className="register-page">
      <div className="register-page__header">
        <h2 className="register-page__title">Create an account</h2>
        <p className="register-page__subtitle">Get started with TaskFlow in seconds</p>
      </div>

      <form onSubmit={handleSubmit} className="register-page__form" noValidate>
        <Input
          label="Full Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          placeholder="Enter your name"
          required
          autoComplete="name"
        />

        <Input
          label="Email address"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          placeholder="Enter your email address"
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
          placeholder="At least 8 characters"
          required
          autoComplete="new-password"
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={isSubmitting}
          className="register-page__submit"
        >
          Create Account
        </Button>
      </form>

      <div className="register-page__footer">
        <p>
          Already have an account?{' '}
          <Link to="/login" className="register-page__link">
            Sign in
          </Link>
        </p>
      </div>

      <OtpVerification
        isOpen={showOtpModal}
        onClose={() => {
          setShowOtpModal(false);
          navigate('/login');
        }}
        email={formData.email}
        onSuccess={() => {
          navigate('/login');
        }}
      />
    </div>
  );
}
