import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shortlistCount, setShortlistCount] = useState(0);

  const refreshUser = async () => {
    try {
      const res = await api.get('/api/auth/me');
      if (res.success && res.data?.user) {
        setUser(res.data.user);
        if (res.data.user.role === 'buyer') {
          fetchShortlistCount();
        }
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchShortlistCount = async () => {
    try {
      const res = await api.get('/api/buyer/shortlist');
      if (res.success && Array.isArray(res.data)) {
        setShortlistCount(res.data.length);
      }
    } catch (err) {
      // Ignore shortlist count error if not logged in
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password });
    if (res.success && res.data?.user) {
      setUser(res.data.user);
      if (res.data.user.role === 'buyer') {
        fetchShortlistCount();
      }
    }
    return res;
  };

  const register = async (userData) => {
    return api.post('/api/auth/register', userData);
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } finally {
      setUser(null);
      setShortlistCount(0);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        shortlistCount,
        setShortlistCount,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
