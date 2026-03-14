import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('beni_token'));
  const [loading, setLoading] = useState(true);

  const setAuthToken = useCallback((newToken) => {
    if (newToken) {
      localStorage.setItem('beni_token', newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    } else {
      localStorage.removeItem('beni_token');
      delete axios.defaults.headers.common['Authorization'];
    }
    setToken(newToken);
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
          const response = await axios.get(`${API}/auth/me`);
          setAdmin(response.data);
        } catch (error) {
          console.error('Auth init error:', error);
          setAuthToken(null);
          setAdmin(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, [token, setAuthToken]);

  const login = async (email, password) => {
    const response = await axios.post(`${API}/auth/login`, { email, password });
    setAuthToken(response.data.access_token);
    setAdmin(response.data.admin);
    return response.data;
  };

  const register = async (email, password, name) => {
    const response = await axios.post(`${API}/auth/register`, { email, password, name });
    setAuthToken(response.data.access_token);
    setAdmin(response.data.admin);
    return response.data;
  };

  const logout = () => {
    setAuthToken(null);
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, token, loading, login, register, logout, isAuthenticated: !!admin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
