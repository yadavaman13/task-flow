import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useTeamContext } from '../context/team.context';
import {
  createTeam,
  fetchWorkspaceTeams,
  fetchTeam,
  updateTeam,
  addTeamMember,
  fetchTeamMembers,
  removeTeamMember,
  archiveTeam,
} from '../services/team.api';

export function useTeam() {
  const {
    teams,
    setTeams,
    selectedTeam,
    setSelectedTeam,
    teamMembers,
    setTeamMembers,
    loading,
    setLoading,
    setError,
  } = useTeamContext();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadWorkspaceTeams = useCallback(
    async (workspaceId) => {
      setLoading(true);
      try {
        const res = await fetchWorkspaceTeams(workspaceId);
        const list = res.data || [];
        setTeams(list);
        return { success: true, data: list };
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to load teams';
        setError(msg);
        toast.error(msg);
        return { success: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setTeams, setError]
  );

  const loadTeam = useCallback(
    async (teamId) => {
      setLoading(true);
      try {
        const res = await fetchTeam(teamId);
        const data = res.data || res;
        setSelectedTeam(data);
        return { success: true, data };
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to load team details';
        setError(msg);
        toast.error(msg);
        return { success: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setSelectedTeam, setError]
  );

  const handleCreateTeam = async (workspaceId, data) => {
    setIsSubmitting(true);
    try {
      const res = await createTeam(workspaceId, data);
      const newTeam = res.data || res;
      setTeams((prev) => [newTeam, ...prev]);
      toast.success(res.message || 'Team created successfully');
      return { success: true, data: newTeam };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create team';
      toast.error(msg);
      return { success: false, error: msg };
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTeam = async (teamId, data) => {
    setIsSubmitting(true);
    try {
      const res = await updateTeam(teamId, data);
      const updated = res.data || res;
      setSelectedTeam(updated);
      setTeams((prev) => prev.map((t) => (t.id === teamId || t._id === teamId ? updated : t)));
      toast.success(res.message || 'Team updated successfully');
      return { success: true, data: updated };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update team';
      toast.error(msg);
      return { success: false, error: msg };
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadTeamMembers = useCallback(
    async (teamId) => {
      try {
        const res = await fetchTeamMembers(teamId);
        const list = res.data || [];
        setTeamMembers(list);
        return { success: true, data: list };
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to load team members';
        toast.error(msg);
        return { success: false, error: msg };
      }
    },
    [setTeamMembers]
  );

  const handleAddTeamMember = async (teamId, { userId, role }) => {
    try {
      const res = await addTeamMember(teamId, { userId, role });
      const newMember = res.data || res;
      setTeamMembers((prev) => [...prev, newMember]);
      toast.success(res.message || 'Member added to team');
      return { success: true, data: newMember };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add team member';
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  const handleRemoveTeamMember = async (teamId, userId) => {
    try {
      const res = await removeTeamMember(teamId, userId);
      setTeamMembers((prev) => prev.filter((m) => m.id !== userId && m.user_id !== userId));
      toast.success(res.message || 'Member removed from team');
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to remove member from team';
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  const handleArchiveTeam = async (teamId) => {
    try {
      const res = await archiveTeam(teamId);
      setTeams((prev) =>
        prev.map((t) => (t.id === teamId || t._id === teamId ? { ...t, is_archived: true } : t))
      );
      toast.success(res.message || 'Team archived');
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to archive team';
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  return {
    teams,
    selectedTeam,
    teamMembers,
    loading,
    isSubmitting,
    loadWorkspaceTeams,
    loadTeam,
    handleCreateTeam,
    handleUpdateTeam,
    loadTeamMembers,
    handleAddTeamMember,
    handleRemoveTeamMember,
    handleArchiveTeam,
  };
}
