import api from '@/lib/axios';

export const createTask = async (projectId, { title, description, priority = 'MEDIUM', dueDate }) => {
  const response = await api.post(`/projects/${projectId}/tasks`, { title, description, priority, dueDate });
  return response.data;
};

export const fetchProjectTasks = async (projectId) => {
  const response = await api.get(`/projects/${projectId}/tasks`);
  return response.data;
};

export const fetchTask = async (taskId) => {
  const response = await api.get(`/tasks/${taskId}`);
  return response.data;
};

export const updateTask = async (taskId, data) => {
  const response = await api.patch(`/tasks/${taskId}`, data);
  return response.data;
};

export const updateTaskStatus = async (taskId, status) => {
  const response = await api.patch(`/tasks/${taskId}/status`, { status });
  return response.data;
};

export const assignTask = async (taskId, assignedTo) => {
  const response = await api.patch(`/tasks/${taskId}/assign`, { assignedTo });
  return response.data;
};

export const deleteTask = async (taskId) => {
  const response = await api.delete(`/tasks/${taskId}`);
  return response.data;
};
