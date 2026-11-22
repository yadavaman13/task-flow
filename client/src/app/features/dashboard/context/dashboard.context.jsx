import { createContext, useContext, useState } from 'react';

export const DashboardContext = createContext(null);

export function DashboardProvider({ children }) {
  const [workspaceStats, setWorkspaceStats] = useState(null);
  const [projectStats, setProjectStats] = useState(null);
  const [workload, setWorkload] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const value = {
    workspaceStats,
    setWorkspaceStats,
    projectStats,
    setProjectStats,
    workload,
    setWorkload,
    loading,
    setLoading,
    error,
    setError,
  };

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboardContext() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboardContext must be used within a DashboardProvider');
  }
  return context;
}
