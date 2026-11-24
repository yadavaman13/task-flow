const TOKEN_KEY = 'taskflow_token';
const USER_KEY = 'taskflow_user';

export const storage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token) => localStorage.setItem(TOKEN_KEY, token),
  removeToken: () => localStorage.removeItem(TOKEN_KEY),

  getUser: () => {
    try {
      const user = localStorage.getItem(USER_KEY);
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },
  setUser: (user) => localStorage.setItem(USER_KEY, JSON.stringify(user)),
  removeUser: () => localStorage.removeItem(USER_KEY),

  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    // Clear any other taskflow items
    try {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('taskflow_')) {
          localStorage.removeItem(key);
        }
      });
    } catch {
      // Ignore localStorage access issues
    }
  },
};
