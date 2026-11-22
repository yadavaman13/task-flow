import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuthContext } from '../context/auth.context';
import {
  loginUser,
  registerUser,
  logoutUser,
  updateProfile,
  changePassword,
  sendVerificationOtp,
  verifyOtp,
  getProfile,
} from '../services/auth.api';

export function useAuth() {
  const { user, token, isAuthenticated, loading, setUser, setToken, setError } = useAuthContext();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (credentials) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await loginUser(credentials);
      const resData = res.data || res;
      const userToken = resData.token;
      const userData = resData.user;

      setToken(userToken);
      setUser(userData);
      toast.success(res.message || 'Logged in successfully');
      return { success: true, user: userData };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(msg);
      toast.error(msg);
      return { success: false, error: msg };
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (data) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await registerUser(data);
      const userData = res.data || res.user || res;
      toast.success(res.message || 'Registration successful');
      return { success: true, data: userData };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(msg);
      toast.error(msg);
      return { success: false, error: msg };
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {
      // ignore server logout error
    } finally {
      setToken(null);
      setUser(null);
      toast.success('Logged out successfully');
    }
  };

  const handleUpdateProfile = async (data) => {
    setIsSubmitting(true);
    try {
      const res = await updateProfile(data);
      const updatedUser = res.data || res.user || res;
      setUser(updatedUser);
      toast.success(res.message || 'Profile updated successfully');
      return { success: true, data: updatedUser };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update profile';
      toast.error(msg);
      return { success: false, error: msg };
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePassword = async (data) => {
    setIsSubmitting(true);
    try {
      const res = await changePassword(data);
      toast.success(res.message || 'Password changed successfully');
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to change password';
      toast.error(msg);
      return { success: false, error: msg };
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendOtp = async (email) => {
    try {
      const res = await sendVerificationOtp(email);
      toast.success(res.message || 'Verification code sent to email');
      return { success: true, data: res.data };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send verification code';
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  const handleVerifyOtp = async ({ email, otp }) => {
    setIsSubmitting(true);
    try {
      const res = await verifyOtp({ email, otp });
      toast.success(res.message || 'Email verified successfully');
      // refresh profile if logged in
      if (token) {
        const profileRes = await getProfile();
        setUser(profileRes.data || profileRes.user || profileRes);
      }
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid or expired verification code';
      toast.error(msg);
      return { success: false, error: msg };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    user,
    token,
    isAuthenticated,
    loading,
    isSubmitting,
    handleLogin,
    handleRegister,
    handleLogout,
    handleUpdateProfile,
    handleChangePassword,
    handleSendOtp,
    handleVerifyOtp,
  };
}
