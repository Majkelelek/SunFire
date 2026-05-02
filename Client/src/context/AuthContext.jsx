import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const isAuthenticated = await authService.checkAuth();
      setIsAdmin(isAuthenticated);
    } catch (error) {
      console.error("Auth check error:", error);
      setIsAdmin(false);
    } finally {
      setIsAuthLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    const res = await authService.login(username, password);
    setIsAdmin(true);
    return res;
  };

  const logout = async () => {
    await authService.logout();
    setIsAdmin(false);
  };

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <AuthContext.Provider value={{ isAdmin, setIsAdmin, checkAuth, login, logout, isAuthLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
