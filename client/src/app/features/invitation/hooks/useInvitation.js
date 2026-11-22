import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useInvitationContext } from '../context/invitation.context';
import {
  sendInvitation,
  fetchWorkspaceInvitations,
  fetchPendingInvitations,
  acceptInvitation,
  cancelInvitation,
} from '../services/invitation.api';

export function useInvitation() {
  const {
    pendingInvitations,
    setPendingInvitations,
    workspaceInvitations,
    setWorkspaceInvitations,
    loading,
    setLoading,
    setError,
  } = useInvitationContext();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadPendingInvitations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchPendingInvitations();
      const list = res.data || [];
      setPendingInvitations(list);
      return { success: true, data: list };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load pending invitations';
      setError(msg);
      toast.error(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, [setLoading, setPendingInvitations, setError]);

  const loadWorkspaceInvitations = useCallback(
    async (workspaceId) => {
      try {
        const res = await fetchWorkspaceInvitations(workspaceId);
        const list = res.data || [];
        setWorkspaceInvitations(list);
        return { success: true, data: list };
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to load workspace invitations';
        toast.error(msg);
        return { success: false, error: msg };
      }
    },
    [setWorkspaceInvitations]
  );

  const handleSendInvitation = async (workspaceId, { email, role }) => {
    setIsSubmitting(true);
    try {
      const res = await sendInvitation(workspaceId, { email, role });
      const newInv = res.data || res;
      setWorkspaceInvitations((prev) => [newInv, ...prev]);
      toast.success(res.message || 'Invitation sent successfully');
      return { success: true, data: newInv };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send invitation';
      toast.error(msg);
      return { success: false, error: msg };
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcceptInvitation = async (token) => {
    setIsSubmitting(true);
    try {
      const res = await acceptInvitation(token);
      setPendingInvitations((prev) => prev.filter((inv) => inv.token !== token));
      toast.success(res.message || 'Invitation accepted! Welcome to the workspace.');
      return { success: true, data: res.data };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to accept invitation';
      toast.error(msg);
      return { success: false, error: msg };
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelInvitation = async (workspaceId, invitationId) => {
    try {
      const res = await cancelInvitation(workspaceId, invitationId);
      setWorkspaceInvitations((prev) =>
        prev.map((inv) => (inv.id === invitationId ? { ...inv, status: 'CANCELLED' } : inv))
      );
      toast.success(res.message || 'Invitation cancelled');
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to cancel invitation';
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  return {
    pendingInvitations,
    workspaceInvitations,
    loading,
    isSubmitting,
    loadPendingInvitations,
    loadWorkspaceInvitations,
    handleSendInvitation,
    handleAcceptInvitation,
    handleCancelInvitation,
  };
}
