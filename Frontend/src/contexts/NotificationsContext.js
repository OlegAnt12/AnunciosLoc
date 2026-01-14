import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import notificationService from '@/services/notificationService';
import { useAuth } from '@/contexts/AuthContext';

const NotificationsContext = createContext();

export const useNotifications = () => {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider');
  return ctx;
};

export const NotificationsProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const refreshCount = useCallback(async () => {
    if (!isAuthenticated) {
      setCount(0);
      return 0;
    }

    setLoading(true);
    try {
      const res = await notificationService.getCount();
      const value = res.data?.count || 0;
      setCount(value);
      return value;
    } catch (error) {
      console.log('Erro ao obter contador de notificações', error);
      return 0;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Poll every 60s when authenticated
  useEffect(() => {
    let mounted = true;
    if (!isAuthenticated) return;

    (async () => {
      await refreshCount();
    })();

    const id = setInterval(() => {
      if (mounted) refreshCount();
    }, 60000);

    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [isAuthenticated, refreshCount]);

  useEffect(() => {
    if (!isAuthenticated) {
      setCount(0);
    }
  }, [isAuthenticated]);

  return (
    <NotificationsContext.Provider value={{ count, loading, refreshCount, setCount }}>
      {children}
    </NotificationsContext.Provider>
  );
};

export default NotificationsContext;
