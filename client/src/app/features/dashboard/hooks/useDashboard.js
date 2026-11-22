import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useDashboardContext } from '../context/dashboard.context';
import {
  fetchWorkspaceStats,
  fetchProjectStats,
  fetchProjectWorkload,
} from '../services/dashboard.api';

export function useDashboard() {
  const {
    workspaceStats,
    setWorkspaceStats,
    projectStats,
    setProjectStats,
    workload,
    setWorkload,
    loading,
    setLoading,
    setError,
  } = useDashboardContext();

  const loadWorkspaceStats = useCallback(
    async (workspaceId) => {
      setLoading(true);
      try {
        const res = await fetchWorkspaceStats(workspaceId);
        const data = res.data || res;
        setWorkspaceStats(data);
        return { success: true, data };
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to load workspace stats';
        setError(msg);
        return { success: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setWorkspaceStats, setError]
  );

  const loadProjectStats = useCallback(
    async (projectId) => {
      setLoading(true);
      try {
        const res = await fetchProjectStats(projectId);
        const data = res.data || res;
        setProjectStats(data);
        return { success: true, data };
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to load project stats';
        setError(msg);
        return { success: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setProjectStats, setError]
  );

  const loadProjectWorkload = useCallback(
    async (projectId) => {
      try {
        const res = await fetchProjectWorkload(projectId);
        const list = res.data || [];
        setWorkload(list);
        return { success: true, data: list };
      } catch {
        return { success: false, data: [] };
      }
    },
    [setWorkload]
  );

  return {
    workspaceStats,
    projectStats,
    workload,
    loading,
    loadWorkspaceStats,
    loadProjectStats,
    loadProjectWorkload,
  };
}
