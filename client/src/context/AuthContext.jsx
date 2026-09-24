import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth on mount by verifying session cookie with /auth/me
  const initAuth = useCallback(async () => {
    try {
      setLoading(true);
      const res = await authService.getMe();
      if (res.success && res.data?.user) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const login = async (credentials) => {
    const res = await authService.login(credentials);
    if (res.success && res.data?.user) {
      setUser(res.data.user);
    }
    return res;
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    if (res.success && res.data?.user) {
      setUser(res.data.user);
    }
    return res;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  };

  const value = {
    user,
    role: user?.role,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isEmployee: user?.role === 'employee',
    loading,
    login,
    register,
    logout,
    refreshUser: initAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
