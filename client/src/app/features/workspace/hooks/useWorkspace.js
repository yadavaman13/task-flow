import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useWorkspaceContext } from '../context/workspace.context';
import {
  fetchWorkspaces,
  fetchWorkspace,
  createWorkspace,
  updateWorkspace,
  fetchWorkspaceMembers,
  updateMemberRole,
  removeMember,
} from '../services/workspace.api';

export function useWorkspace() {
  const {
    workspaces,
    setWorkspaces,
    selectedWorkspace,
    setSelectedWorkspace,
    members,
    setMembers,
    loading,
    setLoading,
    setError,
  } = useWorkspaceContext();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadWorkspaces = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchWorkspaces();
      const list = res.data || [];
      setWorkspaces(list);
      // Validate selectedWorkspace against the newly loaded workspaces
      setSelectedWorkspace((prev) => {
        if (!prev) return null;
        const exists = list.some((w) => (w.id || w._id) === (prev.id || prev._id));
        return exists ? prev : null;
      });
      return { success: true, data: list };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load workspaces';
      setError(msg);
      toast.error(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, [setLoading, setWorkspaces, setSelectedWorkspace, setError]);

  const loadWorkspace = useCallback(
    async (id) => {
      setLoading(true);
      try {
        const res = await fetchWorkspace(id);
        const ws = res.data || res;
        setSelectedWorkspace(ws);
        return { success: true, data: ws };
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to load workspace details';
        setError(msg);
        setSelectedWorkspace(null);
        toast.error(msg);
        return { success: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setSelectedWorkspace, setError]
  );

  const handleCreateWorkspace = async (data) => {
    setIsSubmitting(true);
    try {
      const res = await createWorkspace(data);
      const newWs = res.data || res;
      setWorkspaces((prev) => [newWs, ...prev]);
      toast.success(res.message || 'Workspace created successfully');
      return { success: true, data: newWs };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create workspace';
      toast.error(msg);
      return { success: false, error: msg };
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateWorkspace = async (id, data) => {
    setIsSubmitting(true);
    try {
      const res = await updateWorkspace(id, data);
      const updated = res.data || res;
      setSelectedWorkspace(updated);
      setWorkspaces((prev) => prev.map((w) => (w.id === id || w._id === id ? updated : w)));
      toast.success(res.message || 'Workspace updated successfully');
      return { success: true, data: updated };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update workspace';
      toast.error(msg);
      return { success: false, error: msg };
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadMembers = useCallback(
    async (id) => {
      try {
        const res = await fetchWorkspaceMembers(id);
        const memberList = res.data || [];
        setMembers(memberList);
        return { success: true, data: memberList };
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to load workspace members';
        toast.error(msg);
        return { success: false, error: msg };
      }
    },
    [setMembers]
  );

  const handleUpdateMemberRole = async (workspaceId, userId, role) => {
    try {
      const res = await updateMemberRole(workspaceId, userId, role);
      setMembers((prev) =>
        prev.map((m) => (m.id === userId || m.user_id === userId ? { ...m, role } : m))
      );
      toast.success(res.message || 'Member role updated');
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update member role';
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  const handleRemoveMember = async (workspaceId, userId) => {
    try {
      const res = await removeMember(workspaceId, userId);
      setMembers((prev) => prev.filter((m) => m.id !== userId && m.user_id !== userId));
      toast.success(res.message || 'Member removed from workspace');
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to remove member';
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  return {
    workspaces,
    selectedWorkspace,
    members,
    loading,
    isSubmitting,
    loadWorkspaces,
    loadWorkspace,
    handleCreateWorkspace,
    handleUpdateWorkspace,
    loadMembers,
    handleUpdateMemberRole,
    handleRemoveMember,
  };
}
