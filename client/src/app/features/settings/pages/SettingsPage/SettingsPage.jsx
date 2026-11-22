import { useState, useEffect } from 'react';
import { User, Shield, Key, Mail, CheckCircle, AlertTriangle } from 'lucide-react';
import Input from '@/components/Shared/Form/Input/Input';
import Button from '@/components/Shared/Buttons/Button/Button';
import { formatInitials, formatDate } from '@/utils/formatters';
import { useAuth } from '@/app/features/auth/hooks/useAuth';
import './SettingsPage.scss';

export default function SettingsPage() {
  const {
    user,
    handleUpdateProfile,
    handleChangePassword,
    isSubmitting,
  } = useAuth();

  const [profileForm, setProfileForm] = useState({
    name: '',
    avatar_url: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        avatar_url: user.avatar_url || '',
      });
    }
  }, [user]);

  const onSaveProfile = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim()) return;
    await handleUpdateProfile({
      name: profileForm.name.trim(),
      ...(profileForm.avatar_url ? { avatar_url: profileForm.avatar_url.trim() } : {}),
    });
  };

  const onChangePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (!passwordForm.currentPassword) {
      setPasswordError('Current password is required');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    const res = await handleChangePassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });

    if (res.success) {
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-page__header">
        <h1 className="settings-page__title">Account Settings</h1>
        <p className="settings-page__subtitle">
          Manage your personal profile details, authentication, and security preferences
        </p>
      </div>

      <div className="settings-page__grid">
        {/* Profile Card */}
        <div className="settings-card">
          <div className="settings-card__header">
            <User size={18} />
            <h3>Personal Information</h3>
          </div>

          <div className="settings-card__avatar-preview">
            <div className="settings-card__avatar">
              {formatInitials(profileForm.name || user?.email || 'User')}
            </div>
            <div className="settings-card__avatar-info">
              <span className="settings-card__user-email">{user?.email}</span>
              <span className="settings-card__verified-badge">
                {user?.is_verified ? (
                  <>
                    <CheckCircle size={12} /> Verified Account
                  </>
                ) : (
                  <>
                    <AlertTriangle size={12} /> Unverified Email
                  </>
                )}
              </span>
            </div>
          </div>

          <form onSubmit={onSaveProfile} className="settings-card__form">
            <Input
              label="Full Name"
              name="name"
              value={profileForm.name}
              onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
              required
            />

            <Input
              label="Avatar URL (optional)"
              name="avatar_url"
              value={profileForm.avatar_url}
              onChange={(e) => setProfileForm((p) => ({ ...p, avatar_url: e.target.value }))}
              placeholder="https://..."
            />

            <div className="settings-card__actions">
              <Button type="submit" variant="primary" loading={isSubmitting}>
                Save Profile
              </Button>
            </div>
          </form>
        </div>

        {/* Security Card */}
        <div className="settings-card">
          <div className="settings-card__header">
            <Key size={18} />
            <h3>Security & Password</h3>
          </div>

          <form onSubmit={onChangePasswordSubmit} className="settings-card__form">
            <Input
              label="Current Password"
              name="currentPassword"
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
              placeholder="••••••••"
              required
            />

            <Input
              label="New Password"
              name="newPassword"
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
              placeholder="At least 8 characters"
              required
            />

            <Input
              label="Confirm New Password"
              name="confirmPassword"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
              placeholder="••••••••"
              required
            />

            {passwordError && (
              <span className="settings-card__error">{passwordError}</span>
            )}

            <div className="settings-card__actions">
              <Button type="submit" variant="primary" loading={isSubmitting}>
                Update Password
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Account Info Footer */}
      <div className="settings-page__info-footer">
        <span>Account Created: <strong>{formatDate(user?.created_at)}</strong></span>
        <span>User ID: <strong>#{user?.id || '—'}</strong></span>
      </div>
    </div>
  );
}
