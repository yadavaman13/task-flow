import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useTaskContext } from '../context/task.context';
import {
  createTask,
  fetchProjectTasks,
  fetchTask,
  updateTask,
  updateTaskStatus,
  assignTask,
  deleteTask,
} from '../services/task.api';

export function useTask() {
  const {
    tasks,
    setTasks,
    selectedTask,
    setSelectedTask,
    loading,
    setLoading,
    setError,
  } = useTaskContext();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadProjectTasks = useCallback(
    async (projectId) => {
      setLoading(true);
      try {
        const res = await fetchProjectTasks(projectId);
        const list = res.data || [];
        setTasks(list);
        return { success: true, data: list };
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to load tasks';
        setError(msg);
        toast.error(msg);
        return { success: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setTasks, setError]
  );

  const loadTask = useCallback(
    async (taskId) => {
      setLoading(true);
      try {
        const res = await fetchTask(taskId);
        const data = res.data || res;
        setSelectedTask(data);
        return { success: true, data };
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to load task details';
        setError(msg);
        toast.error(msg);
        return { success: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setSelectedTask, setError]
  );

  const handleCreateTask = async (projectId, data) => {
    setIsSubmitting(true);
    try {
      const res = await createTask(projectId, data);
      const newTask = res.data || res;
      setTasks((prev) => [newTask, ...prev]);
      toast.success(res.message || 'Task created successfully');
      return { success: true, data: newTask };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create task';
      toast.error(msg);
      return { success: false, error: msg };
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTask = async (taskId, data) => {
    setIsSubmitting(true);
    try {
      const res = await updateTask(taskId, data);
      const updated = res.data || res;
      setSelectedTask(updated);
      setTasks((prev) => prev.map((t) => (t.id === taskId || t._id === taskId ? updated : t)));
      toast.success(res.message || 'Task updated successfully');
      return { success: true, data: updated };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update task';
      toast.error(msg);
      return { success: false, error: msg };
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId, status) => {
    try {
      const res = await updateTaskStatus(taskId, status);
      const updated = res.data || res;
      setSelectedTask((prev) => (prev && (prev.id === taskId || prev._id === taskId) ? { ...prev, status } : prev));
      setTasks((prev) => prev.map((t) => (t.id === taskId || t._id === taskId ? { ...t, status } : t)));
      toast.success('Task status updated');
      return { success: true, data: updated };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update status';
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  const handleAssignTask = async (taskId, assignedTo) => {
    try {
      const res = await assignTask(taskId, assignedTo);
      const updated = res.data || res;
      setSelectedTask((prev) => (prev && (prev.id === taskId || prev._id === taskId) ? { ...prev, assigned_to: assignedTo } : prev));
      setTasks((prev) => prev.map((t) => (t.id === taskId || t._id === taskId ? { ...t, assigned_to: assignedTo } : t)));
      toast.success('Task assignment updated');
      return { success: true, data: updated };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to assign task';
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const res = await deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId && t._id !== taskId));
      toast.success(res.message || 'Task deleted');
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete task';
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  return {
    tasks,
    selectedTask,
    loading,
    isSubmitting,
    loadProjectTasks,
    loadTask,
    handleCreateTask,
    handleUpdateTask,
    handleUpdateTaskStatus,
    handleAssignTask,
    handleDeleteTask,
  };
}
