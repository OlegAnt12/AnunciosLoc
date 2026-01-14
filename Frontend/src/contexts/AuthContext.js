import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      const token = await AsyncStorage.getItem('userToken');
      
      if (userData && token) {
        const parsed = JSON.parse(userData);
        // Normalize stored payloads that may contain token/session metadata
        const actualUser = parsed.user || parsed;
        setUser(actualUser);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const result = await authService.login(credentials);
      
      if (result.success) {
        // result.data may contain { user, sessionId, token }
        const actualUser = result.data.user || result.data;
        setUser(actualUser);
        setIsAuthenticated(true);
        // Ensure we persist a normalized user object in storage (keep token separately)
        try {
          await AsyncStorage.setItem('userData', JSON.stringify(actualUser));
        } catch (err) {
          console.warn('Failed to persist normalized user data', err);
        }
        return { success: true, data: actualUser };
      } else {
        return { success: false, message: result.message };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const register = async (userData) => {
    try {
      const result = await authService.register(userData);
      
      if (result.success) {
        const actualUser = result.data || result.data?.user || result.data;
        setUser(actualUser);
        setIsAuthenticated(true);
        try {
          await AsyncStorage.setItem('userData', JSON.stringify(actualUser));
        } catch (err) {
          console.warn('Failed to persist normalized user data', err);
        }
        return { success: true, data: actualUser };
      } else {
        return { success: false, message: result.message };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const updateUser = async (userData) => {
    setUser(userData);
    try {
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
    } catch (err) {
      console.warn('Failed to persist userData in updateUser', err);
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;