import api from '@/lib/axios';

export const fetchWorkspaceStats = async (workspaceId) => {
  const response = await api.get(`/dashboard/workspace/${workspaceId}`);
  return response.data;
};

export const fetchTeamStats = async (teamId) => {
  const response = await api.get(`/dashboard/team/${teamId}`);
  return response.data;
};

export const fetchProjectStats = async (projectId) => {
  const response = await api.get(`/dashboard/project/${projectId}`);
  return response.data;
};

export const fetchProjectWorkload = async (projectId) => {
  const response = await api.get(`/dashboard/project/${projectId}/workload`);
  return response.data;
};
