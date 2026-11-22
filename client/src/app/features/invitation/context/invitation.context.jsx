import { createContext, useContext, useState } from 'react';

export const InvitationContext = createContext(null);

export function InvitationProvider({ children }) {
  const [pendingInvitations, setPendingInvitations] = useState([]);
  const [workspaceInvitations, setWorkspaceInvitations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const value = {
    pendingInvitations,
    setPendingInvitations,
    workspaceInvitations,
    setWorkspaceInvitations,
    loading,
    setLoading,
    error,
    setError,
  };

  return <InvitationContext.Provider value={value}>{children}</InvitationContext.Provider>;
}

export function useInvitationContext() {
  const context = useContext(InvitationContext);
  if (!context) {
    throw new Error('useInvitationContext must be used within an InvitationProvider');
  }
  return context;
}
