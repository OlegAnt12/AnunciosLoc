import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import notificationService from '../services/notificationService';

const NotificationsContext = createContext();

export const NotificationsProvider = ({ children }) => {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const refreshCount = useCallback(async () => {
    try {
      setLoading(true);
      const res = await notificationService.getCount();
      if (res && res.data && typeof res.data.data?.count === 'number') {
        setCount(res.data.data.count);
      }
    } catch (error) {
      console.log('Erro ao obter contagem de notificações:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      await refreshCount();
    } catch (error) {
      console.log('Erro ao marcar todas como lidas:', error);
      throw error;
    }
  }, [refreshCount]);

  useEffect(() => {
    refreshCount();
    const t = setInterval(refreshCount, 60 * 1000);
    return () => clearInterval(t);
  }, [refreshCount]);

  return (
    <NotificationsContext.Provider value={{ count, loading, refreshCount, markAllRead, setCount }}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationsContext);

export default NotificationsContext;