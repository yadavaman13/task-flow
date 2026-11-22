import api from '@/lib/axios';

export const createProject = async (teamId, { name, description, visibility = 'TEAM', status = 'ACTIVE' }) => {
  const response = await api.post(`/teams/${teamId}/projects`, { name, description, visibility, status });
  return response.data;
};

export const fetchTeamProjects = async (teamId) => {
  const response = await api.get(`/teams/${teamId}/projects`);
  return response.data;
};

export const fetchProject = async (projectId) => {
  const response = await api.get(`/projects/${projectId}`);
  return response.data;
};

export const updateProject = async (projectId, data) => {
  const response = await api.patch(`/projects/${projectId}`, data);
  return response.data;
};

export const addProjectMember = async (projectId, { userId, role }) => {
  const response = await api.post(`/projects/${projectId}/members`, { userId, role });
  return response.data;
};

export const fetchProjectMembers = async (projectId) => {
  const response = await api.get(`/projects/${projectId}/members`);
  return response.data;
};

export const removeProjectMember = async (projectId, userId) => {
  const response = await api.delete(`/projects/${projectId}/members/${userId}`);
  return response.data;
};

export const archiveProject = async (projectId) => {
  const response = await api.patch(`/projects/${projectId}/archive`);
  return response.data;
};
