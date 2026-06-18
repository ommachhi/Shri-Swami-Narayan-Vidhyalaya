import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      const adminInfo = localStorage.getItem('adminInfo');
      if (adminInfo) {
        try {
          const { data } = await api.get('/admin/me');
          setAdmin({ ...data, token: JSON.parse(adminInfo).token });
        } catch (error) {
          console.error('Auth failed', error);
          localStorage.removeItem('adminInfo');
        }
      }
      setLoading(false);
    };

    fetchMe();
  }, []);

  const login = async (username, password) => {
    const { data } = await api.post('/admin/login', { username, password });
    localStorage.setItem('adminInfo', JSON.stringify(data));
    setAdmin(data);
  };

  const logout = () => {
    localStorage.removeItem('adminInfo');
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
