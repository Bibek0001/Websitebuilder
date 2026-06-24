import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import api from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  authLoading: boolean; // true while /auth/me is in-flight on mount
}

const AuthContext = createContext<AuthContextType>({
  user: null, token: null,
  login: () => {}, logout: () => {},
  isAuthenticated: false, isSuperAdmin: false, authLoading: true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = sessionStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(
    () => sessionStorage.getItem('token')
  );
  // Start as true so route guards wait for server confirmation before rendering
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    // Clear any stale localStorage from old auth approach
    localStorage.removeItem('user');
    localStorage.removeItem('token');

    if (!token) {
      setAuthLoading(false);
      return;
    }

    // Re-validate token and get fresh user data from server
    api.get('/auth/me')
      .then(res => {
        const freshUser: User = res.data;
        setUser(freshUser);
        sessionStorage.setItem('user', JSON.stringify(freshUser));
      })
      .catch(() => {
        // Token invalid/expired — clear session
        setUser(null);
        setToken(null);
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('token');
      })
      .finally(() => setAuthLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = (userData: User, authToken: string) => {
    setUser(userData);
    setToken(authToken);
    sessionStorage.setItem('user', JSON.stringify(userData));
    sessionStorage.setItem('token', authToken);
  };

  const logout = () => {
    setUser(null); setToken(null);
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{
      user, token, login, logout,
      isAuthenticated: !!token,
      isSuperAdmin: user?.role === 'superadmin',
      authLoading,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
