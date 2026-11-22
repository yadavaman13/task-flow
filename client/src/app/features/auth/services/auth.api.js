import api from '@/lib/axios';

export const registerUser = async ({ name, email, password }) => {
  const response = await api.post('/auth/register', { name, email, password });
  return response.data;
};

export const loginUser = async ({ email, password }) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const getProfile = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const updateProfile = async ({ name, avatar_url }) => {
  const response = await api.patch('/auth/me', { name, avatar_url });
  return response.data;
};

export const changePassword = async ({ currentPassword, newPassword }) => {
  const response = await api.patch('/auth/me/password', { currentPassword, newPassword });
  return response.data;
};

export const sendVerificationOtp = async (email) => {
  const response = await api.post('/auth/send-verification-otp', { email });
  return response.data;
};

export const verifyOtp = async ({ email, otp }) => {
  const response = await api.post('/auth/verify-otp', { email, otp });
  return response.data;
};

export const logoutUser = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};
