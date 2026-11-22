import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useProjectContext } from '../context/project.context';
import {
  createProject,
  fetchTeamProjects,
  fetchProject,
  updateProject,
  addProjectMember,
  fetchProjectMembers,
  removeProjectMember,
  archiveProject,
} from '../services/project.api';

export function useProject() {
  const {
    projects,
    setProjects,
    selectedProject,
    setSelectedProject,
    projectMembers,
    setProjectMembers,
    loading,
    setLoading,
    setError,
  } = useProjectContext();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadTeamProjects = useCallback(
    async (teamId) => {
      setLoading(true);
      try {
        const res = await fetchTeamProjects(teamId);
        const list = res.data || [];
        setProjects(list);
        return { success: true, data: list };
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to load team projects';
        setError(msg);
        toast.error(msg);
        return { success: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setProjects, setError]
  );

  const loadProject = useCallback(
    async (projectId) => {
      setLoading(true);
      try {
        const res = await fetchProject(projectId);
        const data = res.data || res;
        setSelectedProject(data);
        return { success: true, data };
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to load project details';
        setError(msg);
        toast.error(msg);
        return { success: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setSelectedProject, setError]
  );

  const handleCreateProject = async (teamId, data) => {
    setIsSubmitting(true);
    try {
      const res = await createProject(teamId, data);
      const newProj = res.data || res;
      setProjects((prev) => [newProj, ...prev]);
      toast.success(res.message || 'Project created successfully');
      return { success: true, data: newProj };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create project';
      toast.error(msg);
      return { success: false, error: msg };
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateProject = async (projectId, data) => {
    setIsSubmitting(true);
    try {
      const res = await updateProject(projectId, data);
      const updated = res.data || res;
      setSelectedProject(updated);
      setProjects((prev) => prev.map((p) => (p.id === projectId || p._id === projectId ? updated : p)));
      toast.success(res.message || 'Project updated successfully');
      return { success: true, data: updated };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update project';
      toast.error(msg);
      return { success: false, error: msg };
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadProjectMembers = useCallback(
    async (projectId) => {
      try {
        const res = await fetchProjectMembers(projectId);
        const list = res.data || [];
        setProjectMembers(list);
        return { success: true, data: list };
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to load project members';
        toast.error(msg);
        return { success: false, error: msg };
      }
    },
    [setProjectMembers]
  );

  const handleAddProjectMember = async (projectId, { userId, role }) => {
    try {
      const res = await addProjectMember(projectId, { userId, role });
      const newMember = res.data || res;
      setProjectMembers((prev) => [...prev, newMember]);
      toast.success(res.message || 'Member added to project');
      return { success: true, data: newMember };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add project member';
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  const handleRemoveProjectMember = async (projectId, userId) => {
    try {
      const res = await removeProjectMember(projectId, userId);
      setProjectMembers((prev) => prev.filter((m) => m.id !== userId && m.user_id !== userId));
      toast.success(res.message || 'Member removed from project');
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to remove member';
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  const handleArchiveProject = async (projectId) => {
    try {
      const res = await archiveProject(projectId);
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId || p._id === projectId ? { ...p, status: 'ARCHIVED' } : p))
      );
      toast.success(res.message || 'Project archived');
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to archive project';
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  return {
    projects,
    selectedProject,
    projectMembers,
    loading,
    isSubmitting,
    loadTeamProjects,
    loadProject,
    handleCreateProject,
    handleUpdateProject,
    loadProjectMembers,
    handleAddProjectMember,
    handleRemoveProjectMember,
    handleArchiveProject,
  };
}
