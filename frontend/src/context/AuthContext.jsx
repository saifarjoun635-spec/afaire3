import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../lib/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadMe = async () => {
    const token = localStorage.getItem('te_token');
    if (!token) { setLoading(false); return; }
    try {
      const { data } = await api.get('/auth/me');
      setUser(data);
    } catch (e) {
      localStorage.removeItem('te_token');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadMe(); }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('te_token', data.token);
    setUser(data.user);
    return data.user;
  };

  const setSession = (token, u) => {
    localStorage.setItem('te_token', token);
    setUser(u);
  };

  const logout = () => {
    localStorage.removeItem('te_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setSession, reload: loadMe }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
