import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.get('/api/is-authenticated/');
      console.log('Auth check response:', response.data); // Debug log
      
      if (response.data.isAuthenticated) {
        // Map the user object to use consistent property names
        const mappedUser = {
          username: response.data.user.username,
          firstName: response.data.user.first_name,
          lastName: response.data.user.last_name
        };
        console.log('Mapped user:', mappedUser); // Debug log
        setCurrentUser(mappedUser);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Authentication check failed:', error);
      // Token might be expired - clear it
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      delete api.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await api.post('/api/login/', { username, password });
      
      localStorage.setItem('accessToken', response.data.access_token);
      localStorage.setItem('refreshToken', response.data.refresh_token);
      
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
      
      // Get user info after login
      await checkAuthStatus();
      
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      return { 
        success: false, 
        message: error.response?.data?.detail || 'Login failed. Please try again.' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/api/register/', userData);
      
      localStorage.setItem('accessToken', response.data.access_token);
      localStorage.setItem('refreshToken', response.data.refresh_token);
      
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
      
      // Get user info after registration
      await checkAuthStatus();
      
      return { success: true };
    } catch (error) {
      console.error('Registration failed:', error);
      return { 
        success: false, 
        message: error.response?.data?.detail || 'Registration failed. Please try again.' 
      };
    }
  };

  const logout = async () => {
    try {
      await api.post('/api/logout/');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local storage and state, even if API call fails
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      delete api.defaults.headers.common['Authorization'];
      setCurrentUser(null);
      setIsAuthenticated(false);
    }
  };

  const value = {
    currentUser,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};