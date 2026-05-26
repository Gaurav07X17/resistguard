import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // On app load, restore session from localStorage
  useEffect(() => {
    const token     = localStorage.getItem('rg_token');
    const savedUser = localStorage.getItem('rg_user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { token, user } = res.data;
    localStorage.setItem('rg_token', token);
    localStorage.setItem('rg_user', JSON.stringify(user));
    setUser(user);
    return user;
  };

  const register = async (formData) => {
    const res = await authAPI.register(formData);
    const { token, user } = res.data;
    localStorage.setItem('rg_token', token);
    localStorage.setItem('rg_user', JSON.stringify(user));
    setUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem('rg_token');
    localStorage.removeItem('rg_user');
    setUser(null);
  };

  const isResearcher = user?.role === 'researcher' || user?.role === 'admin';
  const isTechnician = user?.role === 'technician';
  const isAdmin      = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isResearcher, isTechnician, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
