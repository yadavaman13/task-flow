import { createContext, useContext, useState } from 'react';

export const CommentContext = createContext(null);

export function CommentProvider({ children }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const value = {
    comments,
    setComments,
    loading,
    setLoading,
    error,
    setError,
  };

  return <CommentContext.Provider value={value}>{children}</CommentContext.Provider>;
}

export function useCommentContext() {
  const context = useContext(CommentContext);
  if (!context) {
    throw new Error('useCommentContext must be used within a CommentProvider');
  }
  return context;
}
