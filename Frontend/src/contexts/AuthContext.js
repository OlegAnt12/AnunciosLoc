import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/api';
import { API_BASE_URL } from '../services/api';
import pushNotificationService from '../services/pushNotificationService';

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
      
      if (token) {
        // Verify token with backend
        try {
          const response = await fetch(`${API_BASE_URL}/auth/verify`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (response.ok) {
            const result = await response.json();
            if (result.success) {
              setUser(result.data);
              setIsAuthenticated(true);
              // Update stored user data
              await AsyncStorage.setItem('userData', JSON.stringify(result.data));
              
              // Register for push notifications after authentication
              setTimeout(() => {
                pushNotificationService.registerForPushNotificationsAsync();
              }, 1000);
              
              setLoading(false);
              return;
            }
          }
        } catch (error) {
          console.error('Token verification failed:', error);
        }
      }
      
      // If no token or verification failed, clear storage
      await AsyncStorage.multiRemove(['userToken', 'userData']);
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error checking auth state:', error);
      await AsyncStorage.multiRemove(['userToken', 'userData']);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const result = await authService.login(credentials);
      
      if (result.success) {
        const normalized = result.data.user || result.data;
        setUser(normalized);
        setIsAuthenticated(true);
        // Persist token and userData
        if (result.data.token) {
          await AsyncStorage.setItem('userToken', result.data.token);
        }
        await AsyncStorage.setItem('userData', JSON.stringify(result.data));
        
        // Register for push notifications
        setTimeout(() => {
          pushNotificationService.registerForPushNotificationsAsync();
        }, 1000);
        
        return { success: true, data: normalized };
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
        const normalized = result.data.user || result.data;
        setUser(normalized);
        setIsAuthenticated(true);
        if (result.data.token) {
          await AsyncStorage.setItem('userToken', result.data.token);
        }
        await AsyncStorage.setItem('userData', JSON.stringify(result.data));
        
        // Register for push notifications
        setTimeout(() => {
          pushNotificationService.registerForPushNotificationsAsync();
        }, 1000);
        
        return { success: true, data: normalized };
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

  const updateUser = (userData) => {
    setUser(userData);
    AsyncStorage.setItem('userData', JSON.stringify(userData));
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