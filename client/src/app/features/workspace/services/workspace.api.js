import api from '@/lib/axios';

export const fetchWorkspaces = async () => {
  const response = await api.get('/workspaces');
  return response.data;
};

export const fetchWorkspace = async (id) => {
  const response = await api.get(`/workspaces/${id}`);
  return response.data;
};

export const createWorkspace = async ({ name, description }) => {
  const response = await api.post('/workspaces', { name, description });
  return response.data;
};

export const updateWorkspace = async (id, { name, description }) => {
  const response = await api.patch(`/workspaces/${id}`, { name, description });
  return response.data;
};

export const fetchWorkspaceMembers = async (id) => {
  const response = await api.get(`/workspaces/${id}/members`);
  return response.data;
};

export const updateMemberRole = async (workspaceId, userId, role) => {
  const response = await api.patch(`/workspaces/${workspaceId}/members/${userId}`, { role });
  return response.data;
};

export const removeMember = async (workspaceId, userId) => {
  const response = await api.delete(`/workspaces/${workspaceId}/members/${userId}`);
  return response.data;
};
