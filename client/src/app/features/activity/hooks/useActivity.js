import { useState, useCallback } from 'react';
import { useActivityContext } from '../context/activity.context';
import {
  fetchWorkspaceActivity,
  fetchProjectActivity,
  fetchTaskActivity,
} from '../services/activity.api';

export function useActivity() {
  const { activities, setActivities, loading, setLoading, setError } = useActivityContext();

  const loadWorkspaceActivity = useCallback(
    async (workspaceId) => {
      setLoading(true);
      try {
        const res = await fetchWorkspaceActivity(workspaceId);
        const list = res.data || [];
        setActivities(list);
        return { success: true, data: list };
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to load activity log';
        setError(msg);
        return { success: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setActivities, setError]
  );

  const loadProjectActivity = useCallback(
    async (projectId) => {
      setLoading(true);
      try {
        const res = await fetchProjectActivity(projectId);
        const list = res.data || [];
        setActivities(list);
        return { success: true, data: list };
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to load project activity';
        setError(msg);
        return { success: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setActivities, setError]
  );

  const loadTaskActivity = useCallback(
    async (taskId) => {
      setLoading(true);
      try {
        const res = await fetchTaskActivity(taskId);
        const list = res.data || [];
        setActivities(list);
        return { success: true, data: list };
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to load task activity';
        setError(msg);
        return { success: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setActivities, setError]
  );

  return {
    activities,
    loading,
    loadWorkspaceActivity,
    loadProjectActivity,
    loadTaskActivity,
  };
}
