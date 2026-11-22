import api from '@/lib/axios';

export const addComment = async (taskId, comment) => {
  const response = await api.post(`/tasks/${taskId}/comments`, { comment });
  return response.data;
};

export const fetchTaskComments = async (taskId) => {
  const response = await api.get(`/tasks/${taskId}/comments`);
  return response.data;
};

export const updateComment = async (commentId, comment) => {
  const response = await api.patch(`/comments/${commentId}`, { comment });
  return response.data;
};

export const deleteComment = async (commentId) => {
  const response = await api.delete(`/comments/${commentId}`);
  return response.data;
};
