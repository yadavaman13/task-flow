import { createContext, useContext, useState, useCallback } from 'react';

export const WorkspaceContext = createContext(null);

export function WorkspaceProvider({ children }) {
  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const resetWorkspaceState = useCallback(() => {
    setWorkspaces([]);
    setSelectedWorkspace(null);
    setMembers([]);
    setLoading(false);
    setError(null);
  }, []);

  const value = {
    workspaces,
    setWorkspaces,
    selectedWorkspace,
    setSelectedWorkspace,
    members,
    setMembers,
    loading,
    setLoading,
    error,
    setError,
    resetWorkspaceState,
  };

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspaceContext() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspaceContext must be used within a WorkspaceProvider');
  }
  return context;
}
