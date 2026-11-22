import { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '@/utils/storage';
import { getProfile } from '../services/auth.api';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => storage.getToken());
  const [user, setUserState] = useState(() => storage.getUser());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const setToken = (newToken) => {
    setTokenState(newToken);
    if (newToken) {
      storage.setToken(newToken);
    } else {
      storage.removeToken();
    }
  };

  const setUser = (newUser) => {
    setUserState(newUser);
    if (newUser) {
      storage.setUser(newUser);
    } else {
      storage.removeUser();
    }
  };

  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      const storedToken = storage.getToken();
      if (storedToken) {
        try {
          const res = await getProfile();
          if (isMounted) {
            const userData = res.data || res.user || res;
            setUser(userData);
          }
        } catch {
          if (isMounted) {
            setToken(null);
            setUser(null);
            storage.clear();
          }
        }
      }
      if (isMounted) {
        setLoading(false);
      }
    }

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token && user),
    loading,
    error,
    setUser,
    setToken,
    setError,
    setLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
