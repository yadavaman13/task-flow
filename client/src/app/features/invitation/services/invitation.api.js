import api from '@/lib/axios';

export const sendInvitation = async (workspaceId, { email, role }) => {
  const response = await api.post(`/invitations/workspaces/${workspaceId}/invitations`, { email, role });
  return response.data;
};

export const fetchWorkspaceInvitations = async (workspaceId) => {
  const response = await api.get(`/invitations/workspaces/${workspaceId}/invitations`);
  return response.data;
};

export const fetchPendingInvitations = async () => {
  const response = await api.get('/invitations/pending');
  return response.data;
};

export const acceptInvitation = async (payload) => {
  const body =
    typeof payload === 'object' && payload !== null
      ? payload
      : { token: payload, invitationId: payload, id: payload };
  const response = await api.post('/invitations/accept', body);
  return response.data;
};

export const declineInvitation = async (payload) => {
  const body =
    typeof payload === 'object' && payload !== null
      ? payload
      : { token: payload, invitationId: payload, id: payload };
  const response = await api.post('/invitations/decline', body);
  return response.data;
};

export const cancelInvitation = async (workspaceId, invitationId) => {
  const response = await api.patch(`/invitations/workspaces/${workspaceId}/invitations/${invitationId}/cancel`);
  return response.data;
};
