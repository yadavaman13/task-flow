import api from '@/lib/axios';

export const createTeam = async (workspaceId, { name, description }) => {
  const response = await api.post(`/workspaces/${workspaceId}/teams`, { name, description });
  return response.data;
};

export const fetchWorkspaceTeams = async (workspaceId) => {
  const response = await api.get(`/workspaces/${workspaceId}/teams`);
  return response.data;
};

export const fetchTeam = async (teamId) => {
  const response = await api.get(`/teams/${teamId}`);
  return response.data;
};

export const updateTeam = async (teamId, { name, description }) => {
  const response = await api.patch(`/teams/${teamId}`, { name, description });
  return response.data;
};

export const addTeamMember = async (teamId, { userId, role }) => {
  const response = await api.post(`/teams/${teamId}/members`, { userId, role });
  return response.data;
};

export const fetchTeamMembers = async (teamId) => {
  const response = await api.get(`/teams/${teamId}/members`);
  return response.data;
};

export const removeTeamMember = async (teamId, userId) => {
  const response = await api.delete(`/teams/${teamId}/members/${userId}`);
  return response.data;
};

export const archiveTeam = async (teamId) => {
  const response = await api.patch(`/teams/${teamId}/archive`);
  return response.data;
};
