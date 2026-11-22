import { createContext, useContext, useState } from 'react';

export const TaskContext = createContext(null);

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const value = {
    tasks,
    setTasks,
    selectedTask,
    setSelectedTask,
    loading,
    setLoading,
    error,
    setError,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTaskContext() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
}
