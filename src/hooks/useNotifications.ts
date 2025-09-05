import { useState, useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { Notification } from '../types';
import { apiService } from '../services/api';
import { notificationService } from '../services/notifications';
import { useAuth } from './useAuth';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastCheckedRef = useRef<string | null>(null);
  const { isAuthenticated } = useAuth();

  // Cargar notificaciones inicialmente
  const loadNotifications = async (showLoading = true) => {
    if (!isAuthenticated) return;
    
    try {
      if (showLoading) setIsLoading(true);
      
      const fetchedNotifications = await apiService.getNotifications();
      setNotifications(fetchedNotifications);
      
      const unread = fetchedNotifications.filter(n => !n.isRead).length;
      setUnreadCount(unread);
      
      // Verificar si hay notificaciones nuevas desde la última verificación
      if (lastCheckedRef.current) {
        const newNotifications = fetchedNotifications.filter(
          n => n.createdAt > lastCheckedRef.current! && !n.isRead
        );
        
        // Mostrar notificaciones locales para las nuevas
        for (const notification of newNotifications) {
          await notificationService.scheduleLocalNotification(
            notification.title,
            notification.message
          );
        }
      }
      
      lastCheckedRef.current = new Date().toISOString();
      
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  // Marcar notificación como leída
  const markAsRead = async (notificationId: string) => {
    try {
      await apiService.markNotificationAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Configurar polling
  const startPolling = () => {
    if (intervalRef.current) return;
    
    // Verificar nuevas notificaciones cada 30 segundos
    intervalRef.current = setInterval(() => {
      loadNotifications(false);
    }, 30000);
  };

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Manejar cambios de estado de la app
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // App se volvió activa, verificar notificaciones
        loadNotifications(false);
        startPolling();
      } else {
        // App se fue a background, detener polling
        stopPolling();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
      stopPolling();
    };
  }, [isAuthenticated]);

  // Inicializar cuando el usuario se autentica
  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications();
      startPolling();
    } else {
      setNotifications([]);
      setUnreadCount(0);
      stopPolling();
    }

    return () => stopPolling();
  }, [isAuthenticated]);

  return {
    notifications,
    unreadCount,
    isLoading,
    loadNotifications,
    markAsRead,
    refresh: () => loadNotifications(true),
  };
};
