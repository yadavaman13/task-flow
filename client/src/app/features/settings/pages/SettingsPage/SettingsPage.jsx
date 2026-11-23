import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { User, Shield, Key, Mail, CheckCircle, AlertTriangle, Camera, Upload } from 'lucide-react';
import Input from '@/components/Shared/Form/Input/Input';
import Button from '@/components/Shared/Buttons/Button/Button';
import Avatar from '@/components/Shared/Feedback/Avatar/Avatar';
import Spinner from '@/components/Shared/Feedback/Spinner/Spinner';
import { formatInitials, formatDate } from '@/utils/formatters';
import { useAuth } from '@/app/features/auth/hooks/useAuth';
import './SettingsPage.scss';

export default function SettingsPage() {
  const {
    user,
    handleUpdateProfile,
    handleUploadAvatar,
    handleChangePassword,
    isSubmitting,
  } = useAuth();

  const fileInputRef = useRef(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

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

  const onFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (PNG, JPG, WEBP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const res = await handleUploadAvatar(file);
      if (res.success && res.data?.avatar_url) {
        setProfileForm((prev) => ({
          ...prev,
          avatar_url: res.data.avatar_url,
        }));
      }
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const onSaveProfile = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim()) return;
    await handleUpdateProfile({
      name: profileForm.name.trim(),
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
            <div className="settings-card__avatar-wrapper">
              <Avatar
                src={profileForm.avatar_url || user?.avatar_url}
                name={profileForm.name || user?.name}
                email={user?.email}
                size="2xl"
                className="settings-card__avatar"
              />
              <button
                type="button"
                className="settings-card__avatar-upload-badge"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
                title="Upload new avatar"
                aria-label="Upload new avatar"
              >
                {isUploadingAvatar ? <Spinner size="sm" /> : <Camera size={14} />}
              </button>
            </div>

            <div className="settings-card__avatar-info">
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

              <div className="settings-card__upload-actions">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  icon={Upload}
                  onClick={() => fileInputRef.current?.click()}
                  loading={isUploadingAvatar}
                  disabled={isUploadingAvatar}
                  className="settings-card__upload-btn"
                >
                  Upload New Avatar
                </Button>
                <span className="settings-card__upload-hint">JPG, PNG, or WEBP (max 5MB)</span>
              </div>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={onFileSelect}
              accept="image/png, image/jpeg, image/jpg, image/webp"
              style={{ display: 'none' }}
            />
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
              label="Email Address"
              name="email"
              type="email"
              value={user?.email || ''}
              disabled
              helperText="Email address associated with your account"
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
      </div>
    </div>
  );
}
