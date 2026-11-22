import api from '@/lib/axios';

export const fetchWorkspaceActivity = async (workspaceId) => {
  const response = await api.get(`/activity/workspace/${workspaceId}`);
  return response.data;
};

export const fetchProjectActivity = async (projectId) => {
  const response = await api.get(`/activity/project/${projectId}`);
  return response.data;
};

export const fetchTaskActivity = async (taskId) => {
  const response = await api.get(`/activity/task/${taskId}`);
  return response.data;
};
